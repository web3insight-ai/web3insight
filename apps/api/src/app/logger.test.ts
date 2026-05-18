import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

/**
 * First unit test in the monorepo — covers the structured logger module.
 *
 * Asserts the contract that downstream services (Hono middleware, oRPC
 * interceptor, sync services) depend on:
 *   - emit valid JSON
 *   - filter by LOG_LEVEL
 *   - merge child bindings into every line
 *   - route warn/error to stderr, info/debug to stdout
 */
describe('logger', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  const originalLevel = process.env.LOG_LEVEL;

  beforeEach(() => {
    stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    if (originalLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLevel;
    }
  });

  it('emits a single JSON line per call', () => {
    process.env.LOG_LEVEL = 'debug';
    logger.info('hello', { reqId: 'r1' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const raw = stdoutSpy.mock.calls[0]?.[0] as string;
    expect(raw.endsWith('\n')).toBe(true);

    const parsed = JSON.parse(raw.trimEnd()) as Record<string, unknown>;
    expect(parsed.level).toBe('info');
    expect(parsed.msg).toBe('hello');
    expect(parsed.reqId).toBe('r1');
    expect(parsed.app).toBe('web3insight-api');
    expect(typeof parsed.time).toBe('string');
  });

  it('routes warn and error to stderr', () => {
    process.env.LOG_LEVEL = 'debug';
    logger.warn('careful');
    logger.error('boom');

    expect(stderrSpy).toHaveBeenCalledTimes(2);
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('respects LOG_LEVEL threshold', () => {
    process.env.LOG_LEVEL = 'warn';
    logger.debug('hidden');
    logger.info('hidden');
    logger.warn('shown');

    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).toHaveBeenCalledTimes(1);
  });

  it('child() bindings cascade into every line', () => {
    process.env.LOG_LEVEL = 'debug';
    const child = logger.child({ service: 'donate' });
    child.info('listed', { count: 42 });

    const raw = stdoutSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(raw.trimEnd()) as Record<string, unknown>;
    expect(parsed.service).toBe('donate');
    expect(parsed.count).toBe(42);
    expect(parsed.app).toBe('web3insight-api');
  });
});
