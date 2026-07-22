---
'lint-staged': patch
---

It's now possible to set `--max-arg-length=Infinity` to effectively disable chunking of tasks based on the number of staged files. The parsing and validation of the numeric CLI options `--max-arg-length` and `--concurrency` has been improved.
