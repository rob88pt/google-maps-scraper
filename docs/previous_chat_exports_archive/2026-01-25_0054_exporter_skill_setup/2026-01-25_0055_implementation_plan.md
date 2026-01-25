# Chat Session Exporter Skill Implementation

## Goal

Create a skill that mandates maintaining a complete record of all session artifacts in timestamped directories, allowing for precise reconstruction of decisions across chat sessions.

## Proposed Changes

### [NEW] `C:\Users\Legion\.agent\skills\chat-session-exporter\SKILL.md`

Main skill file with:
- **YAML Frontmatter**: Name and description that triggers at the START of every new chat session.
- **Instructions**: Mandate creating a timestamped session folder based on the user's initial prompt.
- **Artifact Tracking**: Define which artifacts to duplicate (implementation plans, walkthroughs, task.md updates).
- **Script Usage**: Reference the `scripts/copy_artifacts.ps1` script for duplication.

---

### [NEW] `C:\Users\Legion\.agent\skills\chat-session-exporter\scripts\copy_artifacts.ps1`

Reusable PowerShell script that:
- Accepts source path and destination session folder.
- Copies artifacts with timestamped filenames to avoid overrides.
- Example: `implementation_plan.md` → `2026-01-25_0045_implementation_plan.md`

---

### [MODIFY] `c:\Users\Legion\.gemini\GEMINI.md`

Add a rule to the "Agent Behavior Rules" section mandating the `chat-session-exporter` skill is read at session start.

## Verification Plan

### Manual Verification

1. **Skill Triggering**: Start a new chat session and verify the agent reads `chat-session-exporter/SKILL.md`.
2. **Directory Creation**: Confirm a new timestamped session directory is created.
3. **Artifact Duplication**: After creating artifacts in the brain folder, run the script and verify copies appear in the session folder with timestamps.
