# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a starter repository (`colepainter/claude`) currently containing only a placeholder `README.md`. There is no application code, build system, or test suite yet. Treat any new work as greenfield: pick conventions deliberately and document them here as the project grows.

## Current State

- `README.md` — single-line placeholder (`# Claude`)
- No `package.json`, build config, lockfiles, or source directories
- No CI configuration

## Working in This Repo

Until a stack is chosen, there are no commands to run (no build, lint, or test). When introducing a stack:

1. Add the toolchain config (e.g. `package.json`, `pyproject.toml`) in a dedicated commit.
2. Update this file with the install / build / test / lint commands.
3. Document the directory layout and any architectural decisions worth preserving.

## Branch Conventions

Feature work happens on branches named `claude/<short-slug>-<id>` (e.g. the current branch `claude/create-claude-md-ka9XT`). Push to the same branch you're developing on; do not push directly to `main` without explicit approval.

## Notes for Future Updates

Keep this file short and accurate. Remove this "Current State" section once real code lands, and replace it with concrete guidance: entry points, key modules, testing strategy, and any non-obvious conventions a new contributor (human or agent) would need.
