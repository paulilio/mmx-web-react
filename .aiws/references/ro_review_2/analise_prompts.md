Vou te mostrar o **workflow de 5 prompts** que muitos devs estão usando para transformar a IA em um **engenheiro quase autônomo**.

A ideia é simples.
Você controla **planejamento e qualidade**, e a IA faz **execução**.

Você quase não toca no código.

---

# Workflow de 5 prompts

## 1. Context prompt

Primeiro você pede para a IA entender o projeto.

Prompt:

```text
Analyze this repository.

Explain:
- system architecture
- main modules
- dependency flow
- coding conventions

Keep the explanation concise.
```

Resultado:

A IA cria um **mapa mental do sistema**.

Isso evita decisões erradas depois.

---

# 2. Planning prompt

Agora você pede o plano de implementação.

Prompt:

```text
Design the implementation plan for this feature.

Output:
1 architecture decisions
2 files to create
3 files to modify
4 tests to implement
5 potential risks
```

Resultado:

Você recebe um **plano técnico completo**.

Aqui você revisa.

Esse é o momento mais importante.

---

# 3. Spec prompt

Agora você transforma o plano em uma especificação.

Prompt:

```text
Generate the implementation specification.

Include:
- data structures
- API contracts
- folder structure
- validation rules
- tests
```

Resultado:

Documento claro de implementação.

Exemplo:

```
.workspace/specs/DC-4162.md
```

---

# 4. Implementation prompt

Agora a IA executa.

Prompt:

```text
Read the specification.

Implement the feature accordingly.

Modify the repository files as needed.
```

Ferramentas que fazem isso bem:

* Cursor
* Aider
* Claude Code

A IA cria e edita vários arquivos.

---

# 5. Self-review prompt

Agora você pede uma revisão automática.

Prompt:

```text
Review the implementation.

Check:
- architecture consistency
- naming conventions
- duplication
- edge cases
- security concerns
```

Resultado:

A IA aponta problemas antes de você olhar.

---

# Seu papel no processo

Você vira **tech lead do sistema**.

Você faz:

* revisar plano
* revisar spec
* revisar resultado final

Você quase não escreve código.

---

# Exemplo real de ciclo

Feature nova.

Passo 1

```
Analyze repository
```

Passo 2

```
Design implementation plan
```

Passo 3

```
Generate specification
```

Passo 4

```
Implement feature
```

Passo 5

```
Run code review
```

---

# Produtividade típica

Dev tradicional

3–6 horas por feature

AI-driven workflow

30–90 minutos

Porque a IA escreve quase todo o código.

---

# Dica importante

A qualidade depende muito da **spec**.

Se a spec for ruim:

a implementação será ruim.

Se a spec for boa:

a implementação costuma sair quase perfeita.

---

# Para seu caso específico

Você trabalha com:

* .NET
* APIs
* automação
* arquitetura

Esse modelo funciona **muito bem**.

Especialmente para:

* endpoints
* integrações
* automações
* microservices

---

Se quiser, posso te mostrar também algo que **pouquíssimos devs usam**, mas aumenta muito a autonomia da IA:

**o modelo de prompts que cria um “engenheiro virtual permanente” dentro do seu workspace.**

Isso reduz ainda mais o trabalho manual.
