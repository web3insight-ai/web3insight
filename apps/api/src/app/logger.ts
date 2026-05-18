/**
 * Tiny structured logger for the Hono runtime + Vercel functions.
 *
 * Emits one JSON line per call to stdout/stderr so Vercel's log drains
 * (and any downstream observability tool) can parse them without regex.
 * Avoids pulling pino into the bundle — we already ship 18.5 MB and the
 * Vercel runtime only needs the minimum.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

type Bindings = Record<string, unknown>;

export interface Logger {
  debug(msg: string, fields?: Bindings): void;
  info(msg: string, fields?: Bindings): void;
  warn(msg: string, fields?: Bindings): void;
  error(msg: string, fields?: Bindings): void;
  child(bindings: Bindings): Logger;
}

const LEVELS: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function envLevel(): Level {
  const raw = (process.env.LOG_LEVEL ?? '').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function emit(level: Level, msg: string, bindings: Bindings): void {
  if (LEVELS[level] < LEVELS[envLevel()]) return;
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...bindings,
  });
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

function buildLogger(bindings: Bindings): Logger {
  return {
    debug: (msg, fields) => emit('debug', msg, { ...bindings, ...fields }),
    info: (msg, fields) => emit('info', msg, { ...bindings, ...fields }),
    warn: (msg, fields) => emit('warn', msg, { ...bindings, ...fields }),
    error: (msg, fields) => emit('error', msg, { ...bindings, ...fields }),
    child: (extra) => buildLogger({ ...bindings, ...extra }),
  };
}

export const logger: Logger = buildLogger({
  app: 'web3insight-api',
});
