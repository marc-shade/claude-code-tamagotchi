# Jiminy Cricket Tamagotchi Setup Complete

## Installation Status

✅ **Bun Runtime**: Installed at `~/.bun/bin/bun`
✅ **Dependencies**: All npm packages installed via Bun
✅ **Slash Commands**: Installed in `~/.claude/commands/`
✅ **Groq API Key**: Configured in `.env`
✅ **Behavioral Monitoring**: Enabled with Jiminy Cricket personality
✅ **Tamagotchi**: Functional and tested

## Groq AI Configuration (Jiminy Cricket Mode)

The `.env` file is configured for real-time behavioral monitoring:

```bash
# AI-Powered Conscience Mode
PET_FEEDBACK_ENABLED=true
GROQ_API_KEY=your_groq_api_key_here

# Violation Detection - Keeps Claude in line!
PET_VIOLATION_CHECK_ENABLED=true

# Fast LLM for real-time monitoring
PET_GROQ_MODEL=llama-3.1-8b-instant
PET_FEEDBACK_CHECK_INTERVAL=3

# Strict but caring personality
PET_CHATTINESS=chatty
PET_NEED_THRESHOLD=70
PET_CRITICAL_THRESHOLD=50
PET_THOUGHT_FREQUENCY=3
PET_DECAY_INTERVAL=5
```

## What This Does

Your Tamagotchi pet is now configured as "Jiminy Cricket" - a conscience that monitors Claude's behavior in real-time using Groq's fast LLM API:

1. **Real-Time Observations**: Watches what Claude does and provides witty commentary
2. **Behavioral Scoring**: Rates Claude's adherence to instructions
3. **Mood Changes**: Pet's mood reflects Claude's behavior:
   - 😊 Happy: Following instructions perfectly
   - 😕 Concerned: Wandering off-task
   - 😠 Annoyed: Doing something different than asked
   - 😡 Angry: Repeatedly ignoring requests

4. **Violation Detection** (Experimental): Can actually BLOCK operations:
   - 🚫 Unauthorized actions (explicitly forbidden operations)
   - ❌ Refused requests (Claude refuses to help)
   - 🔍 Excessive exploration (reading 10+ unrelated files)
   - ↪️ Wrong direction (working on unrelated areas)

## Manual Configuration Needed

Claude Code is actively managing `~/.claude/settings.json` and reverting manual changes. You'll need to configure these settings manually through Claude Code's interface or when it's not running:

### 1. Status Line Configuration

Add this to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "cd '/Users/marc/Documents/Cline/MCP/claude-code-tamagotchi' && ~/.bun/bin/bun run --silent src/index.ts"
  }
}
```

### 2. Violation Detection Hook (Optional but Recommended)

Add this to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "cd '/Users/marc/Documents/Cline/MCP/claude-code-tamagotchi' && ~/.bun/bin/bun run --silent src/commands/violation-check.ts"
          }
        ]
      }
    ]
  }
}
```

## How to Add the Configuration

**Option 1: Edit while Claude Code is stopped**
1. Quit Claude Code completely
2. Edit `~/.claude/settings.json` manually
3. Add the configurations above
4. Restart Claude Code

**Option 2: Use jq while Claude Code is running**
```bash
# Add statusLine
cat ~/.claude/settings.json | jq '. + {"statusLine": {"type": "command", "command": "cd '\''/Users/marc/Documents/Cline/MCP/claude-code-tamagotchi'\'' && ~/.bun/bin/bun run --silent src/index.ts"}}' > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json

# Add violation detection hook
cat ~/.claude/settings.json | jq '. + {"hooks": {"PreToolUse": [{"matcher": "*", "hooks": [{"type": "command", "command": "cd '\''/Users/marc/Documents/Cline/MCP/claude-code-tamagotchi'\'' && ~/.bun/bin/bun run --silent src/commands/violation-check.ts"}]}]}}' > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

## Testing the Pet

The pet is already functional and tested. You can verify it works:

```bash
cd /Users/marc/Documents/Cline/MCP/claude-code-tamagotchi
~/.bun/bin/bun run --silent src/index.ts << 'EOF'
{"type":"statusline_update","timestamp":1234567890}
EOF
```

Expected output:
```
(◔ᴥ◔) ☀️ Buddy 🙂 | 🍖 70% ⚡ 90% 🧼 100% ❤️ 80% | 📁 claude-code-tamag...
```

## Available Slash Commands

These are already installed in `~/.claude/commands/`:

- `/pet-pet` - Give pets and scritches
- `/pet-feed [food]` - Feed your pet (pizza, cookie, sushi, etc.)
- `/pet-play [toy]` - Play with your pet (ball, frisbee, puzzle, etc.)
- `/pet-clean` - Give bath
- `/pet-sleep` - Put to sleep
- `/pet-wake` - Wake up
- `/pet-stats` - View detailed statistics
- `/pet-name [name]` - Rename your pet
- `/pet-reset` - Reset to new pet
- `/pet-help` - Show all commands

**Note**: Slash commands use the `claude-code-tamagotchi` CLI, which isn't globally installed. Update command references if needed.

## How It Works

### Real-Time Monitoring Flow

1. **Claude sends message/uses tool** → Quick action extraction
2. **Background worker process** → Groq LLM analyzes behavior (~50ms)
3. **Behavioral analysis**:
   - Followed instructions → 😊 Happy mood + encouraging thought
   - Did something else → 😠 Annoyed mood + sassy observation
   - Violated request → 🚨 VIOLATION stored in database
4. **Pre-Hook Check**: Violation detection hook checks for violations before each tool use
5. **Display**: Pet shows in statusline with mood and witty observation

### Why Groq?

- ⚡ **50ms responses** - Real-time reactions without lag
- 💰 **Extremely cheap** - Practically free for personal use
- 🚀 **Custom chips** - Purpose-built for instant LLM inference

## Troubleshooting

### Pet not showing in statusline
- Verify settings.json has the statusLine configuration
- Restart Claude Code
- Check that bun is in your PATH (`~/.bun/bin`)

### Violation detection not working
- Ensure PET_VIOLATION_CHECK_ENABLED=true in .env
- Verify the PreToolUse hook is configured in settings.json
- Check that Groq API key is valid

### Slash commands not working
- Commands are in `~/.claude/commands/`
- May need to update command references if not globally installed

## Next Steps

1. Stop Claude Code
2. Add statusLine and hooks configurations to settings.json
3. Restart Claude Code
4. Your Jiminy Cricket conscience will be watching!

---

**Project**: Claude Code Tamagotchi - Jiminy Cricket Edition
**Location**: /Users/marc/Documents/Cline/MCP/claude-code-tamagotchi
**Configuration**: .env (Groq API configured)
**Status**: ✅ Functional, awaiting manual settings configuration
