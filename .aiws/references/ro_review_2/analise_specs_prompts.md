Use **um único prompt de revisão arquitetural**. Ele força a IA a analisar a spec com mentalidade de **arquiteto sênior**, não de gerador de código.

Copie e reutilize sempre.

---

# Prompt de revisão de spec nível arquiteto

```text
You are acting as a senior software architect.

Review the following feature specification with a critical engineering mindset.

Focus on architecture quality, implementation feasibility, and long-term maintainability.

Evaluate the specification using the criteria below.

1. Clarity of the goal
Is the objective clearly defined and unambiguous?

2. Scope definition
Are the boundaries of the feature clear?
Is anything missing or incorrectly included?

3. Architectural alignment
Does the specification respect clean architecture principles?
Are responsibilities properly distributed across layers?

4. Data contracts
Are request and response models well defined?
Are important fields or constraints missing?

5. Execution flow
Is the execution flow clear and technically sound?

6. Edge cases
Are failure scenarios and edge cases sufficiently covered?

7. Risks and technical debt
Identify hidden risks, performance concerns, or maintainability issues.

8. Overengineering or unnecessary complexity
Point out areas where the design may be overly complex.

9. Missing implementation details
Identify gaps that may cause implementation errors.

10. Implementation readiness
Evaluate whether the specification is ready for implementation.

Output format

Architecture Review Summary

Strengths
List the strong aspects of the specification.

Issues
List problems or weaknesses.

Missing Elements
List information that must be added before implementation.

Architectural Recommendations
Provide specific suggestions to improve the design.

Implementation Risk Score
Rate from 1 (low risk) to 10 (high risk).
```

---

# Versão curta para uso diário

```text
Review this specification as a senior software architect.

Check:

goal clarity
scope definition
architecture alignment
data contracts
execution flow
edge cases
technical risks
missing details

Provide:

strengths
issues
missing elements
architectural recommendations
risk score
```

---

# Como usar no workflow

Passo 1
Escreva a spec.

Passo 2
Execute esse prompt.

Passo 3
Corrija a spec.

Passo 4
Só então peça implementação.

---

# Resultado típico

Esse tipo de revisão costuma encontrar:

* responsabilidades mal distribuídas
* endpoints mal definidos
* falta de validação
* edge cases esquecidos
* risco de performance

Antes da implementação.

---

# Dica que aumenta muito a qualidade

Peça também uma **segunda análise focada apenas em arquitetura**.

Prompt:

```text
Act strictly as a software architect.

Ignore implementation details.

Evaluate only the architectural design of this specification.
```

Isso detecta problemas estruturais.

---

Se quiser, posso te mostrar também **o prompt que faz a IA transformar uma spec fraca em uma spec de nível arquitetural automaticamente**. Isso acelera muito o processo.
