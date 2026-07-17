---
'lint-staged': minor
---

The console output of _lint-staged_ has been simplified so that there's less interactive spinners and more explicit messages like _"Started…_" -> "_Done!_". The primary purpose of this was to remove [`Listr2`](https://github.com/listr2/listr2), a very large dependency.

**Before:**

- size of `node_modules/` after installing: `1561.7 kB` with 29 packages
- running `node bin/lint-staged.js` in its own repo with 1 staged file: `345 ms` (n=10)
- running `node bin/lint-staged.js` in its own repo with 28 staged files: `714 ms` (n=10)
- package size: `46.8 kB`
- unpacked size: `157.3 kB`

Fancy interactive spinners, but output dynamically changes:

```shell
✔ Backed up original state in git stash (0b191303)
✔ Running tasks for staged files...
✔ Staging changes from tasks...
✔ Cleaning up temporary files...
```

**After:**

- size of `node_modules/` after installing: `972.6 kB` with 5 packages (37.7 % smaller, 82.7 % less transitive dependencies)
- running `node bin/lint-staged.js` in its own repo with 1 staged file: `302 ms` (n=10) (12.5 % faster)
- running `node bin/lint-staged.js` in its own repo with 28 staged files: `686 ms` (n=10) (3.9 % faster)
- package size: `47.2 kB` (0.9 % larger)
- unpacked size: `160.6 kB` (2.1 % larger)

Simpler but more explicit output:

```shell
⋯ Backing up original state…
✔ Done backing up original state (35b38ed1)!
⋯ Running tasks for staged files…
    *.js — 1 file
      ⋯ oxlint --fix
    *.{json,md} — 1 file
      ⋯ oxfmt --write

✔ oxfmt --write
✔ oxlint --fix

✔ Done running tasks for staged files!
⋯ Staging changes from tasks…
✔ Done staging changes from tasks!
⋯ Cleaning up temporary files…
✔ Done cleaning up temporary files!
```
