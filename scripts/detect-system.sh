#!/bin/bash
# System Detection Script for Claude Code Tamagotchi
# Detects available agentic services and system capabilities

SYSTEM_INFO_FILE="$HOME/.claude/tamagotchi-system-info.json"

echo "Detecting system capabilities..."
echo ""

# Detect platform
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
echo "Platform: $PLATFORM"

# Check for watchdog system
WATCHDOG_PATH=""
WATCHDOG_AVAILABLE=false

if [ -f "$HOME/Documents/Cline/MCP/watchdog-system/NonBlockingWatchdog.py" ]; then
    WATCHDOG_PATH="$HOME/Documents/Cline/MCP/watchdog-system"
    WATCHDOG_AVAILABLE=true
    echo "✅ Found watchdog system at: $WATCHDOG_PATH"
else
    echo "⚠️  Watchdog system not found"
fi

# Check for watchdog database
if [ -f "$HOME/.claude/watchdog/watchdog.db" ]; then
    echo "✅ Found watchdog database"
else
    echo "⚠️  Watchdog database not found"
    WATCHDOG_AVAILABLE=false
fi

# Check for MCP servers
MCP_SERVERS=()
if [ -f "$HOME/.claude.json" ]; then
    echo "✅ Found Claude configuration"
    # Extract MCP server names (basic extraction, works without jq)
    while IFS= read -r line; do
        if [[ $line =~ \"([^\"]+)\"[[:space:]]*:[[:space:]]*\{ ]]; then
            MCP_SERVERS+=("${BASH_REMATCH[1]}")
        fi
    done < <(grep -A 1 '"mcpServers"' "$HOME/.claude.json" | grep -v 'mcpServers')
fi

echo "MCP Servers found: ${#MCP_SERVERS[@]}"

# Check for enhanced-memory
MEMORY_AVAILABLE=false
if [ -f "$HOME/.enhanced-memory/graph.db" ]; then
    MEMORY_AVAILABLE=true
    echo "✅ Found enhanced-memory database"
else
    echo "⚠️  Enhanced-memory not found"
fi

# Check for Ollama
OLLAMA_AVAILABLE=false
if command -v ollama &> /dev/null; then
    OLLAMA_AVAILABLE=true
    echo "✅ Found Ollama"
else
    echo "⚠️  Ollama not found"
fi

# Check for Groq API key
GROQ_AVAILABLE=false
if [ -n "$GROQ_API_KEY" ]; then
    GROQ_AVAILABLE=true
    echo "✅ Found Groq API key"
else
    echo "⚠️  Groq API key not set"
fi

# Generate system info JSON
mkdir -p "$(dirname "$SYSTEM_INFO_FILE")"

cat > "$SYSTEM_INFO_FILE" << EOF
{
  "platform": "$PLATFORM",
  "detected_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "watchdog_available": $WATCHDOG_AVAILABLE,
  "watchdog_path": "$WATCHDOG_PATH",
  "mcp_servers": [
$(printf '    "%s"' "${MCP_SERVERS[@]}" | sed 's/" "/",\n    "/g')
  ],
  "capabilities": {
    "enhanced_memory": $MEMORY_AVAILABLE,
    "ollama": $OLLAMA_AVAILABLE,
    "groq": $GROQ_AVAILABLE
  }
}
EOF

echo ""
echo "System detection complete!"
echo "Results saved to: $SYSTEM_INFO_FILE"
echo ""
echo "Summary:"
echo "  Platform: $PLATFORM"
echo "  Watchdog: $WATCHDOG_AVAILABLE"
echo "  Enhanced Memory: $MEMORY_AVAILABLE"
echo "  Ollama: $OLLAMA_AVAILABLE"
echo "  Groq: $GROQ_AVAILABLE"
echo "  MCP Servers: ${#MCP_SERVERS[@]}"
