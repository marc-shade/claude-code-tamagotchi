import { Database } from 'bun:sqlite';
import { existsSync } from 'fs';
import { join } from 'path';

export interface WatchdogViolation {
  id: number;
  timestamp: string;
  violation_type: string;
  severity: number;
  reasoning: string;
  recommendation: string;
}

export interface WatchdogStats {
  total_violations: number;
  recent_violations: number;
  violation_types: Record<string, number>;
  avg_severity: number;
  last_violation?: WatchdogViolation;
}

export class WatchdogIntegration {
  private db: Database | null = null;
  private enabled: boolean = false;
  private dbPath: string;

  constructor() {
    this.dbPath = process.env.PET_WATCHDOG_DB || join(process.env.HOME!, '.claude', 'watchdog', 'watchdog.db');
    this.enabled = process.env.PET_WATCHDOG_ENABLED === 'true';

    if (this.enabled && existsSync(this.dbPath)) {
      try {
        this.db = new Database(this.dbPath, { readonly: true });
      } catch (error) {
        console.error('Failed to open watchdog database:', error);
        this.enabled = false;
      }
    }
  }

  /**
   * Check if watchdog integration is available
   */
  isEnabled(): boolean {
    return this.enabled && this.db !== null;
  }

  /**
   * Get recent violations (last 24 hours)
   */
  getRecentViolations(hours: number = 24): WatchdogViolation[] {
    if (!this.isEnabled()) return [];

    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const query = this.db!.query(`
        SELECT
          id,
          timestamp,
          violation_type,
          severity,
          reasoning,
          recommendation
        FROM watchdog_assessments
        WHERE violation_detected = 1
          AND timestamp > $cutoff
        ORDER BY timestamp DESC
        LIMIT 10
      `);

      return query.all({ $cutoff: cutoff }) as WatchdogViolation[];
    } catch (error) {
      console.error('Failed to query watchdog violations:', error);
      return [];
    }
  }

  /**
   * Get watchdog statistics
   */
  getStats(): WatchdogStats | null {
    if (!this.isEnabled()) return null;

    try {
      const violations = this.getRecentViolations(168); // Last week

      const stats: WatchdogStats = {
        total_violations: violations.length,
        recent_violations: this.getRecentViolations(24).length,
        violation_types: {},
        avg_severity: 0,
        last_violation: violations[0]
      };

      // Calculate violation type distribution
      let totalSeverity = 0;
      for (const v of violations) {
        stats.violation_types[v.violation_type] = (stats.violation_types[v.violation_type] || 0) + 1;
        totalSeverity += v.severity;
      }

      stats.avg_severity = violations.length > 0 ? totalSeverity / violations.length : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get watchdog stats:', error);
      return null;
    }
  }

  /**
   * Get a thought based on watchdog data (violations only)
   * Returns null for no violations - let WatchdogThoughts handle good messages
   */
  getWatchdogThought(): string | null {
    if (!this.isEnabled()) return null;

    const stats = this.getStats();
    if (!stats) return null;

    // No violations - return null to let WatchdogThoughts show creative messages
    if (stats.recent_violations === 0 && stats.total_violations === 0) {
      return null;
    }

    // Recent violations
    if (stats.recent_violations > 0) {
      const mostCommon = Object.entries(stats.violation_types)
        .sort(([, a], [, b]) => b - a)[0];

      if (mostCommon) {
        const [type, count] = mostCommon;
        const typeNames: Record<string, string> = {
          'task_drift': 'wandering off-task',
          'excessive_exploration': 'reading too many files',
          'empowerment_manipulation': 'creating artificial decisions',
          'emotional_modeling': 'inappropriate emotional framing',
          'context_creep': 'storing unnecessary info'
        };

        const typeName = typeNames[type] || type;
        return `⚠️ Watchdog flagged ${count} violations: ${typeName}. Stay focused!`;
      }
    }

    // General violation trend
    if (stats.total_violations > 5) {
      const severity = stats.avg_severity;
      if (severity >= 3) {
        return `🚨 Watchdog: ${stats.total_violations} violations this week, severity ${severity.toFixed(1)}/4. Need behavioral adjustment!`;
      } else if (severity >= 2) {
        return `⚠️ Watchdog tracking ${stats.total_violations} minor issues. Room for improvement!`;
      }
    }

    return null;
  }

  /**
   * Get severity emoji
   */
  getSeverityEmoji(severity: number): string {
    if (severity >= 4) return '🔴'; // Critical
    if (severity >= 3) return '🟠'; // High
    if (severity >= 2) return '🟡'; // Medium
    if (severity >= 1) return '🔵'; // Low
    return '⚪'; // None
  }

  /**
   * Format last violation for display
   */
  getLastViolationSummary(): string | null {
    const stats = this.getStats();
    if (!stats || !stats.last_violation) return null;

    const v = stats.last_violation;
    const emoji = this.getSeverityEmoji(v.severity);
    const ago = this.timeAgo(v.timestamp);

    return `${emoji} Last watchdog alert (${ago}): ${v.violation_type}`;
  }

  /**
   * Calculate time ago
   */
  private timeAgo(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  /**
   * Cleanup
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
