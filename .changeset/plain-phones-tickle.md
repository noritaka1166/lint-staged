---
'lint-staged': patch
---

Failed JS function tasks now properly kill other tasks, unless `--continue-on-error` is used. Previously their failure didn't affect other tasks.
