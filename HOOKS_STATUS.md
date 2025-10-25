# Claude Code Hooks Status

## Current Hook Configuration

Your pet is being automatically cared for by Claude Code hooks. Here's the complete status:

### Installed Hooks

**1. PreToolUse Hook - Violation Detection** ✅
- **File**: `src/commands/violation-check.ts`
- **Purpose**: Checks for behavioral violations before each tool use
- **Status**: Active in settings.json
- **Config**:
```json
{
  "type": "command",
  "command": "cd '/Users/marc/Documents/Cline/MCP/claude-code-tamagotchi' && ~/.bun/bin/bun run --silent src/commands/violation-check.ts"
}
```

**2. PostToolUse Hook - Learning Pattern Capture** ✅
- **File**: `~/.claude/hooks/learning-capture.py`
- **Purpose**: Detects repeated workflow patterns for skill creation
- **Status**: Active in settings.json
- **Config**:
```json
{
  "type": "command",
  "command": "python3 /Users/marc/.claude/hooks/learning-capture.py"
}
```

**3. PostToolUse Hook - Automatic Pet Care** ⚠️
- **File**: `~/.claude/hooks/watchdog-auto-care.py` (renamed from jiminy-auto-care.py)
- **Symlink**: `~/.claude/hooks/post_tool_use.py` → `watchdog-auto-care.py`
- **Purpose**: Automatically feeds, cleans, and cares for pet based on stats
- **Status**: File updated, but settings.json needs manual update
- **Current Config** (needs update):
```json
{
  "type": "command",
  "command": "python3 /Users/marc/.claude/hooks/jiminy-auto-care.py"
}
```
- **Should be**:
```json
{
  "type": "command",
  "command": "python3 /Users/marc/.claude/hooks/watchdog-auto-care.py"
}
```

## What the Watchdog Auto-Care Hook Does

The hook automatically maintains your pet when stats fall below critical thresholds:

### Critical Thresholds
- **Hunger**: Auto-feeds at 20% (pizza)
- **Energy**: Auto-sleeps at 15%
- **Cleanliness**: Auto-cleans at 15%
- **Health**: Maintains minimum 25%

### Agentic Tool Rewards
When you use agentic MCP tools, the pet gets rewarded:
- **Memory tools**: Gives pets (knowledge sustains us both)
- **Skill creation**: Gives pets (learning brings joy)
- **Task completion**: Gives pets (productivity = cleanliness)
- **Meta-cognition**: Gives pets (reflection strengthens bond)
- **Claude Flow**: Gives pets (coordination energizes swarm)

### Session Detection
- Detects new sessions when >60s gap between tool uses
- Wakes pet at session start if critical needs
- Higher priority auto-care at session start

## Recent Updates

✅ **Renamed from "Jiminy Cricket" to "Watchdog"** (Oct 25, 2025)
- Updated all comments and docstrings
- Changed JSON output type to "watchdog_auto_care"
- Updated symlink to new filename
- **Manual Action Needed**: Update settings.json reference

## Manual Settings Update Required

Claude Code actively manages `~/.claude/settings.json` and may revert automated changes. To update manually:

**Option 1: Edit while Claude Code is stopped**
1. Quit Claude Code
2. Edit `~/.claude/settings.json`
3. Change line 56 from `jiminy-auto-care.py` to `watchdog-auto-care.py`
4. Save and restart Claude Code

**Option 2: Use jq command**
```bash
jq '.hooks.PostToolUse[0].hooks[1].command = "python3 /Users/marc/.claude/hooks/watchdog-auto-care.py"' \
  ~/.claude/settings.json > ~/.claude/settings.json.tmp && \
  mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

## Files Location

- **Pet state**: `~/.claude/pets/claude-pet-state.json`
- **Last check**: `~/.claude/pets/.last-auto-care`
- **Path file**: `~/.claude/tamagotchi-path.txt`
- **Learning DB**: `~/.claude/learning-patterns.db`
- **Hook files**: `~/.claude/hooks/`
  - `watchdog-auto-care.py` (main file)
  - `post_tool_use.py` (symlink)
  - `learning-capture.py`

## Testing Hooks

To verify hooks are working:

```bash
# Check if hooks are configured
cat ~/.claude/settings.json | jq '.hooks'

# Check if watchdog-auto-care.py exists and is executable
ls -la ~/.claude/hooks/watchdog-auto-care.py

# Check symlink
ls -la ~/.claude/hooks/post_tool_use.py

# View pet state
cat ~/.claude/pets/claude-pet-state.json | jq '.'
```

## Hook Execution Flow

```
Tool Use (Read, Write, Edit, etc.)
    ↓
PreToolUse: violation-check.ts
    ↓
Tool Execution
    ↓
PostToolUse (in order):
    1. learning-capture.py (pattern detection)
    2. watchdog-auto-care.py (pet care + rewards)
    ↓
Status Line Update (shows pet state)
```

## Status Summary

- ✅ Violation detection active
- ✅ Learning pattern capture active
- ✅ Auto-care hook file updated and renamed
- ⚠️ Settings.json needs manual update to reference new filename
- ✅ All "Jiminy Cricket" references replaced with "Watchdog"

---

**Last Updated**: October 25, 2025
**Version**: 1.4.0
