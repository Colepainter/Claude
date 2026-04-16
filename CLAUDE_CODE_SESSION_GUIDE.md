# Claude Code Session Guide

A practical guide to running productive sessions with Claude Code, Anthropic's
official CLI for Claude.

## Table of Contents

1. [What Is a Session?](#what-is-a-session)
2. [Starting and Resuming Sessions](#starting-and-resuming-sessions)
3. [Where You Can Run Claude Code](#where-you-can-run-claude-code)
4. [Interacting With Claude](#interacting-with-claude)
5. [Slash Commands](#slash-commands)
6. [Plan Mode](#plan-mode)
7. [Permissions and Safety](#permissions-and-safety)
8. [Hooks, MCP Servers, Subagents, and Skills](#hooks-mcp-servers-subagents-and-skills)
9. [Memory Files (CLAUDE.md)](#memory-files-claudemd)
10. [Managing Context](#managing-context)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## What Is a Session?

A Claude Code session is a single conversation with Claude, scoped to a working
directory. During a session, Claude can read and edit files, run shell
commands, call MCP tools, and delegate to subagents, all while tracking
progress across your request.

Each session carries:

- A **working directory** (and any additional paths you explicitly add).
- A **context window** that holds the conversation history.
- A **permission mode** controlling which tools run without prompting.
- Any **hooks, MCP servers, and skills** configured in your settings.

When the context window fills up, older messages are automatically compressed
so the conversation can continue without manual intervention.

---

## Starting and Resuming Sessions

```bash
claude                 # start a new session in the current directory
claude --resume        # pick a previous session to continue
claude --continue      # continue the most recent session in this directory
claude -p "prompt"     # run a one-shot prompt non-interactively
```

Inside a session you can also start fresh or hand off:

- `/clear` — wipe the conversation and start over in the same directory.
- `/compact` — summarize the conversation to free up context while keeping the
  key decisions and state.

---

## Where You Can Run Claude Code

- **Terminal CLI** — the primary interface.
- **Desktop app** (macOS and Windows).
- **Web app** at `claude.ai/code`.
- **IDE extensions** for VS Code and JetBrains IDEs.

The same session model, settings, and skills apply across all surfaces, though
some integrations (for example IDE diagnostics) are surface-specific.

---

## Interacting With Claude

A few habits make sessions smoother:

- **State the goal, not just the step.** "The login button is misaligned on
  mobile; fix it" is easier to act on than "edit `Login.tsx`".
- **Point to specific files or symbols** when you already know where the work
  belongs. This avoids unnecessary search.
- **Share constraints upfront** (style conventions, frameworks, test commands)
  rather than answering them one at a time mid-task.
- **Ask for a plan first** on larger tasks, then approve before Claude starts
  editing. Plan Mode (see below) is built for this.

---

## Slash Commands

Slash commands are shortcuts executed by the harness, not the model. Some
common ones:

| Command        | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `/help`        | Show help for Claude Code itself.                     |
| `/clear`       | Clear the current conversation.                       |
| `/compact`     | Summarize and compact the current conversation.       |
| `/model`       | Switch the active model.                              |
| `/fast`        | Toggle fast mode (same model, faster output).         |
| `/config`      | Open the settings editor.                             |
| `/permissions` | Review and edit permission rules.                     |
| `/mcp`         | Inspect configured MCP servers.                       |
| `/hooks`       | Inspect configured hooks.                             |

Custom slash commands can be added as user-invocable skills. Typing
`/<skill-name>` expands to the skill's full prompt.

---

## Plan Mode

Plan Mode asks Claude to produce an implementation plan without touching your
files. Enter it with `Shift+Tab` (in the CLI) or by asking Claude to plan.
Claude can still read code and run read-only commands, but cannot edit or
write files until you approve the plan.

Use Plan Mode when:

- The change spans multiple files or modules.
- You want to review the approach before any code is written.
- The task touches architecture, data migrations, or APIs.

---

## Permissions and Safety

Every tool call runs under a permission mode. The default mode prompts you for
anything that isn't pre-approved. Approval can be granted:

- **Once** — just for this call.
- **For the session** — until the session ends.
- **Always** — persisted to `settings.json` or `settings.local.json`.

Guidelines worth keeping in mind:

- Local, reversible actions (editing files, running tests) are usually safe to
  approve.
- Hard-to-reverse actions (force push, `git reset --hard`, deleting branches,
  dropping tables) deserve an explicit confirmation every time.
- Actions that affect shared state (pushing code, posting PR comments, sending
  messages) should be authorized for the specific scope requested, not blanket
  approved.

Use `/permissions` to audit what has been allowed over time and trim anything
that isn't needed.

---

## Hooks, MCP Servers, Subagents, and Skills

Claude Code extends beyond the base model through a handful of mechanisms:

- **Hooks** — shell commands the harness runs in response to events (session
  start, tool call, stop, etc.). Hooks are the right place for automated
  behaviors like "run the linter after every edit" or "print status on stop",
  because the harness executes them, not the model.
- **MCP servers** — external processes that expose tools, resources, and
  prompts. Configured in `settings.json` or via `claude mcp add`.
- **Subagents** — specialized agents invoked via the `Agent` tool. Useful for
  bounded research or isolated work that would otherwise bloat the main
  conversation.
- **Skills** — reusable prompt templates, optionally user-invocable as slash
  commands. Place them under `.claude/skills/` (project) or `~/.claude/skills/`
  (user).

---

## Memory Files (CLAUDE.md)

`CLAUDE.md` files provide durable context that Claude loads automatically:

- `./CLAUDE.md` — project-level instructions (commit alongside your code).
- `~/.claude/CLAUDE.md` — personal defaults applied across all projects.

Use them for things that don't change session to session: build commands,
coding conventions, how to run tests, the architecture overview, or any
standing rules (e.g. "always use `pnpm`, never `npm`").

Keep them short. Long memory files cost context on every turn.

---

## Managing Context

- Use `/compact` before the session feels sluggish, not after.
- Delegate large searches or read-heavy exploration to subagents (`Agent`
  tool with `subagent_type: Explore`) so the raw output stays out of the main
  context.
- Close unused MCP servers when they aren't needed — their tool schemas count
  against context.
- Start a fresh session when switching to an unrelated task; cheaper than
  trying to steer the existing one.

---

## Best Practices

- **Read before you write.** Ask Claude to read the relevant files before
  making edits; the results are better.
- **Small, reviewable diffs.** Prefer a sequence of focused changes over a
  single sweeping edit.
- **Run the tests.** Ask Claude to run the project's test or typecheck
  command after non-trivial changes.
- **Commit deliberately.** Claude only commits when you ask. Review the
  `git diff` before approving.
- **Don't over-delegate.** Subagents are great for research; they aren't a
  substitute for thinking through the plan yourself.
- **Match scope to request.** If you asked for a bug fix, don't accept an
  incidental refactor of unrelated code.

---

## Troubleshooting

- **Claude keeps asking for the same permission.** Add it to
  `settings.json` via `/permissions` or the `update-config` skill.
- **A hook is blocking commits or tool calls.** Inspect with `/hooks` and fix
  the underlying command; don't bypass it with `--no-verify`.
- **Context feels cramped.** Run `/compact`, or start a new session and let
  `CLAUDE.md` re-establish the baseline.
- **Tools from an MCP server are missing.** Check `/mcp` for server status
  and restart the server if needed.
- **Need to give feedback or file a bug.** Report at
  https://github.com/anthropics/claude-code/issues.

---

Happy hacking.
