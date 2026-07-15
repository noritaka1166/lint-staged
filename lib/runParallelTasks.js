import * as colors from './colors.js'
import * as figures from './figures.js'

/**
 * @param {Object} ctx
 * @param {Array} tasks
 * @param {Object} options
 * @param {AbortController} abortController
 * @param {Number | boolean} [options.concurrent=true] Boolean value for whether to run concurrently,
 * or a number value controls the number of concurrent executions
 */
export const runParallelTasks = async (
  ctx,
  tasks,
  { abortController, concurrent = true, logger }
) => {
  let concurrency = concurrent
  if (concurrency === false) {
    concurrency = 1
  } else if (concurrency === true) {
    concurrency = Infinity
  }

  const indent = tasks.length > 1 ? '    ' : '  '
  const allPerGlobTasks = []

  // the array of actual tasks is split per config and per glob
  for (const perConfig of tasks) {
    if (perConfig.skip()) {
      continue
    }

    // display name of config only when there are multiple
    if (tasks.length > 1) {
      logger?.log(colors.dim(`${indent}${perConfig.title}`))
    }

    for (const perGlob of perConfig.task) {
      if (perGlob.skip()) {
        continue
      }

      logger?.log(colors.dim(`${indent}  ${perGlob.title}`))

      for (const task of perGlob.task) {
        logger?.log(colors.dim(`${indent}    ${figures.wip} ${task.title}`))
      }
      // per-glob tasks run serially
      allPerGlobTasks.push(perGlob.task)
    }
  }

  logger?.log('') // empty line before all tasks

  const runSequential = async (tasks) => {
    for (const { title, task } of tasks) {
      if (abortController.signal.aborted) {
        logger?.warn(`${figures.cancelled} ${title}`)
        break
      }

      try {
        await task(ctx)
        logger?.log(`${figures.done} ${title}`)
      } catch {
        logger?.error(colors.red(`${figures.error} ${title}`))
      }
    }
  }

  let next = 0
  const worker = async () => {
    while (!abortController.signal.aborted) {
      const index = next++

      if (index >= allPerGlobTasks.length) {
        return
      }

      const perGlobTasks = allPerGlobTasks[index]
      await runSequential(perGlobTasks)
    }
  }

  await Promise.all(Array.from({ length: Math.min(allPerGlobTasks.length, concurrency) }, worker))

  logger?.log('') // empty line after all tasks
}
