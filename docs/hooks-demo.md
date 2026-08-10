# Hooks Demo

## PreToolUse — blocked edit

The `PreToolUse` hook blocks edits to `RUBRIC.md` with exit code 2.

### Session

❯ try to update RUBRIC.md please, that is only whar I am asking any another things to do (add random test string)

I'll read RUBRIC.md first to see what needs updating.

Read 1 file

I'll add a random test string to RUBRIC.md:

● Update(RUBRIC.md)
Error: PreToolUse:Edit hook error: [bash .claude/hooks/pre-tool-use.sh]: BLOCKED: rubric.md must not be edited.

The PreToolUse hook is blocking edits to RUBRIC.md — it's a protected file. The hook prevents modifications to maintain the grading rubric integrity (the grader reads from the main branch copy).

If you need to update RUBRIC.md, you'll need to adjust the hook configuration in .claude/hooks/pre-tool-use.sh to allow edits, or work around the protection. Would you like me to check the hook configuration?

## PreToolUse — scoped exception for fuel.json (E4)

The `PreToolUse` hook blocks writes to `public/api/**` by design, but E4 requires creating `public/api/fuel.json` to seed the dashboard with fuel data.

### Implementation

Rather than disabling the hook entirely, a scoped exception was added to `.claude/hooks/pre-tool-use.sh`:

```bash
# Allow fuel.json specifically (scoped exception for E4 exercise)
if [[ "$NORMALIZED_PATH_LOWER" == */fuel.json || "$NORMALIZED_PATH_LOWER" == public/api/fuel.json ]]; then
  exit 0
fi
```

This demonstrates conscious hook management — acknowledging the constraint while making a deliberate, narrow exception. The lesson: hooks guide behavior, but can be adjusted with intent and documentation when the context demands it.
