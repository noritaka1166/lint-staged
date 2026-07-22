---
'lint-staged': minor
---

The chunking of tasks based on maximum command line argument length has been re-implemented to be more precise. Now the chunking happens based on the final generated command string, instead of just the list of staged files like previously. This benefits mainly Windows platforms and function commands like:

```js
/** @type {import('lint-staged').Configuration} */
export default {
  '*.ts': () => 'tsc', // Run "tsc" when any TS file is changed (for entire project)
}
```

Where the spawned command is literally `"tsc"` without any extra arguments. Previously, this was still chunked when a lot of files were staged. Now, it probably won't be chunked because the length of the command is just three letters.

Also, native JavaScript/Node.js function tasks won't be chunked at all, when previously they were run multiple times when chunked:

```js
/** @type {import('lint-staged').Configuration} */
export default {
  '*.js': {
    title: 'Log staged JS files to console',
    task: async (files) => {
      console.log('Staged JS files:', files)
    },
  },
}
```
