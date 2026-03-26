# checkpoint

## Description
Criar, verificar ou listar checkpoints nomeados durante o desenvolvimento. Permite rastrear estado em tasks longas com multiplas fases.

## Usage
`/checkpoint [create|verify|list] [name]`

## Steps

### create
1. Verificar que o estado atual esta limpo (`git status`)
2. Registrar checkpoint em `.claude/checkpoints.log`:
   ```
   {timestamp} | {name} | {git_sha} | {branch}
   ```
3. Confirmar ao usuario

### verify
1. Ler checkpoint do log
2. Comparar estado atual com o checkpoint:
   - Arquivos modificados desde o checkpoint
   - Status atual dos testes vs checkpoint
   - Status do build
3. Reportar delta:
   ```
   CHECKPOINT: {name} ({sha})
   Arquivos alterados: X
   Build: OK / FAIL
   ```

### list
1. Ler `.claude/checkpoints.log`
2. Exibir todos os checkpoints com: nome, timestamp, SHA, branch

## When to use
- Tasks longas com fases distintas (pre-refactor, core-done, tests-green)
- Antes de mudancas arriscadas que podem exigir rollback
- Para rastrear progresso em features complexas

## Output
Checkpoint criado/verificado/listado com delta report quando verificando.
