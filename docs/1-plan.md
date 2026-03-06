# MoedaMix - Plano de Desenvolvimento

## 1. O Que Foi Feito

### Sistema de Autenticacao e Contas

| Funcionalidade | Status |
|----------------|--------|
| Landing page com login/registro | Concluido |
| Registro com validacao completa (email, CPF/CNPJ, telefone, senha forte) | Concluido |
| Confirmacao de email com codigo (mock: XPX-7F5G) | Concluido |
| Login com email/senha | Concluido |
| Controle de tentativas de login (bloqueio apos 5 falhas) | Concluido |
| Recuperacao de senha (forgot/reset password) | Concluido |
| Gerenciamento de sessao (expira em 30 min de inatividade) | Concluido |
| Login direto para testes (paulilio.ferreira@gmail.com) | Concluido |

### Perfil do Usuario

| Funcionalidade | Status |
|----------------|--------|
| Botao de perfil na sidebar (foto/iniciais, nome, tipo de plano) | Concluido |
| Menu dropdown com opcoes | Concluido |
| Modal de configuracoes da conta (perfil, seguranca, cobranca) | Concluido |
| Modal de personalizacao (tema, idioma, layout) | Concluido |
| Modal de upgrade de plano (Free, Premium, Pro) | Concluido |
| Logout com limpeza de sessao | Concluido |

### Isolamento de Dados por Usuario

| Funcionalidade | Status |
|----------------|--------|
| Campo userId em todas as entidades | Concluido |
| Servico de migracao de dados legados | Concluido |
| Filtros por userId em todas as operacoes | Concluido |
| Prevencao de acesso cross-user | Concluido |

### Auditoria e Logging

| Funcionalidade | Status |
|----------------|--------|
| Sistema de audit logs | Concluido |
| Pagina admin para visualizacao de logs | Concluido |
| Registro de eventos: login, logout, alteracoes | Concluido |

### Infraestrutura

| Funcionalidade | Status |
|----------------|--------|
| Footer global com versao e ambiente | Concluido |
| Documentacao tecnica (4 arquivos em /docs) | Concluido |
| Upgrade Next.js para 14.2.35 | Concluido |
| Configuracao Node.js 22 | Concluido |

### Modulos de Negocio (Pre-existentes)

- Dashboard com resumo financeiro e grafico de fluxo de caixa
- Gestao de transacoes com recorrencia
- Gestao de categorias e grupos de categorias
- Gestao de contatos
- Orcamento por categoria
- Configuracoes do sistema

---

## 2. Proposta para Producao

### Fase 1: Seguranca e Backend (Prioridade Alta)

| Item | Descricao | Esforco |
|------|-----------|---------|
| Banco de dados | Migrar de localStorage para PostgreSQL/Supabase | 3-5 dias |
| API REST | Criar endpoints para todas as entidades | 5-7 dias |
| Hash de senha | Implementar bcrypt no backend | 1 dia |
| JWT | Substituir sessao localStorage por tokens JWT | 2 dias |
| OAuth real | Integrar Google e Microsoft OAuth | 2-3 dias |
| Rate limiting | Proteger endpoints contra abuso | 1 dia |
| HTTPS/CORS | Configurar seguranca de transporte | 1 dia |

### Fase 2: Funcionalidades Faltantes (Prioridade Media)

| Item | Descricao | Esforco |
|------|-----------|---------|
| Contas bancarias | CRUD de contas (corrente, poupanca, cartao) | 2-3 dias |
| Transferencias | Movimentacao entre contas | 1-2 dias |
| Relatorios | Graficos e exportacao PDF/Excel | 3-5 dias |
| Notificacoes | Alertas de vencimento, limites | 2 dias |
| Busca global | Pesquisa em transacoes, contatos, categorias | 1-2 dias |
| Importacao OFX/CSV | Importar extratos bancarios | 2-3 dias |

### Fase 3: Qualidade e UX (Prioridade Media)

| Item | Descricao | Esforco |
|------|-----------|---------|
| Testes E2E | Playwright/Cypress para fluxos criticos | 3-5 dias |
| Testes unitarios | Jest para hooks e services | 2-3 dias |
| Acessibilidade | Auditoria WCAG e correcoes | 2 dias |
| Mobile responsivo | Ajustes finos para telas pequenas | 2 dias |
| Internacionalizacao | Suporte a EN alem de PT-BR | 2-3 dias |
| Loading states | Skeletons em todas as paginas | 1 dia |

### Fase 4: DevOps e Monitoramento (Prioridade Media)

| Item | Descricao | Esforco |
|------|-----------|---------|
| CI/CD | GitHub Actions com testes e deploy | 1-2 dias |
| Monitoramento | Sentry para erros, Analytics | 1 dia |
| Backup | Estrategia de backup do banco | 1 dia |
| Ambiente staging | Preview deployments na Vercel | 1 dia |

### Fase 5: Monetizacao (Prioridade Baixa)

| Item | Descricao | Esforco |
|------|-----------|---------|
| Stripe | Integracao real de pagamentos | 2-3 dias |
| Planos | Restricoes por plano (limites de transacoes) | 2 dias |
| Trial | Periodo de teste para Premium/Pro | 1 dia |

---

### Cronograma Sugerido

```
Semana 1-2: Fase 1 (Backend e Seguranca)
Semana 3-4: Fase 2 (Funcionalidades)
Semana 5:   Fase 3 (Qualidade)
Semana 6:   Fase 4 (DevOps) + Fase 5 (Monetizacao)
Semana 7:   Testes finais e lancamento
```

### Checklist Pre-Producao

- [ ] Remover login direto de teste
- [ ] Remover dados mock dos arquivos JSON
- [ ] Configurar variaveis de ambiente de producao
- [ ] Testar fluxo completo de registro ate dashboard
- [ ] Testar recuperacao de senha com email real
- [ ] Validar LGPD (termos de uso, politica de privacidade)
- [ ] Configurar dominio e SSL
- [ ] Monitoramento de erros ativo
