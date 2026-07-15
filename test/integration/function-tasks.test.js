import { describe, test } from 'vitest'

import * as figures from '../../lib/figures.js'
import { uglyJS } from './__fixtures__/files.js'
import { withGitIntegration } from './__utils__/withGitIntegration.js'

describe('lint-staged', () => {
  test(
    'supports function tasks',
    withGitIntegration(async ({ execGit, expect, gitCommit, writeFile }) => {
      await writeFile('file.js', uglyJS)
      await execGit(['add', '.'])

      const output = await gitCommit({
        lintStaged: {
          config: {
            '*.js': {
              title: 'function task title',
              task: (filenames) => `prettier --write ${filenames.join(' ')}`,
            },
          },
        },
      })

      expect(output).toMatch(`${figures.done} function task title`)
    })
  )
})
