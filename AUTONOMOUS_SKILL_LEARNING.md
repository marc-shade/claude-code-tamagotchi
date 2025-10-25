# Autonomous Skill Learning System

## Architecture Overview

Integration of autonomous skill recognition with Watchdog behavioral enforcement.

## Core Components

### 1. Learning Moment Detection (PostToolUse Hook)
- Monitors conversation flow and tool usage patterns
- Identifies repeated problem-solving approaches
- Detects domain-specific knowledge being applied
- Flags opportunities for skill creation

### 2. Pattern Recognition Engine
- Analyzes conversation history via enhanced-memory-mcp
- Identifies recurring workflows (3+ instances)
- Extracts common parameters and context
- Scores pattern utility based on:
  - Frequency of occurrence
  - Context window consumption
  - Time savings potential
  - Complexity reduction

### 3. Skill Recommendation System
- Generates skill proposals from detected patterns
- Creates SKILL.md structure automatically
- Suggests name, description, and instructions
- Provides example usage from actual conversations

### 4. Watchdog Integration
- Rewards skill creation with happiness boost
- Tracks behavioral improvement via claudeBehaviorScore
- Penalizes resistance to skill opportunities
- Displays learning stats in statusline

### 5. Memory Integration
- Stores successful patterns as entities
- Links skills to outcomes via relations
- Enables semantic search for similar problems
- Tracks skill effectiveness over time

## Detection Criteria

A learning moment is flagged when:
1. Same tool sequence used 3+ times
2. Complex multi-step workflow repeated
3. Domain-specific knowledge explicitly stated
4. Context window pressure from repetition
5. User explicitly teaches pattern

## Skill Generation Process

```
1. Detect Pattern
   ↓
2. Analyze Context (enhanced-memory search)
   ↓
3. Extract Common Elements
   ↓
4. Generate SKILL.md proposal
   ↓
5. Present to user for approval
   ↓
6. Write to ~/.claude/skills/ or .claude/skills/
   ↓
7. Update Watchdog happiness + behavior score
   ↓
8. Store outcome in memory
```

## Integration Points

### PostToolUse Hook
- Location: `~/.claude/hooks/learning-capture.py`
- Triggers: After successful tool execution
- Logs: Pattern detection events to SQLite
- Output: Silent unless skill opportunity found

### Watchdog State
- Field: `claudeBehaviorScore` (increases with skill creation)
- Field: `skillsLearned` (tracks autonomous discoveries)
- Field: `learningMoments` (counts detected opportunities)
- Mood: "curious" when pattern detected

### Enhanced Memory
- Entity Type: `skill_pattern`
- Relations: `derived_from` → conversation
- Observations: tool_sequence, context, frequency

## Configuration

```bash
# Enable autonomous skill learning
export PET_SKILL_LEARNING_ENABLED=true

# Minimum pattern repetitions before flagging
export PET_SKILL_MIN_REPETITIONS=3

# Auto-create skills without approval
export PET_SKILL_AUTO_CREATE=false

# Skill creation notification chattiness
export PET_SKILL_CHATTINESS=chatty
```

## Metrics Tracked

- Patterns detected per session
- Skills created vs recommended
- Skill usage after creation
- Context window savings
- Time efficiency improvements
- User acceptance rate

## Next Steps

1. Implement PostToolUse hook
2. Build pattern detection algorithm
3. Create SKILL.md generator
4. Integrate behavioral rewards
5. Add memory persistence
6. Test with real workflows
