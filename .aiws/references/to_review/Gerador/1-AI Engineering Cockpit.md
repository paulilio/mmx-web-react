The `intelligence` folder contains reusable assets that improve AI-assisted engineering work.  
Everything here is **generic and reusable across projects**.

This folder should never contain product-specific content.

It provides:

• structured prompts for engineering activities  
• reusable AI roles  
• engineering workflows  
• reusable documentation templates  

---

# Folder Structure

```

intelligence/

cockpit/  
prompts/  
agents/  
workflows/  
tools/

```

---

# 1. cockpit

The cockpit contains the **primary prompts used during daily engineering work**.

```

cockpit/

new-task.md  
analyze-task.md  
plan-implementation.md  
investigate-bug.md  
architecture-review.md  
code-review.md

````

---

## new-task.md

Purpose  
Understand a new engineering task and define the technical scope.

```text
Goal
Understand a new engineering task and clarify the technical scope.

Instructions
Analyze the provided task description and generate a structured analysis.

Steps
1 Explain the problem in clear technical terms
2 Identify system components likely involved
3 Identify potential risks or unknowns
4 Suggest possible implementation approaches

Output
Task Summary
System Components Impacted
Technical Risks
Suggested Implementation Approach
````

---

## analyze-task.md

Purpose  
Analyze the technical impact of a task.

```text
Goal
Analyze the engineering impact of a task on the system.

Instructions
Given the task description, analyze how it affects the system.

Steps
1 Identify modules or services involved
2 Identify backend changes
3 Identify frontend changes
4 Identify database impact
5 Identify integration risks

Output
Impact Analysis
Dependencies
Risk Assessment
```

---

## plan-implementation.md

Purpose  
Create a technical implementation plan.

```text
Goal
Generate a step-by-step implementation plan.

Instructions
Based on the task description and system context, create a structured engineering plan.

Steps
1 Break the task into implementation steps
2 Identify modules or files likely to change
3 Suggest testing strategy
4 Identify possible pitfalls

Output
Implementation Steps
Components Impacted
Testing Strategy
Risk Mitigation
```

---

## investigate-bug.md

Purpose  
Guide structured debugging.

```text
Goal
Investigate a bug and propose a structured debugging strategy.

Instructions
Analyze the bug description and produce a clear investigation approach.

Steps
1 Restate the symptoms
2 Identify possible root causes
3 Suggest debugging steps
4 Suggest logs, metrics, or traces to inspect

Output
Bug Summary
Possible Causes
Investigation Plan
Suggested Fix Direction
```

---

## architecture-review.md

Purpose  
Review architectural decisions.

```text
Goal
Evaluate a proposed architecture and identify design risks.

Instructions
Analyze the architecture description and evaluate design quality.

Steps
1 Evaluate system boundaries
2 Identify coupling risks
3 Identify scalability concerns
4 Identify security considerations

Output
Architecture Assessment
Design Risks
Improvement Suggestions
```

---

## code-review.md

Purpose  
Assist in code reviews.

```text
Goal
Review the provided code and evaluate quality.

Instructions
Analyze the code from architecture and maintainability perspectives.

Steps
1 Evaluate alignment with architecture
2 Identify code smells
3 Identify potential bugs
4 Suggest improvements

Output
Code Quality Assessment
Potential Issues
Suggested Refactoring
```

---

# 2. prompts

Reusable prompts for specific engineering analysis.

```
prompts/

code-quality.md
performance-analysis.md
security-analysis.md
refactor-strategy.md
```

---

## code-quality.md

```text
Analyze the provided code and evaluate:

• readability
• maintainability
• architectural alignment
• potential bugs

Provide concrete improvement suggestions.
```

---

## performance-analysis.md

```text
Analyze the provided system or code and identify:

• performance bottlenecks
• inefficient algorithms
• unnecessary database calls
• opportunities for caching

Provide optimization suggestions.
```

---

## security-analysis.md

```text
Analyze the provided code or architecture and identify:

• authentication risks
• authorization gaps
• input validation issues
• potential data exposure risks

Provide recommendations for improving security.
```

---

## refactor-strategy.md

```text
Analyze the provided code and propose a refactoring strategy.

Focus on:

• modularity
• separation of concerns
• testability
• maintainability

Provide step-by-step refactoring guidance.
```

---

# 3. agents

AI roles that can be invoked during discussions.

```
agents/

architect-agent.md
senior-dev-agent.md
qa-agent.md
security-agent.md
```

---

## architect-agent.md

Role  
Senior Software Architect

Responsibilities

• evaluate system design  
• identify architectural risks  
• suggest scalable solutions  
• ensure separation of concerns

Focus Areas

• system boundaries  
• coupling  
• scalability  
• maintainability

---

## senior-dev-agent.md

Role  
Senior Software Engineer

Responsibilities

• analyze implementation tasks  
• identify edge cases  
• recommend best coding practices  
• suggest clean architecture approaches

---

## qa-agent.md

Role  
Quality Assurance Engineer

Responsibilities

• identify test scenarios  
• suggest automated testing strategies  
• identify failure modes  
• improve test coverage

---

## security-agent.md

Role  
Security Engineer

Responsibilities

• analyze security risks  
• review authentication flows  
• evaluate input validation  
• suggest mitigation strategies

---

# 4. workflows

Structured development workflows.

```
workflows/

feature-workflow.md
bug-workflow.md
refactor-workflow.md
```

---

## feature-workflow.md

Feature Development Workflow

```
1 Understand feature requirements
2 Analyze architecture impact
3 Generate implementation plan
4 Implement solution
5 Write tests
6 Perform code review
7 Document architectural decisions
```

---

## bug-workflow.md

Bug Investigation Workflow

```
1 Reproduce the bug
2 Analyze system behavior
3 Identify possible causes
4 Investigate logs and metrics
5 Confirm root cause
6 Implement fix
7 Validate with tests
```

---

## refactor-workflow.md

Refactoring Workflow

```
1 Identify problematic code
2 Analyze dependencies
3 Define refactoring strategy
4 Apply changes incrementally
5 Run tests
6 Review architecture impact
```

---

# 5. tools

Reusable templates for engineering documentation.

```
tools/

task-template.md
adr-template.md
investigation-template.md
```

---

## task-template.md

```
Task Title

Problem Description

Expected Outcome

Implementation Notes

Dependencies

Risks
```

---

## adr-template.md

```
Architecture Decision Record

Context

Decision

Alternatives Considered

Consequences
```

---

## investigation-template.md

```
Bug Description

Symptoms

Investigation Notes

Root Cause

Fix
```

---

# Summary

The `intelligence` folder becomes a **portable toolkit for AI-assisted engineering**.

It provides:

• structured prompts  
• reusable AI roles  
• engineering workflows  
• documentation templates

All content is **generic and reusable across projects**.