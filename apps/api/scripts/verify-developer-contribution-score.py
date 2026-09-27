#!/usr/bin/env python3
"""Run the PR score query against an isolated, temporary local PostgreSQL cluster."""

from __future__ import annotations

import re
import shlex
import shutil
import socket
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
QUERY_FILE = SCRIPT_DIR / "developer-contribution-score.sql"
FIXTURE_FILE = SCRIPT_DIR / "fixtures" / "developer-contribution-score.sql"
TEST_USER = "score_test"
TEST_DATABASE = "score_test"
TEST_PARAMS = {
    1: "ARRAY['ethereum', 'solana']",
    2: "'2026-09-24 00:00:00+00'",
    3: "365",
    4: "180",
    5: "180",
    6: "10",
}
EXPECTED = [
    ("ecosystem", "ethereum", "1", "10", "alice", Decimal("11"), Decimal("7.767767")),
    ("ecosystem", "ethereum", "2", "20", "bob", Decimal("1"), Decimal("1")),
    ("ecosystem", "ethereum", "3", "25", "carol", Decimal("1"), Decimal("1")),
    ("ecosystem", "solana", "1", "10", "alice", Decimal("5"), Decimal("5")),
    ("ecosystem", "solana", "2", "60", "dave", Decimal("1"), Decimal("1")),
    ("web3", "all", "1", "10", "alice", Decimal("11"), Decimal("7.767767")),
    ("web3", "all", "2", "60", "dave", Decimal("2"), Decimal("1.353553")),
    ("web3", "all", "3", "20", "bob", Decimal("1"), Decimal("1")),
    ("web3", "all", "4", "25", "carol", Decimal("1"), Decimal("1")),
]
SCORE_TOLERANCE = Decimal("0.000001")
EXPECTED_LAST_ACTIVITY = datetime(2026, 9, 24, tzinfo=timezone.utc)


def command_path(name: str, bindir: Path) -> str:
    candidate = bindir / name
    if candidate.is_file():
        return str(candidate)
    located = shutil.which(name)
    if located:
        return located
    raise RuntimeError(f"Required PostgreSQL command not found: {name}")


def run(args: list[str], *, capture: bool = False) -> str:
    result = subprocess.run(
        args,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        if result.stdout:
            print(result.stdout, file=sys.stderr, end="")
        if result.stderr:
            print(result.stderr, file=sys.stderr, end="")
        raise RuntimeError(f"Command failed with exit code {result.returncode}: {args[0]}")
    return result.stdout if capture else ""


def render_test_query() -> str:
    query = QUERY_FILE.read_text(encoding="utf-8")
    for index, value in TEST_PARAMS.items():
        query, replacements = re.subn(rf"\${index}(?=::)", value, query)
        if replacements < 1:
            raise RuntimeError(f"Bind parameter ${index} was not found")
    if re.search(r"\$[1-6](?=::)", query):
        raise RuntimeError("An SQL bind parameter was not replaced for the fixture run")
    return query


def main() -> int:
    pg_config = shutil.which("pg_config")
    if not pg_config:
        raise RuntimeError("pg_config is required to locate local PostgreSQL binaries")
    bindir = Path(run([pg_config, "--bindir"], capture=True).strip())
    initdb = command_path("initdb", bindir)
    pg_ctl = command_path("pg_ctl", bindir)
    createdb = command_path("createdb", bindir)
    psql = command_path("psql", bindir)

    with socket.socket() as port_probe:
        port_probe.bind(("127.0.0.1", 0))
        port = port_probe.getsockname()[1]

    with tempfile.TemporaryDirectory(prefix="web3insight-score-") as temp_name:
        temp_dir = Path(temp_name)
        data_dir = temp_dir / "data"
        log_file = temp_dir / "postgres.log"
        started = False
        try:
            run(
                [
                    initdb,
                    "-D",
                    str(data_dir),
                    "--no-locale",
                    "--encoding=UTF8",
                    f"--username={TEST_USER}",
                    "--auth-local=trust",
                    "--auth-host=reject",
                ]
            )
            options = (
                "-c listen_addresses='' "
                f"-k {shlex.quote(str(temp_dir))} "
                f"-p {port}"
            )
            run(
                [
                    pg_ctl,
                    "-D",
                    str(data_dir),
                    "-o",
                    options,
                    "-l",
                    str(log_file),
                    "start",
                ]
            )
            started = True

            connection = [
                "-h",
                str(temp_dir),
                "-p",
                str(port),
                "-U",
                TEST_USER,
                "-d",
                TEST_DATABASE,
            ]
            run([createdb, *connection[:-2], TEST_DATABASE])
            run(
                [
                    psql,
                    *connection,
                    "-v",
                    "ON_ERROR_STOP=1",
                    "-f",
                    str(FIXTURE_FILE),
                ]
            )

            rendered_query = temp_dir / "score-query.sql"
            rendered_query.write_text(render_test_query(), encoding="utf-8")
            output = run(
                [
                    psql,
                    *connection,
                    "-v",
                    "ON_ERROR_STOP=1",
                    "-A",
                    "-t",
                    "-F",
                    "\t",
                    "-f",
                    str(rendered_query),
                ],
                capture=True,
            )
            actual = []
            for line in output.splitlines():
                if not line.strip():
                    continue
                columns = line.split("\t")
                if len(columns) != 8:
                    raise RuntimeError("Expected eight score-query output columns")
                raw_points = Decimal(columns[5])
                contribution_score = Decimal(columns[6])
                if not raw_points.is_finite() or not contribution_score.is_finite():
                    raise RuntimeError("Query returned a non-finite score")
                if datetime.fromisoformat(columns[7]) != EXPECTED_LAST_ACTIVITY:
                    raise RuntimeError("Query returned an unexpected last author-activity timestamp")
                actual.append((*columns[:5], raw_points, contribution_score))

            rows_match = len(actual) == len(EXPECTED) and all(
                row[:6] == expected[:6]
                and abs(row[6] - expected[6]) <= SCORE_TOLERANCE
                for row, expected in zip(actual, EXPECTED)
            )
            if not rows_match:
                print("Expected rows:", EXPECTED, file=sys.stderr)
                print("Actual rows:  ", actual, file=sys.stderr)
                return 1

            print(
                f"PASS: {len(EXPECTED)} expected rankings and finite decayed scores; "
                "latest author-activity timestamps match; "
                "active authors retain lookback contributions within each scope, "
                "event actors were not credited for "
                "label/merge actions, repeated PR events counted once, "
                "stale and bot authors omitted."
            )
            return 0
        finally:
            if started:
                subprocess.run(
                    [pg_ctl, "-D", str(data_dir), "-m", "fast", "stop"],
                    check=False,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Verification failed: {error}", file=sys.stderr)
        raise SystemExit(1)
