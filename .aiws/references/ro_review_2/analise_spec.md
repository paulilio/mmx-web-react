Uma boa revisão de **spec** não olha código.
Ela verifica **clareza, completude e risco**. Se a spec estiver boa, a IA quase sempre implementa corretamente.

Use um **checklist objetivo**.

---

# 1. Objetivo da feature

Pergunta principal

Você consegue explicar a feature em **uma frase clara**?

Exemplo ruim

Improve project API.

Exemplo bom

Expose read-only endpoints that return project metadata and bid summary for external consumers.

Verifique:

• objetivo claro
• quem usa a feature
• resultado esperado

---

# 2. Escopo bem definido

A spec precisa dizer **o que entra e o que não entra**.

Checklist

* funcionalidades incluídas
* funcionalidades fora do escopo
* dependências externas

Exemplo

```
In scope
Read project metadata
Read bid summary

Out of scope
Create project
Update project
```

Isso evita expansão de escopo pela IA.

---

# 3. Estrutura técnica

Veja se a spec define **onde o código vai ficar**.

Checklist

* camadas afetadas
* serviços envolvidos
* repositórios envolvidos
* arquivos novos

Exemplo

```
Controllers
ProjectsController

Services
ProjectReadService

Repositories
ProjectRepository
```

Se isso faltar, a IA pode espalhar código errado.

---

# 4. Contratos de dados

A spec deve definir **entrada e saída**.

Checklist

* request model
* response model
* campos obrigatórios
* validações

Exemplo

```
GET /api/projects/{id}

Response

{
 id
 name
 status
 createdAt
}
```

Sem isso a IA inventa estruturas.

---

# 5. Fluxo de execução

Veja se a spec mostra **o caminho da lógica**.

Exemplo

```
Controller receives request
Service validates input
Repository queries database
Service maps domain to response DTO
Controller returns response
```

Isso evita lógica no lugar errado.

---

# 6. Edge cases

Uma boa spec lista casos especiais.

Checklist

* recurso não encontrado
* erro de autenticação
* dados inconsistentes
* timeout externo

Exemplo

```
If project does not exist
Return 404
```

A IA raramente inventa esses casos.

---

# 7. Testes

Verifique se existem cenários de teste.

Checklist

* teste de sucesso
* teste de erro
* teste de validação

Exemplo

```
Test cases

valid project id → returns project
invalid id → returns 404
missing auth → returns 401
```

---

# 8. Riscos técnicos

A spec deve listar riscos.

Exemplo

```
Risk

ProjectRepository currently used only internally.
May require query optimization.
```

Isso evita surpresas na implementação.

---

# 9. Impacto no sistema

Veja se a spec fala sobre impacto.

Checklist

* performance
* segurança
* dependências

Exemplo

```
Endpoint must respect existing authentication middleware.
```

---

# 10. Critério de aceite

A spec deve dizer quando a tarefa está pronta.

Exemplo

```
Feature complete when:

Endpoints return expected data
All tests pass
Code follows conventions
```

---

# Checklist rápido para revisar uma spec

Antes de aprovar, confirme:

• objetivo claro
• escopo definido
• arquitetura correta
• contratos de dados definidos
• fluxo lógico descrito
• edge cases listados
• testes definidos
• riscos documentados
• impacto no sistema
• critérios de aceite

---

# Prompt que ajuda na revisão

Use com a IA:

```
Review this specification.

Check:

clarity of requirements
architecture alignment
missing edge cases
data contracts
test coverage
technical risks
```

---

# Dica importante

Se a spec tiver menos de **500–800 palavras**, geralmente está incompleta para features médias.

---

Se quiser, posso te mostrar também **um template de spec usado em times que trabalham com desenvolvimento quase 100% feito por IA**. Ele aumenta muito a qualidade da implementação automática.


___


Segue um **template de spec otimizado para IA**.
Ele foi pensado para permitir que a IA **planeje, implemente e revise quase sozinha**.

Use esse formato para qualquer feature.

---

# Template de Specification

```text
# Feature Specification

## 1. Goal

Describe the feature in one clear sentence.

Example

Expose read-only endpoints that return BidDay project metadata and bid summary.

---

## 2. Business Context

Explain why the feature exists.

Who will use it  
What problem it solves

Example

External systems need access to project information through a public API.

---

## 3. Scope

### In Scope

List what must be implemented.

Example

GET project metadata  
GET bid summary

### Out of Scope

List what must not be implemented.

Example

Create project  
Update project  
Delete project

---

## 4. Architecture

Explain where the logic belongs.

Example

Controller receives request  
Service executes business logic  
Repository reads data from database

Dependency rule

Controller → Service → Repository

---

## 5. Data Contracts

Define request and response models.

Example

Endpoint

GET /api/projects/{id}

Response

{
 id
 name
 status
 createdAt
}

---

## 6. Execution Flow

Describe step by step behavior.

Example

1 Controller receives request  
2 Validate authentication  
3 Service retrieves project data  
4 Repository queries database  
5 Service maps entity to DTO  
6 Controller returns response

---

## 7. Edge Cases

List exceptional scenarios.

Example

Project does not exist → return 404  
Unauthorized request → return 401  
Invalid id format → return 400

---

## 8. Performance Considerations

Example

Repository query must use indexed column on projectId.

---

## 9. Security Considerations

Example

Endpoint must pass through existing authentication middleware.

---

## 10. Tests

Define test scenarios.

Example

Valid project id returns project data  
Invalid id returns 404  
Unauthorized request returns 401

---

## 11. Acceptance Criteria

The feature is complete when:

Endpoints return expected data  
Tests pass  
Code follows project conventions
```

---

# Como revisar rapidamente

Leia apenas 5 pontos:

1 Goal
2 Scope
3 Architecture
4 Data Contracts
5 Edge Cases

Se esses cinco estiverem claros, a implementação costuma sair correta.

---

# Como usar com IA

Depois de escrever a spec, peça:

```
Read the specification.

Generate an implementation plan.

Then implement the feature following the architecture and conventions.
```

---

# Tamanho ideal da spec

Feature pequena
300–600 palavras

Feature média
600–1200 palavras

Feature grande
1200–2000 palavras

---

# Dica que melhora muito o resultado

Adicione sempre uma seção chamada **Execution Flow**.

IA implementa melhor quando entende **o fluxo passo a passo**.

---

Se quiser, posso te mostrar também **um prompt extremamente eficiente que faz a IA revisar sua spec como se fosse um arquiteto sênior**. Isso costuma encontrar erros antes da implementação.


____


Sim.
Se você **souber escrever boas specs**, já tem a habilidade mais importante para trabalhar com IA no desenvolvimento.

Mas existe um detalhe importante.

**Spec boa não é só descrição.**
Ela precisa conter **estrutura técnica suficiente para guiar a IA**.

Pense assim:

Você não está escrevendo documentação.
Você está escrevendo **instruções de engenharia**.

---

# O que realmente controla a qualidade do código gerado

A qualidade da implementação depende principalmente de quatro coisas.

### 1. Clareza do objetivo

A IA precisa entender exatamente **o que resolver**.

Exemplo ruim

Improve project API.

Exemplo bom

Expose read-only endpoints returning project metadata and bid summary for external consumers.

---

### 2. Arquitetura definida

A spec precisa dizer **onde cada parte da lógica vai ficar**.

Sem isso a IA pode:

* colocar lógica em controller
* duplicar código
* quebrar arquitetura

Exemplo

Controller → Service → Repository

---

### 3. Contratos de dados

A IA precisa saber **o formato dos dados**.

Sem isso ela inventa modelos.

Exemplo

```
GET /api/projects/{id}

Response

{
 id
 name
 status
 createdAt
}
```

---

### 4. Fluxo de execução

A IA implementa muito melhor quando existe **sequência lógica**.

Exemplo

1 Controller recebe request
2 Service valida dados
3 Repository consulta banco
4 Service monta DTO
5 Controller retorna resposta

---

# O papel humano nesse modelo

Você vira algo próximo de um **arquiteto ou tech lead**.

Seu trabalho passa a ser:

* definir problema
* escrever spec
* revisar implementação

Você escreve **menos código**.

---

# Por que isso funciona bem com IA

Modelos de linguagem são excelentes em:

* transformar instrução em código
* completar padrões
* replicar arquitetura

Mas são fracos em:

* decidir arquitetura
* definir requisitos
* entender intenção do produto

Essas partes continuam sendo humanas.

---

# Regra prática

Se uma spec responde claramente estas perguntas, ela geralmente é suficiente.

* O que precisa ser construído
* Onde cada parte deve ficar
* Como os dados entram e saem
* Qual o fluxo da lógica
* Quais erros precisam ser tratados

---

# Uma habilidade ainda mais poderosa

Existe uma habilidade que acelera ainda mais esse processo:

**saber quebrar uma feature em várias specs menores.**

Isso melhora muito a qualidade da implementação automática.

Se quiser, posso te mostrar **o método que engenheiros usam para decompor qualquer feature complexa em specs que a IA consegue implementar quase sem erro**.


____



Sim. A chave é **decompor a feature em specs pequenas e executáveis**. Cada spec deve caber em um ciclo curto de implementação e revisão.

---

## Método prático de decomposição

### 1. Defina o resultado final

Escreva a feature em uma frase.

Exemplo
Expose public API for reading BidDay project data.

---

### 2. Separe por responsabilidades técnicas

Divida pela arquitetura do sistema.

Checklist

* endpoint
* serviço
* acesso a dados
* validação
* testes

Exemplo

```text
1 create endpoint
2 implement service logic
3 implement repository query
4 add validation
5 create tests
```

Cada item pode virar uma spec.

---

### 3. Separe por domínio de dados

Se a feature envolve vários tipos de dados, crie uma spec para cada um.

Exemplo

```text
Spec 1
Get project metadata

Spec 2
Get bid summary

Spec 3
Get bid participants
```

Isso reduz complexidade.

---

### 4. Separe por risco técnico

Partes mais incertas viram specs isoladas.

Exemplo

```text
Spec
Investigate query performance for project summary endpoint
```

Isso evita problemas grandes na implementação principal.

---

### 5. Limite o tamanho da spec

Regra simples.

Uma spec ideal deve:

* afetar até 3 a 5 arquivos
* ter até 3 regras de negócio
* ser implementável em menos de 1 hora

Se passar disso, quebre novamente.

---

## Exemplo completo

Feature grande

Public API for BidDay.

Decomposição

```text
Spec 1
Create ProjectsController endpoint

Spec 2
Implement ProjectReadService

Spec 3
Create repository query for project metadata

Spec 4
Create repository query for bid summary

Spec 5
Add authentication validation

Spec 6
Implement API response DTOs

Spec 7
Create integration tests
```

Cada spec é pequena.

A IA executa muito melhor assim.

---

## Workflow ideal com IA

1 criar spec
2 revisar spec
3 pedir plano de implementação
4 pedir implementação
5 pedir revisão automática

---

## Prompt útil para quebrar specs

```text
Analyze this feature description.

Break it into small implementation specifications.

Each spec must be independently implementable.
```

---

## Regra que muda o jogo

Specs boas não descrevem **o que fazer apenas**.

Elas descrevem:

* responsabilidade
* arquitetura
* dados
* fluxo

Isso permite que a IA implemente quase sem supervisão.

---

Se quiser, posso te mostrar também **a estrutura de spec usada por equipes que trabalham com 90% do código gerado por IA**, que reduz drasticamente erros de implementação.
