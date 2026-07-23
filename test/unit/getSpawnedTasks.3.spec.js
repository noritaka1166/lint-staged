import { describe, it, vi } from 'vitest'

import { chunkFilesForCommand } from '../../lib/getSpawnedTasks.js'

describe('chunkFilesForCommand', () => {
  it.for([
    [undefined, ['a.js', 'b.js']],
    [Infinity, ['a.js', 'b.js']],
    [1, ['a.js']],
  ])(
    'does not chunk with maxArgLength $0 and files $1',
    async ([maxArgLength, files], { expect }) => {
      await expect(chunkFilesForCommand('lint', files, maxArgLength)).resolves.toEqual([
        { command: 'lint', files },
      ])
    }
  )

  it('chunks string commands while preserving file order', async ({ expect }) => {
    const files = ['a.js', 'b.js', 'c.js', 'd.js', 'e.js']

    await expect(chunkFilesForCommand('lint', files, 19)).resolves.toEqual([
      { command: 'lint', files: ['a.js', 'b.js', 'c.js'] },
      { command: 'lint', files: ['d.js', 'e.js'] },
    ])
  })

  it('reevaluates async function commands for each chunk', async ({ expect }) => {
    const files = ['a.js', 'b.js', 'c.js', 'd.js', 'e.js']
    const command = vi.fn(async (chunk) => `lint ${chunk.join(' ')}`)

    await expect(chunkFilesForCommand(command, files, 19)).resolves.toEqual([
      { command: 'lint a.js b.js c.js', files: ['a.js', 'b.js', 'c.js'] },
      { command: 'lint d.js e.js', files: ['d.js', 'e.js'] },
    ])
    expect(command).toHaveBeenCalledTimes(3)
    expect(command).toHaveBeenNthCalledWith(1, files)
    expect(command).toHaveBeenNthCalledWith(2, ['a.js', 'b.js', 'c.js'])
    expect(command).toHaveBeenNthCalledWith(3, ['d.js', 'e.js'])
  })

  it('chunks when any command returned by a function is too long', async ({ expect }) => {
    const command = (files) => [`lint ${files.join(' ')}`, `format ${files.join(' ')}`]

    await expect(chunkFilesForCommand(command, ['a.js', 'b.js'], 14)).resolves.toEqual([
      { command: 'lint a.js', files: ['a.js'] },
      { command: 'format a.js', files: ['a.js'] },
      { command: 'lint b.js', files: ['b.js'] },
      { command: 'format b.js', files: ['b.js'] },
    ])
  })

  it('passes a copy of the files to function commands', async ({ expect }) => {
    const files = ['a.js', 'b.js']
    const command = async (commandFiles) => {
      commandFiles.splice(0)
      return 'lint'
    }

    await expect(chunkFilesForCommand(command, files)).resolves.toEqual([
      { command: 'lint', files },
    ])
    expect(files).toEqual(['a.js', 'b.js'])
  })

  it.for([null, ['lint', null]])(
    'rejects an invalid function result: %j',
    async (result, { expect }) => {
      await expect(chunkFilesForCommand(() => result, ['a.js'])).rejects.toThrow(
        'Function task should return a string or an array of strings'
      )
    }
  )
})
