---
'lint-staged': minor
---

The console output of _lint-staged_ has been simplified so that there's less interactive spinners and more explicit messages like _"Started…_" -> "_Done!_". The goal of this is to reduce the usage of [`Listr2`](https://github.com/listr2/listr2), a very large dependency.

**Before:**

```shell
✔ Backed up original state in git stash (0b191303)
✔ Running tasks for staged files...
✔ Staging changes from tasks...
✔ Cleaning up temporary files...
```

**After:**

```shell
⋯ Backing up original state…
✔ Done backing up original state (b54719f3)!
✔ Running tasks for staged files...
⋯ Staging changes from tasks…
✔ Done staging changes from tasks!
⋯ Cleaning up temporary files…
✔ Done cleaning up temporary files!
```
