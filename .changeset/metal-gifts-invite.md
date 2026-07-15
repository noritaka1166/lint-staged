---
'lint-staged': minor
---

The console output of _lint-staged_ has been simplified so that there's less interactive spinners and more explicit messages like _"Started…_" -> "_Done!_". The primary purpose of this was to remove [`Listr2`](https://github.com/listr2/listr2), a very large dependency.

**Before:**

Fancy interactive spinners, but output dynamically changes:

```shell
✔ Backed up original state in git stash (0b191303)
✔ Running tasks for staged files...
✔ Staging changes from tasks...
✔ Cleaning up temporary files...
```

**After:**

Simpler but more explicit output:

```shell
⋯ Backing up original state…
✔ Done backing up original state (35b38ed1)!
⋯ Running tasks for staged files…
    *.js — 1 file
      ⋯ eslint --fix
    *.{json,md} — 1 file
      ⋯ prettier --write

✔ prettier --write
✔ eslint --fix

✔ Done running tasks for staged files!
⋯ Staging changes from tasks…
✔ Done staging changes from tasks!
⋯ Cleaning up temporary files…
✔ Done cleaning up temporary files!
```
