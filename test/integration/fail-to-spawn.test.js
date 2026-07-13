import { describe, test } from 'vitest'

import { addConfigFileSerializer } from './__utils__/addConfigFileSerializer.js'
import { withGitIntegration } from './__utils__/withGitIntegration.js'

describe('lint-staged', () => {
  addConfigFileSerializer()

  test(
    'logs error when spawning fails',
    withGitIntegration(async ({ execGit, expect, gitCommit, writeFile }) => {
      await writeFile(
        'lint-staged.config.js',
        `export default {
          "*.js": "cmd-not-found"
        }`
      )

      await execGit(['add', '.'])

      await expect(gitCommit()).rejects.toThrow('cmd-not-found')
    })
  )
})
