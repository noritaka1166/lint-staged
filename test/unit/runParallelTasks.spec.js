import { describe, it, test, vi } from 'vitest'

import * as colors from '../../lib/colors.js'
import * as figures from '../../lib/figures.js'
import { parseConcurrency, runParallelTasks } from '../../lib/runParallelTasks.js'

const createTaskGroup = (title, task, skip = vi.fn(() => false)) => ({ title, task, skip })

const createTask = (title, task = vi.fn()) => ({ task, title })

const createLogger = () => ({
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
})

describe('runParallelTasks', () => {
  it('should run visible tasks and report their status', async ({ expect }) => {
    const ctx = {}
    const skipped = vi.fn()
    const first = vi.fn()
    const failure = vi.fn().mockRejectedValue(new Error('test'))
    const last = vi.fn()
    const logger = createLogger()

    const tasks = [
      createTaskGroup(
        'skipped config',
        [createTaskGroup('*.md', [createTask('skipped', skipped)])],
        () => true
      ),
      createTaskGroup('config', [
        createTaskGroup('*.css', [createTask('skipped', skipped)], () => true),
        createTaskGroup('*.js', [
          createTask('first', first),
          createTask('failure', failure),
          createTask('last', last),
        ]),
      ]),
    ]

    await runParallelTasks(ctx, tasks, {
      abortController: new AbortController(),
      logger,
    })

    expect(skipped).not.toHaveBeenCalled()
    expect(first).toHaveBeenCalledWith(ctx)
    expect(failure).toHaveBeenCalledWith(ctx)
    expect(last).toHaveBeenCalledWith(ctx)
    expect(logger.log.mock.calls.flat()).toEqual([
      colors.dim('    config'),
      colors.dim('      *.js'),
      colors.dim(`        ${figures.wip} first`),
      colors.dim(`        ${figures.wip} failure`),
      colors.dim(`        ${figures.wip} last`),
      '',
      `${figures.done} first`,
      `${figures.done} last`,
      '',
    ])
    expect(logger.error).toHaveBeenCalledExactlyOnceWith(colors.red(`${figures.error} failure`))
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it.for([
    ['serially when concurrent is false', false, 1],
    ['without a limit by default', undefined, 3],
    ['up to a numeric concurrency limit', 2, 2],
  ])('should run glob groups %s', async ([, concurrent, expected], { expect }) => {
    const gate = Promise.withResolvers()
    let active = 0
    let maxActive = 0
    const runs = Array.from({ length: 3 }, () =>
      vi.fn(async () => {
        active++
        maxActive = Math.max(maxActive, active)
        await gate.promise
        active--
      })
    )
    const tasks = runs.map((run, index) =>
      createTaskGroup(`config ${index}`, [
        createTaskGroup(`glob ${index}`, [createTask(`task ${index}`, run)]),
      ])
    )

    const promise = runParallelTasks({}, tasks, {
      abortController: new AbortController(),
      concurrent,
    })

    await vi.waitFor(() => expect(active).toBe(expected))
    gate.resolve()
    await promise

    expect(maxActive).toBe(expected)
    for (const run of runs) {
      expect(run).toHaveBeenCalledOnce()
    }
  })

  it('should run tasks within each glob serially', async ({ expect }) => {
    const gate = Promise.withResolvers()
    const first = vi.fn(() => gate.promise)
    const second = vi.fn()
    const parallel = vi.fn()
    const tasks = [
      createTaskGroup('config', [
        createTaskGroup('first glob', [createTask('first', first), createTask('second', second)]),
        createTaskGroup('second glob', [createTask('parallel', parallel)]),
      ]),
    ]

    const promise = runParallelTasks({}, tasks, {
      abortController: new AbortController(),
    })

    await vi.waitFor(() => expect(first).toHaveBeenCalledOnce())
    expect(second).not.toHaveBeenCalled()
    expect(parallel).toHaveBeenCalledOnce()

    gate.resolve()
    await promise

    expect(second).toHaveBeenCalledOnce()
  })

  it('should stop pending tasks when aborted', async ({ expect }) => {
    const gate = Promise.withResolvers()
    const abortController = new AbortController()
    const logger = createLogger()
    const first = vi.fn(() => gate.promise)
    const pending = vi.fn()
    const later = vi.fn()
    const tasks = [
      createTaskGroup('config', [
        createTaskGroup('first glob', [createTask('first', first), createTask('pending', pending)]),
        createTaskGroup('second glob', [createTask('later', later)]),
      ]),
    ]

    const promise = runParallelTasks({}, tasks, {
      abortController,
      concurrent: false,
      logger,
    })

    await vi.waitFor(() => expect(first).toHaveBeenCalledOnce())
    abortController.abort()
    gate.resolve()
    await promise

    expect(pending).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(`${figures.cancelled} pending`)

    expect(later).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(`${figures.cancelled} later`)
  })

  it('should handle an empty task list', async ({ expect }) => {
    const logger = createLogger()

    await runParallelTasks({}, [], {
      abortController: new AbortController(),
      logger,
    })

    expect(logger.log.mock.calls.flat()).toEqual(['', ''])
  })

  test('parseConcurrency', ({ expect }) => {
    expect(parseConcurrency(0)).toBe(1)
    expect(parseConcurrency(false)).toBe(1)
    expect(parseConcurrency(true)).toBe(Infinity)
    expect(parseConcurrency(42)).toBe(42)
    expect(parseConcurrency(0.4)).toBe(1)
    expect(parseConcurrency(1.2)).toBe(1)
    expect(parseConcurrency(NaN)).toBe(1)
  })
})
