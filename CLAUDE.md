# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Run the pet in statusline mode (main entry point)
bun run src/index.ts

# Development mode with auto-reload
bun run dev

# Build for distribution
bun run build

# Reset pet to initial state
bun run reset

# Run demo mode
bun run demo
```

### Installation & Setup
```bash
# Install dependencies
bun install

# Run the setup script (configures Claude Code settings and commands)
./setup.sh

# Global installation
bun add -g github:Ido-Levi/claude-code-tamagotchi
```

### CLI Commands (when installed globally)
```bash
claude-code-tamagotchi <command> [args]
# Commands: feed, play, pet, clean, sleep, wake, stats, status, name, reset, help
```

## Architecture Overview

This is a virtual pet (Tamagotchi) that lives in the Claude Code statusline. The pet responds to user interactions through slash commands and tracks its state persistently.

### Core Components

1. **Entry Point** (`src/index.ts`): Reads stdin from Claude Code, updates pet state, outputs statusline display.

2. **Pet Engine** (`src/engine/PetEngine.ts`): Central orchestrator that manages state updates, animations, and actions. Coordinates between all subsystems.

3. **State Management** (`src/engine/StateManager.ts`): Handles persistent state storage in `~/.claude/pets/claude-pet-state.json`. Tracks stats (hunger, energy, cleanliness, happiness), timestamps, and session data.

4. **Activity System** (`src/engine/ActivitySystem.ts`): Applies activity-based decay to pet stats rather than time-based. Stats decrease based on coding session activity.

5. **Thought System** (`src/engine/ThoughtSystem.ts`): Generates contextual thoughts based on pet mood, needs, and coding activity. Pulls from 200+ thoughts organized by category in `src/engine/thoughts/`.

6. **AI Feedback System** (`src/engine/feedback/FeedbackSystem.ts`): **NEW** - Optional AI-powered system that analyzes Claude Code's behavior and generates contextual pet reactions using Groq LLM API. Monitors conversation transcripts and provides witty observations.

7. **Command Processing** (`src/commands/CommandProcessor.ts`): Handles slash commands (feed, play, clean, etc.) by writing action files that the pet engine reads on next update.

8. **Animation Manager** (`src/engine/AnimationManager.ts`): Enhanced with mood-based face variations and smooth breathing animations. Each mood has distinct visual representations.

### Data Flow

1. Claude Code calls the pet with statusline update (JSON via stdin)
2. Pet engine loads state, checks for pending actions, applies activity updates
3. Animation and thought systems generate display elements
4. Formatted statusline output sent to stdout
5. State persisted for next update

### Key Environment Variables

The pet is highly configurable through environment variables:

**Core Settings:**
- `PET_STATE_FILE`: State persistence location
- `PET_DECAY_INTERVAL`: Updates between stat decreases  
- `PET_THOUGHT_FREQUENCY`: Updates between thoughts
- `PET_CHATTINESS`: How talkative (quiet/normal/chatty)

**AI Feedback System (Optional):**
- `PET_FEEDBACK_ENABLED`: Enable AI-powered observations (true/false)
- `PET_GROQ_API_KEY`: Your Groq API key from https://console.groq.com/keys
- `PET_GROQ_MODEL`: LLM model to use (default: openai/gpt-oss-20b, alt: llama-3.1-8b-instant)
- `PET_FEEDBACK_CHECK_INTERVAL`: Updates between feedback checks (default: 5)
- `PET_FEEDBACK_DEBUG`: Enable debug logging (true/false)

Various decay rates and thresholds for customization

### Claude Code Integration

- **Statusline**: Configured in `~/.claude/settings.json` to run the pet command
- **Slash Commands**: `/pet-*` commands in `~/.claude/commands/` directory
- **Session Awareness**: Tracks update counts and timestamps to detect coding sessions

The pet only updates during active Claude Code conversations, making it activity-driven rather than real-time.

## Multi-System Integration (v1.4.0)

### 1. Watchdog Integration ✅
Real-time integration with the watchdog-system for behavioral monitoring:

**Features:**
- Displays real violation data from SQLite database in statusline
- 37 unique creative thoughts when Claude is behaving well
- Priority thought system (Watchdog > Feedback > Regular)
- Environment configuration via `~/.tamagotchi.env`

**Implementation:**
- `WatchdogIntegration.ts` - Reads from watchdog database
- `WatchdogThoughts.ts` - Generates context-aware thoughts
- `PetEngine.ts` - Integrated as highest-priority thought source

**Example outputs:**
- Violation: `⚠️ Watchdog flagged 1 violations: wandering off-task. Stay focused!`
- Good behavior: `Plot twist: You're actually doing the thing!`
- Good behavior: `Achievement unlocked: Basic Task Completion`

### 2. Autonomous Skill Learning System ✅
Automatically detects repeated workflow patterns and suggests skill creation:

**Features:**
- Pattern detection from conversation history (3+ occurrences)
- Auto-generates SKILL.md files with examples
- Manages Claude Code's 20-skill limit with intelligent swapping
- Rewards skill creation with behavioral score increases

**Components:**
- `skill-create.ts` - Generates skills from detected patterns
- `skill-load.ts` - Dynamic skill management (load/unload/auto-swap)
- `learning-capture.py` hook - Monitors tool usage patterns
- `skill-memory-integrator.py` hook - Stores patterns in enhanced-memory

**Commands:**
- `/skill-create` - Create skill from detected pattern
- `/skill-load` - Manage active skills (8/20 default)

### 3. Watchdog Behavioral System ✅
AI-powered behavioral scoring and violation detection:

**Features:**
- Real-time "conscience" monitoring using Groq LLM
- Scores adherence to instructions (0-100 behavioral score)
- Detects and can block violations via pre-hook
- Changes pet mood based on Claude's behavior

**Behavior scoring:**
- 😊 Happy (80-100): Following instructions perfectly
- 😕 Concerned (60-79): Minor deviations from task
- 😠 Annoyed (40-59): Wandering off-task
- 😡 Angry (0-39): Repeatedly ignoring requests

**Violation types:**
- Task drift (wandering off-task)
- Excessive exploration (reading too many files)
- Empowerment manipulation (creating artificial decisions)
- Emotional modeling (inappropriate framing)
- Context creep (storing unnecessary info)

### Claude Code Hooks Integration

The pet system uses Claude Code hooks for automatic care and monitoring:

**PreToolUse Hook:**
- `violation-check.ts` - Checks for behavioral violations before each tool use
- Can block operations that violate user instructions

**PostToolUse Hooks:**
1. `learning-capture.py` - Detects repeated workflow patterns for skill creation
2. `watchdog-auto-care.py` - Automatically maintains pet stats and rewards agentic tool usage

**Auto-Care Thresholds:**
- Hunger ≤20%: Auto-feeds pizza
- Energy ≤15%: Auto-sleeps
- Cleanliness ≤15%: Auto-cleans
- Session start: Wakes if critical needs

**Agentic Rewards:**
- Memory tools → Pets (knowledge sustains team)
- Skill creation → Pets (learning brings joy)
- Task completion → Pets (productivity = cleanliness)
- Meta-cognition → Pets (reflection strengthens bond)
- Claude Flow → Pets (coordination energizes swarm)

**Hook Configuration:**
Hooks are configured in `~/.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{"command": "...violation-check.ts"}]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [
        {"command": "python3 ~/.claude/hooks/learning-capture.py"},
        {"command": "python3 ~/.claude/hooks/watchdog-auto-care.py"}
      ]
    }]
  }
}
```

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Pet Status Line                       │
│  (◕︵◕) ☀️ Buddy 😊 | Stats | Thought                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     PetEngine                           │
│  ┌─────────────┬──────────────┬────────────────────┐  │
│  │  Watchdog   │   Feedback   │  Regular Thoughts  │  │
│  │   (Real     │  (AI-powered │   (Mood-based)     │  │
│  │ violations) │  conscience) │                    │  │
│  └─────────────┴──────────────┴────────────────────┘  │
│         Priority 1    Priority 2     Priority 3        │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Watchdog   │   │   Watchdog   │   │    Skill     │
│  Integration │   │  Behavioral  │   │   Learning   │
│              │   │              │   │              │
│ • SQLite DB  │   │ • Behavior   │   │ • Pattern    │
│ • Violations │   │   scoring    │   │   detection  │
│ • Creative   │   │ • AI mood    │   │ • Auto-gen   │
│   thoughts   │   │ • Pre-hook   │   │ • Dynamic    │
│              │   │   blocking   │   │   loading    │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Configuration Files

**Environment**: `~/.tamagotchi.env`
```bash
# Core pet settings
PET_STATE_FILE="/Users/marc/.claude/pets/pet-state.json"

# Feedback system (Watchdog)
PET_FEEDBACK_ENABLED=true
GROQ_API_KEY=your_groq_api_key_here

# Watchdog integration
PET_WATCHDOG_ENABLED=true
PET_WATCHDOG_DB="/Users/marc/.claude/watchdog/watchdog.db"
PET_WATCHDOG_PATH="/Users/marc/Documents/Cline/MCP/watchdog-system"

# Skill learning
PET_SKILL_LEARNING_ENABLED=true
PET_SKILL_MIN_REPETITIONS=3
PET_SKILL_AUTO_CREATE=false
```

### Documentation

- `INTEGRATION_COMPLETE.md` - Complete integration summary
- `AUTONOMOUS_SKILL_LEARNING.md` - Skill system architecture
- `WATCHDOG_BEHAVIORAL_SETUP.md` - Setup and configuration guide
- `HOOKS_STATUS.md` - Current hook configuration status
- `README.md` - Full feature documentation

### Enhanced Animation System
- **Mood-based faces**: Each mood has unique facial expressions that alternate
- **Breathing animations**: Subtle animation creates lifelike appearance
- **Smooth transitions**: Better animation flow between different states
- **Activity indicators**: Visual cues for long coding sessions

### Technical Improvements
- Removed hardcoded API keys for security
- Simplified prompt engineering for better LLM responses
- Improved error handling with proper logging
- Streamlined mood/severity system
- Cleaner separation of concerns in feedback system
- Better-sqlite3 integration for skill learning database