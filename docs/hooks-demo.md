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
