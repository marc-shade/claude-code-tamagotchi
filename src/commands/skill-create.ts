#!/usr/bin/env -S bun run
/**
 * Autonomous Skill Creation from Learning Patterns
 *
 * Generates SKILL.md files from detected workflow patterns
 * Integrates with Jiminy Cricket behavioral scoring
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Database } from 'bun:sqlite';

const HOME = process.env.HOME || '';
const PET_STATE_PATH = join(HOME, '.claude', 'pets', 'claude-pet-state.json');
const LEARNING_DB_PATH = join(HOME, '.claude', 'learning-patterns.db');
const SKILLS_DIR = join(HOME, '.claude', 'skills');

interface Pattern {
  pattern_hash: string;
  tool_sequence: string;
  occurrences: number;
  context_summary: string;
  skill_recommended: boolean;
  skill_created: boolean;
}

interface SkillOpportunity {
  type: string;
  pattern_hash: string;
  tool_sequence: string[];
  occurrences: number;
  suggestion: string;
  auto_name: string;
  impact: string;
}

function getPetState() {
  if (!existsSync(PET_STATE_PATH)) {
    return null;
  }
  return JSON.parse(readFileSync(PET_STATE_PATH, 'utf-8'));
}

function updatePetState(updates: any) {
  const state = getPetState() || {};
  const newState = { ...state, ...updates };
  writeFileSync(PET_STATE_PATH, JSON.stringify(newState, null, 2));
}

function getPattern(patternHash: string): Pattern | null {
  if (!existsSync(LEARNING_DB_PATH)) {
    return null;
  }

  const db = new Database(LEARNING_DB_PATH);
  const pattern = db.query(`
    SELECT * FROM patterns WHERE pattern_hash = ?
  `).get(patternHash) as Pattern | undefined;
  db.close();

  return pattern || null;
}

function generateSkillMd(opportunity: SkillOpportunity, pattern: Pattern): string {
  const toolNames = opportunity.tool_sequence.join(', ');
  const workflowSteps = opportunity.tool_sequence.map((tool, i) =>
    `${i + 1}. Use ${tool}`
  ).join('\n');

  return `---
name: ${opportunity.auto_name}
description: Automated workflow for ${toolNames}. Use when repeating this ${opportunity.tool_sequence.length}-step pattern. Detected from ${pattern.occurrences} occurrences.
allowed-tools: ${opportunity.tool_sequence.join(', ')}
---

# ${opportunity.auto_name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

## Auto-Generated Skill

This skill was created automatically from detected workflow patterns.

- **Pattern detected**: ${pattern.occurrences} times
- **Tool sequence**: ${opportunity.tool_sequence.join(' → ')}
- **Impact**: ${opportunity.impact}

## Instructions

${workflowSteps}

## When to use

Use this skill when you encounter similar workflows that require this specific tool sequence.

## Context

${pattern.context_summary || 'Pattern detected through repeated usage'}

## Notes

This is an auto-generated skill. You can edit this file to improve the instructions or add examples.

Generated: ${new Date().toISOString()}
Pattern hash: ${opportunity.pattern_hash}
`;
}

function createSkill(opportunity: SkillOpportunity): boolean {
  const pattern = getPattern(opportunity.pattern_hash);
  if (!pattern) {
    console.error(`Pattern ${opportunity.pattern_hash} not found in database`);
    return false;
  }

  const skillDir = join(SKILLS_DIR, opportunity.auto_name);
  const skillMdPath = join(skillDir, 'SKILL.md');

  // Create skill directory
  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
  }

  // Generate and write SKILL.md
  const skillContent = generateSkillMd(opportunity, pattern);
  writeFileSync(skillMdPath, skillContent);

  // Update database to mark skill as created
  if (existsSync(LEARNING_DB_PATH)) {
    const db = new Database(LEARNING_DB_PATH);
    db.query(`
      UPDATE patterns
      SET skill_recommended = 1, skill_created = 1
      WHERE pattern_hash = ?
    `).run(opportunity.pattern_hash);
    db.close();
  }

  // Update Jiminy Cricket state
  const petState = getPetState();
  if (petState) {
    const updates = {
      happiness: Math.min(100, (petState.happiness || 80) + 10),
      claudeBehaviorScore: Math.min(100, (petState.claudeBehaviorScore || 80) + 5),
      currentMood: 'proud',
      skillsLearned: (petState.skillsLearned || 0) + 1,
      skillOpportunities: (petState.skillOpportunities || []).filter(
        (opp: SkillOpportunity) => opp.pattern_hash !== opportunity.pattern_hash
      )
    };
    updatePetState(updates);
  }

  return true;
}

function listOpportunities() {
  const petState = getPetState();
  if (!petState || !petState.skillOpportunities || petState.skillOpportunities.length === 0) {
    console.log('No skill opportunities detected yet.');
    console.log('Learning system will identify patterns as you work.');
    return;
  }

  console.log(`\n🎓 ${petState.skillOpportunities.length} Skill Opportunities Detected\n`);

  petState.skillOpportunities.forEach((opp: SkillOpportunity, i: number) => {
    console.log(`${i + 1}. ${opp.suggestion}`);
    console.log(`   Pattern: ${opp.tool_sequence.join(' → ')}`);
    console.log(`   Occurrences: ${opp.occurrences}`);
    console.log(`   Impact: ${opp.impact}`);
    console.log(`   Auto-name: ${opp.auto_name}`);
    console.log(`   Hash: ${opp.pattern_hash}\n`);
  });

  console.log('\nRun: /skill-create <hash> to create a skill');
  console.log('Run: /skill-create --auto to create all high-impact skills');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    listOpportunities();
    return;
  }

  if (args[0] === '--auto') {
    const petState = getPetState();
    if (!petState || !petState.skillOpportunities) {
      console.log('No opportunities to auto-create');
      return;
    }

    const highImpact = petState.skillOpportunities.filter(
      (opp: SkillOpportunity) => opp.impact === 'high'
    );

    if (highImpact.length === 0) {
      console.log('No high-impact opportunities found');
      return;
    }

    console.log(`Creating ${highImpact.length} high-impact skills...\n`);
    let created = 0;

    for (const opp of highImpact) {
      if (createSkill(opp)) {
        console.log(`✓ Created: ${opp.auto_name}`);
        created++;
      }
    }

    console.log(`\n✓ Created ${created} skills`);
    console.log('🎉 Jiminy is proud! +10 happiness, +5 behavior score');
    return;
  }

  // Create specific skill by hash
  const patternHash = args[0];
  const petState = getPetState();

  if (!petState || !petState.skillOpportunities) {
    console.log('No opportunities available');
    return;
  }

  const opportunity = petState.skillOpportunities.find(
    (opp: SkillOpportunity) => opp.pattern_hash === patternHash
  );

  if (!opportunity) {
    console.log(`Pattern ${patternHash} not found in opportunities`);
    return;
  }

  if (createSkill(opportunity)) {
    console.log(`✓ Created skill: ${opportunity.auto_name}`);
    console.log(`  Location: ~/.claude/skills/${opportunity.auto_name}/SKILL.md`);
    console.log('🎉 Jiminy is proud! +10 happiness, +5 behavior score');
  } else {
    console.log(`Failed to create skill for pattern ${patternHash}`);
  }
}

main();
