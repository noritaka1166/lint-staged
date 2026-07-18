import { describe, it, vi } from 'vitest'

import { Signal } from '../../lib/getAbortController.js'
import { getFunctionTask } from '../../lib/getFunctionTask.js'
import { getInitialState } from '../../lib/state.js'
import { TaskError } from '../../lib/symbols.js'

describe('getFunctionTask', () => {
  it('should return wrapped function task', async ({ expect }) => {
    const command = {
      title: 'My task',
      task: vi.fn(),
    }

    const abortController = new AbortController()

    const wrapped = await getFunctionTask({
      abortController,
      command,
      continueOnError: false,
      files: [{ filepath: 'file.js', status: 'M' }],
    })

    expect(wrapped).toEqual([
      {
        title: 'My task',
        task: expect.any(Function),
      },
    ])

    wrapped[0].task()

    expect(command.task).toHaveBeenCalledTimes(1)
    expect(command.task).toHaveBeenCalledExactlyOnceWith(['file.js'])
  })

  it('should wrap function task failure', async ({ expect }) => {
    const command = {
      title: 'My task',
      task: vi.fn().mockImplementation(async () => {
        throw new Error('test error')
      }),
    }

    const abortController = new AbortController()

    const wrapped = await getFunctionTask({
      abortController,
      command,
      continueOnError: false,
      files: [{ filepath: 'file.js', status: 'M' }],
    })

    expect(wrapped).toEqual([
      {
        title: 'My task',
        task: expect.any(Function),
      },
    ])

    const context = getInitialState()

    await expect(wrapped[0].task(context)).rejects.toThrow('My task [FAILED]')
    expect(context.errors.has(TaskError)).toEqual(true)
    expect(abortController.signal.aborted).toBe(true)
    expect(abortController.signal.reason).toBe(Signal.SIGKILL)
  })

  it('should not kill other tasks when using --continue-on-error', async ({ expect }) => {
    const command = {
      title: 'My task',
      task: vi.fn().mockImplementation(async () => {
        throw new Error('test error')
      }),
    }

    const abortController = new AbortController()

    const wrapped = await getFunctionTask({
      abortController,
      command,
      continueOnError: true,
      files: [{ filepath: 'file.js', status: 'M' }],
    })

    expect(wrapped).toEqual([
      {
        title: 'My task',
        task: expect.any(Function),
      },
    ])

    const context = getInitialState()

    await expect(wrapped[0].task(context)).rejects.toThrow('My task [FAILED]')
    expect(context.errors.has(TaskError)).toEqual(true)

    expect(abortController.signal.aborted).toBe(false)
  })
})
