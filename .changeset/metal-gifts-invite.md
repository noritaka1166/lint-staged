---
'lint-staged': minor
---

The console output of _lint-staged_ has been simplified so that there's less interactive spinners and more explicit messages like _"Started…_" -> "_Done!_". The primary purpose of this was to remove [`Listr2`](https://github.com/listr2/listr2), a very large dependency.

**Before:**

- size of `node_modules/` after installing: `1561.7 kB` with 29 packages
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

- size of `node_modules/` after installing: `991.6 kB` with 5 packages (36.5 % smaller, 82.7 % less transitive dependencies)
- running `node bin/lint-staged.js` in its own repo with 28 staged files: `686 ms` (n=10) (3.9 % faster)
- package size: `46.9 kB` (0.2 % larger)
- unpacked size: `159.1 kB` (1.1 % larger)

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
