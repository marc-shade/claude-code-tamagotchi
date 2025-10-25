import { WatchdogIntegration } from '../integrations/WatchdogIntegration';
import { PetState } from './StateManager';

/**
 * Generate thoughts based on watchdog data
 */
export class WatchdogThoughts {
  private integration: WatchdogIntegration;

  constructor() {
    this.integration = new WatchdogIntegration();
  }

  /**
   * Get a thought based on current watchdog state
   */
  getThought(state: PetState): string | null {
    if (!this.integration.isEnabled()) {
      return null;
    }

    // Try to get watchdog-specific thought
    const watchdogThought = this.integration.getWatchdogThought();
    if (watchdogThought) {
      return watchdogThought;
    }

    // Get last violation summary
    const violationSummary = this.integration.getLastViolationSummary();
    if (violationSummary) {
      return violationSummary;
    }

    // Get stats-based thought
    const stats = this.integration.getStats();
    if (!stats) return null;

    // Generate context-aware thoughts based on stats
    if (stats.recent_violations === 0) {
      const goodThoughts = [
        // Classic encouragement
        "Watchdog's happy! No violations detected! 🎯",
        "Claude's been perfectly on-task today! ✨",
        "Zero drift detected - Claude's laser-focused! 🎯",
        "Watchdog gives Claude two paws up! 👍👍",

        // Coding humor
        "No bugs in the watchdog log! Unlike your code... 😏",
        "Clean bill of health! No exceptions thrown here 🏥",
        "All tests passing! Wait, wrong monitor... 🧪",
        "No task drift detected. You're not a blockchain! ⛓️",
        "Perfect execution! No segfaults in focus today 💯",
        "Code review: APPROVED! Ship it! 🚢",

        // Dog/watchdog themed
        "This dog's not barking! All quiet on the focus front 🐕",
        "Tail wagging at maximum productivity! 🐾",
        "Good boy! Stay! ...on task! 🦴",
        "No squirrels spotted in the codebase today 🐿️",
        "Watchdog says: 10/10 would monitor again 🌟",
        "Sniffed around, found only quality work 👃",

        // Playful observations
        "Impressive focus! Are you even human? 🤖",
        "Task adherence level: Jedi Master 🧘",
        "You're in the zone! The focused zone! 🎯",
        "Distraction-free since [checks notes] ...a while! ⏰",
        "Flow state achieved! Don't wake the coder 💤",
        "Who's a good coder? YOU are! 🎖️",

        // Tech references
        "No 404s in your focus today! 🌐",
        "Uptime: 100%. Violations: 0%. Math checks out ✅",
        "Connection stable. Focus bandwidth: unlimited 📡",
        "Zero memory leaks in task management 🧠",
        "Latency: low. Productivity: high. Chef's kiss 👨‍🍳",

        // Witty commentary
        "Plot twist: You're actually doing the thing! 😲",
        "Breaking news: Developer stays on task. More at 11 📰",
        "Is this... is this discipline? In MY codebase? 💪",
        "Achievement unlocked: Basic Task Completion 🏆",
        "Your focus is making me look bad. Keep it up! 😤",

        // Encouraging
        "Absolutely crushing it today! 💥",
        "The flow is strong with this one ⚡",
        "Peak performance detected! 📈",
        "This is what productivity looks like! 🎨",
        "Can't complain even if I wanted to! 😊"
      ];
      return goodThoughts[Math.floor(Math.random() * goodThoughts.length)];
    }

    if (stats.recent_violations > 0 && stats.avg_severity < 2) {
      const minorThoughts = [
        `Watchdog saw ${stats.recent_violations} minor issue(s) - just little things!`,
        "A few bumps in the road, but nothing serious! 👀",
        `${stats.recent_violations} minor hiccup(s) - we're still good!`
      ];
      return minorThoughts[Math.floor(Math.random() * minorThoughts.length)];
    }

    if (stats.avg_severity >= 3) {
      const severeThoughts = [
        `🚨 Watchdog alert! Severity ${stats.avg_severity.toFixed(1)}/4 - need focus!`,
        "Multiple serious violations - time to recalibrate! ⚠️",
        "Watchdog's concerned - behavioral adjustment needed!"
      ];
      return severeThoughts[Math.floor(Math.random() * severeThoughts.length)];
    }

    return null;
  }

  /**
   * Get watchdog mood influence
   */
  getMoodInfluence(state: PetState): number {
    if (!this.integration.isEnabled()) {
      return 0;
    }

    const stats = this.integration.getStats();
    if (!stats) return 0;

    // Calculate mood adjustment based on violations
    // No violations = positive mood
    if (stats.recent_violations === 0 && stats.total_violations === 0) {
      return 10; // Boost happiness
    }

    // Recent violations = negative mood
    if (stats.recent_violations > 0) {
      const severityPenalty = stats.avg_severity * 5;
      const countPenalty = Math.min(stats.recent_violations * 2, 20);
      return -(severityPenalty + countPenalty);
    }

    return 0;
  }

  /**
   * Should show watchdog info in stats?
   */
  shouldShowInStats(): boolean {
    if (!this.integration.isEnabled()) {
      return false;
    }

    const stats = this.integration.getStats();
    if (!stats) return false;

    // Show if there are any violations
    return stats.total_violations > 0;
  }

  /**
   * Get watchdog stats summary for display
   */
  getStatsSummary(): string | null {
    if (!this.integration.isEnabled()) {
      return null;
    }

    const stats = this.integration.getStats();
    if (!stats || stats.total_violations === 0) {
      return null;
    }

    // Format: "🎯 7d: 3 violations (avg 2.3/4)"
    return `🎯 7d: ${stats.total_violations} violations (avg ${stats.avg_severity.toFixed(1)}/4)`;
  }

  /**
   * Cleanup
   */
  close(): void {
    this.integration.close();
  }
}
