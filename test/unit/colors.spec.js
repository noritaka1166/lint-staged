import { describe, suite, test } from 'vitest'

import { enableColors, green, red, dim, blue, bold, yellow } from '../../lib/colors.js'

suite('colors', () => {
  describe('color functions', async () => {
    enableColors(true)

    const colors = { green, red, dim, blue, bold, yellow }

    test.for([
      ['green', '\u001b[32m_\u001b[39m'],
      ['red', '\u001b[31m_\u001b[39m'],
      ['dim', '\u001b[2m_\u001b[22m'],
      ['blue', '\u001b[34m_\u001b[39m'],
      ['bold', '\u001b[1m_\u001b[22m'],
      ['yellow', '\u001b[33m_\u001b[39m'],
    ])("should format '_' in $0 as $1", ([color, expected], { expect }) => {
      expect(colors[color]('_')).toBe(expected)
    })
  })
})
