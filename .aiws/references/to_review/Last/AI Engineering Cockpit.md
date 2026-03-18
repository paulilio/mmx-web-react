A lightweight workspace system designed to structure engineering work with AI assistance.

The AI Engineering Cockpit provides a repeatable workflow to analyze tasks, design solutions, investigate bugs, and review code using AI tools such as ChatGPT, Claude, or Copilot.

This workspace remains **outside the repository**, connected through a symbolic link.  
The repository stays clean while engineering knowledge and workflows remain organized.

---

# 1. Goals

The AI Engineering Cockpit exists to:

• provide structured engineering workflows  
• capture technical knowledge outside the repository  
• improve AI-assisted development  
• maintain engineering memory across projects  
• simplify onboarding for engineers and AI tools

---

# 2. Workspace Structure

The cockpit is organized into five core areas.

```text
.workspace/

context/
work/
knowledge/
meetings/
intelligence/
```

Each area serves a different purpose.

---

# 3. Context

The context folder explains the system quickly.

```text
context/

project-overview.md
architecture.md
tech-stack.md
current-focus.md
```

These files provide the minimum information required for:

• onboarding engineers  
• providing context to AI tools  
• remembering system architecture

---

## project-overview.md

Describes the product and system.

Example

Project  
MoedaMix

Purpose  
Financial management application.

Users  
Freelancers and small businesses.

Core modules

Transactions  
Budgets  
Reports

---

## architecture.md

High level system design.

Example

Frontend  
Next.js

Backend  
API routes

Database  
PostgreSQL

ORM  
Prisma

---

## tech-stack.md

Technologies used in the project.

Example

Frontend  
Next.js  
React  
TypeScript

Backend  
Node.js

Database  
PostgreSQL

Infrastructure  
Docker  
Vercel

---

## current-focus.md

Current engineering priorities.

Example

Current focus

Implement transaction APIs  
Improve authentication flow  
Optimize reporting queries

---

# 4. Work

The work folder contains engineering execution.

```text
work/

tasks/
spikes/
bugs/
```

---

## tasks

Development tasks.

Example

```text
work/tasks/

create-auth-api.md
transactions-endpoint.md
reports-query-optimization.md
```

Each task document contains

• problem description  
• implementation plan  
• references

---

## spikes

Research activities.

```text
work/spikes/

testing-strategy.md
database-performance.md
observability-stack.md
```

Spikes evaluate technologies, architecture options, or implementation approaches.

---

## bugs

Bug investigations.

```text
work/bugs/

report-query-timeout.md
auth-session-expire.md
```

Bug files usually include

• symptoms  
• investigation notes  
• root cause  
• fix

---

# 5. Knowledge

The knowledge folder stores engineering learning.

```text
knowledge/

decisions/
research/
notes/
```

---

## decisions

Architecture decisions.

```text
knowledge/decisions/

auth-strategy.md
database-choice.md
cache-layer.md
```

Each decision file includes

• context  
• decision  
• consequences

---

## research

Technology exploration.

```text
knowledge/research/

playwright-testing.md
react-performance.md
ai-assisted-development.md
```

---

## notes

Technical observations.

```text
knowledge/notes/

performance-notes.md
api-limitations.md
security-notes.md
```

---

# 6. Meetings

Meetings record important discussions.

```text
meetings/

2026-03-13-architecture-review.md
2026-03-20-sprint-planning.md
```

Typical meeting notes include

• participants  
• topics  
• decisions  
• action items

---

# 7. Intelligence Layer

The intelligence folder contains AI-assisted engineering tools.

```text
intelligence/

cockpit/
prompts/
agents/
workflows/
tools/
```

This layer improves how engineers work with AI.

---

# 8. Cockpit

The cockpit folder contains structured prompts for daily engineering activities.

```text
intelligence/cockpit/

new-task.md
analyze-task.md
plan-implementation.md
investigate-bug.md
architecture-review.md
code-review.md
```

These prompts guide AI interactions.

---

## new-task

Used when receiving a new task.

Goal  
Understand the task and define the engineering scope.

Steps

1 Explain the problem  
2 Identify impacted components  
3 Identify risks  
4 Suggest implementation strategy

Output

• task summary  
• architecture impact  
• next steps

---

## analyze-task

Used to analyze technical impact.

Goal  
Analyze the engineering impact of the task.

Steps

1 Identify affected modules  
2 Identify database impact  
3 Identify API changes  
4 Identify frontend impact

Output

• impact analysis  
• risks  
• dependencies

---

## plan-implementation

Transforms analysis into a technical plan.

Goal  
Create a step-by-step implementation plan.

Steps

1 Break task into steps  
2 Identify files to modify  
3 Suggest testing strategy

Output

• implementation plan  
• test plan

---

## investigate-bug

Bug investigation prompt.

Goal  
Investigate the root cause of a bug.

Steps

1 Analyze symptoms  
2 Identify possible causes  
3 Suggest debugging strategy

Output

• hypothesis list  
• investigation plan

---

## architecture-review

Architecture review prompt.

Goal  
Review architecture decisions and identify design risks.

Steps

1 Analyze architecture description  
2 Identify coupling issues  
3 Suggest improvements

Output

• design risks  
• improvement suggestions

---

## code-review

Code review prompt.

Goal  
Review code quality and identify improvements.

Steps

1 Evaluate architecture alignment  
2 Identify edge cases  
3 Suggest improvements

Output

• code review comments  
• refactoring suggestions

---

# 9. Prompts

Reusable prompts for common engineering tasks.

```text
intelligence/prompts/

code-quality.md
performance-analysis.md
security-analysis.md
refactor-strategy.md
```

---

# 10. Agents

Defined AI roles.

```text
intelligence/agents/

architect.md
senior-dev.md
qa-engineer.md
security-engineer.md
```

Each file describes a specific engineering role and responsibilities.

---

# 11. Workflows

Structured development workflows.

```text
intelligence/workflows/

feature-workflow.md
bug-workflow.md
refactor-workflow.md
```

Example workflow

Feature workflow

1 Understand the task  
2 Analyze architecture impact  
3 Create implementation plan  
4 Implement solution  
5 Run code review

---

# 12. Tools

Helper templates and resources.

```text
intelligence/tools/

task-template.md
adr-template.md
investigation-template.md
```

These templates standardize engineering documentation.

---

# 13. ENGINEERING.md

ENGINEERING.md acts as the control center of the AI Engineering Cockpit.

This file explains

• project architecture  
• engineering rules  
• development workflow  
• AI interaction guidelines

Example sections

Project Overview  
Architecture Summary  
Engineering Principles  
Development Workflow  
Testing Strategy  
AI Interaction Rules

AI tools should read this file first to understand how engineering work is structured.

---

# 14. Connecting the Cockpit to the Repository

The cockpit stays outside the repository.

The repository links to it through a symbolic link.

Repository structure

```text
repo/

.github/
.ai/

.workspace → external workspace

src/
tests/
```

Windows command

```
mklink /D .workspace "C:\AI-Engineering-Cockpit\projects\mmx"
```

Linux or macOS command

```
ln -s ~/AI-Engineering-Cockpit/projects/mmx .workspace
```

---

# 15. Development Workflow

Typical workflow

Step 1  
Use `cockpit/new-task`

Step 2  
Use `cockpit/analyze-task`

Step 3  
Use `cockpit/plan-implementation`

Step 4  
Implement the solution

Step 5  
Use `cockpit/code-review`

Step 6  
Document learnings in `knowledge`

---

# 16. Benefits

The AI Engineering Cockpit provides

• structured AI-assisted engineering workflows  
• persistent technical knowledge  
• reusable prompts and templates  
• faster task analysis and planning  
• clean git repositories

It becomes a **portable engineering operating system** that improves productivity and engineering clarity across projects.