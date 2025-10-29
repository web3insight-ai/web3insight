"""
Author: Justin
Date: 2025-08-19 14:27:31
filename:
version:
Description:
LastEditTime: 2025-09-01 14:27:33
"""

import os
import sys
import re
import pandas as pd
from glob import glob

# 路径设置
RAW_DIR = "./data/data_raw"
CLEAN_DIR = "./data/data_clean"

os.makedirs(CLEAN_DIR, exist_ok=True)


### 1. 处理 actors 节点 ###
def clean_actors():
    df = pd.read_csv(f"{RAW_DIR}/actors.csv", low_memory=False)
    # 只保留 id 和 login 两列
    df = df[
        [
            "actor_id",
            "actor_login",
        ]
    ]
    df.rename(
        columns={
            "actor_id": "actor_id:ID(Actor)",
        },
        inplace=True,
    )
    df.to_csv(f"{CLEAN_DIR}/actors_neo4j_node.csv", index=False)
    print("✅ actors cleaned")


### 2. 处理 repos 节点 ###
def clean_repos():
    df = pd.read_csv(f"{RAW_DIR}/repos.csv", low_memory=False)

    df = df[
        [
            "repo_id",
            "repo_name",
            "upstream_marks",
            "created_at",
            "indexed",
        ]
    ]
    df.rename(
        columns={
            "repo_id": "repo_id:ID(Repo)",
        },
        inplace=True,
    )
    df.to_csv(f"{CLEAN_DIR}/repos_neo4j_node.csv", index=False)
    print("✅ repos cleaned")


### 3. 处理 events 边 ###
# 这里的边 是分为了多个文件的，
def clean_events_split(start_ym=None, end_ym=None):
    # 检查缺失节点文件...
    missing_repo_file = os.path.join(CLEAN_DIR, "missing_repo_ids.txt")
    missing_actor_file = os.path.join(CLEAN_DIR, "missing_actor_ids.txt")
    missing_repo_set = set()
    missing_actor_set = set()
    if os.path.exists(missing_repo_file):
        with open(missing_repo_file) as f:
            for line in f:
                line = line.strip()
                if line:
                    missing_repo_set.add(line)
    if os.path.exists(missing_actor_file):
        with open(missing_actor_file) as f:
            for line in f:
                line = line.strip()
                if line:
                    missing_actor_set.add(line)
    if missing_repo_set:
        print(
            f"🔍 检测到 {len(missing_repo_set)} 个缺失 repo_id，将在 clean 时过滤相关边。"
        )
    else:
        print("✅ 未检测到缺失 repo_id。")
    if missing_actor_set:
        print(
            f"🔍 检测到 {len(missing_actor_set)} 个缺失 actor_id，将在 clean 时过滤相关边。"
        )
    else:
        print("✅ 未检测到缺失 actor_id。")

    # 按年月过滤文件名
    event_files = sorted(glob(f"{RAW_DIR}/events_*.csv"))
    pattern = re.compile(r"events_(\d{4})_(\d{2})\.csv")
    file_months = []
    for f in event_files:
        m = pattern.search(os.path.basename(f))
        if m:
            y, mth = m.group(1), m.group(2)
            file_months.append((f, int(y) * 100 + int(mth)))
    # 处理时间区间参数
    if start_ym is not None:
        start = int(start_ym.replace("_", ""))
    else:
        start = min([fm[1] for fm in file_months]) if file_months else 0
    if end_ym is not None:
        end = int(end_ym.replace("_", ""))
    else:
        end = max([fm[1] for fm in file_months]) if file_months else 999999
    # 筛选文件
    target_files = [f for f, ym in file_months if start <= ym <= end]
    print(f"📅 处理事件分片文件区间：{start} 到 {end}，共 {len(target_files)} 个分片。")
    if not target_files:
        print("⚠️ 未找到符合条件的事件分片文件。")
        return

    for idx, file in enumerate(target_files):
        df = pd.read_csv(file, low_memory=False)
        before = len(df)
        # 只保留你想要的字段
        keep_cols = [
            "id",
            "actor_id",
            "repo_id",
            "org_id",
            "org_login",
            "event_type",
            "abnormal",
            "created_at",
        ]
        df = df[[col for col in keep_cols if col in df.columns]]
        # 字段重命名
        df.rename(
            columns={
                "id": "event_id",
                "actor_id": ":START_ID(Actor)",
                "repo_id": ":END_ID(Repo)",
            },
            inplace=True,
        )
        # 过滤异常 event（event_id 类型问题 或 两端缺失 node）
        if missing_repo_set:
            df = df[~df[":END_ID(Repo)"].astype(str).isin(missing_repo_set)]
        if missing_actor_set:
            df = df[~df[":START_ID(Actor)"].astype(str).isin(missing_actor_set)]
        after = len(df)
        df[":TYPE"] = "INTERACTS_WITH"
        reorder = [
            "event_id",
            ":START_ID(Actor)",
            ":END_ID(Repo)",
            "org_id",
            "org_login",
            "event_type",
            "abnormal",
            "created_at",
            ":TYPE",
        ]
        df = df[[col for col in reorder if col in df.columns]]
        basename = os.path.basename(file).replace("events_", "event_repo_edge_")
        out_path = os.path.join(CLEAN_DIR, basename)
        df.to_csv(
            out_path, index=False, header=(idx == 0)
        )  # 只有第一个有 header，后续的没有header 这是 Neo4j 导入要求
        print(
            f"✅ cleaned: {basename}（原始 {before} 条，过滤后 {after} 条，header: {idx==0}）"
        )
    print("🎉 All events cleaned and saved as legal edges in data_clean/.")


### 4. 检查 events 边文件是否有引用缺失节点 ###
def check_nodes():
    repo_file = os.path.join(RAW_DIR, "repos.csv")
    actor_file = os.path.join(RAW_DIR, "actors.csv")
    if not os.path.exists(repo_file):
        print(f"❌ repo 节点文件不存在: {repo_file}")
        return
    if not os.path.exists(actor_file):
        print(f"❌ actor 节点文件不存在: {actor_file}")
        return

    repos = pd.read_csv(repo_file, low_memory=False)
    actors = pd.read_csv(actor_file, low_memory=False)
    repo_ids = set(repos["repo_id"])
    actor_ids = set(actors["actor_id"])

    all_missing_repo = set()
    all_missing_actor = set()

    for file in sorted(glob(f"{RAW_DIR}/events_*.csv")):
        df = pd.read_csv(file, low_memory=False)
        # 检查 :END_ID(Repo)
        if "repo_id" in df.columns:
            missing_repo = df.loc[~df["repo_id"].isin(repo_ids), "repo_id"]
            if not missing_repo.empty:
                print(
                    f"❗ 文件 {os.path.basename(file)} 中引用了 {missing_repo.nunique()} 个缺失 repo_id，共 {len(missing_repo)} 条边。"
                )
                print(
                    "   缺失 repo_id 示例: ",
                    list(missing_repo.value_counts().index[:5]),
                )
                all_missing_repo.update(missing_repo.unique())
            else:
                print(f"✅ 文件 {os.path.basename(file)} 无缺失 repo_id。")
        else:
            print(f"⚠️ 文件缺少 :END_ID(Repo) 列: {file}")

        # 检查 :START_ID(Actor)
        if "actor_id" in df.columns:
            missing_actor = df.loc[~df["actor_id"].isin(actor_ids), "actor_id"]
            if not missing_actor.empty:
                print(
                    f"❗ 文件 {os.path.basename(file)} 中引用了 {missing_actor.nunique()} 个缺失 actor_id，共 {len(missing_actor)} 条边。"
                )
                print(
                    "   缺失 actor_id 示例: ",
                    list(missing_actor.value_counts().index[:5]),
                )
                all_missing_actor.update(missing_actor.unique())
            else:
                print(f"✅ 文件 {os.path.basename(file)} 无缺失 actor_id。")
        else:
            print(f"⚠️ 文件缺少 :START_ID(Actor) 列: {file}")

    # 保存所有缺失 repo_id
    if all_missing_repo:
        with open(os.path.join(CLEAN_DIR, "missing_repo_ids.txt"), "w") as f:
            for rid in sorted(all_missing_repo):
                f.write(str(rid) + "\n")
        print(
            f"🔍 所有缺失 repo_id 已保存到 missing_repo_ids.txt，数量: {len(all_missing_repo)}"
        )
    else:
        print("🎉 所有边文件均无引用缺失 repo 节点。")

    # 保存所有缺失 actor_id
    if all_missing_actor:
        with open(os.path.join(CLEAN_DIR, "missing_actor_ids.txt"), "w") as f:
            for aid in sorted(all_missing_actor):
                f.write(str(aid) + "\n")
        print(
            f"🔍 所有缺失 actor_id 已保存到 missing_actor_ids.txt，数量: {len(all_missing_actor)}"
        )
    else:
        print("🎉 所有边文件均无引用缺失 actor 节点。")


def print_usage():
    print(
        """
        用法: python clean.py [step] [start_ym] [end_ym]

        step 可选: 
        actors         # 清洗 actors 节点
        repos          # 清洗 repos 节点
        events         # 清洗 events 边，支持可选年月区间（如 2024_06 2024_08）
        check_nodes    # 检查边引用的节点是否缺失
        all            # 执行全部步骤（actors + repos + events）

        示例:
        python clean.py actors
        python clean.py repos
        python clean.py events 2024_06 2024_08
        python clean.py check_nodes
        python clean.py all
        """
    )


# 主逻辑参数解析
if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] == "all":
        clean_actors()
        clean_repos()
        clean_events_split()
        print("🎉 All done!")
    else:
        step = sys.argv[1].lower()
        if step == "actors":
            clean_actors()
        elif step == "repos":
            clean_repos()
        elif step == "events":
            # 支持 events 2024_06 2024_08
            arg1 = sys.argv[2] if len(sys.argv) > 2 else None
            arg2 = sys.argv[3] if len(sys.argv) > 3 else None
            # 处理默认时间范围
            if arg1 is None:
                arg1 = "2015_01"
            if arg2 is None:
                arg2 = "2025_12"
            clean_events_split(arg1, arg2)
        elif step == "check_nodes":
            check_nodes()
        else:
            print_usage()
