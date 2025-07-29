# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm i

# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Build de desenvolvimento
npm run build:dev

# Lint
npm run lint

# Preview da build
npm run preview
```

## Arquitetura do Sistema

Este é um sistema de rastreamento de chamados de suporte construído com:
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Roteamento**: React Router DOM
- **Estado**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Banco de Dados**: PostgreSQL com Row Level Security

### Estrutura de Páginas

- `/` e `/dashboard` - Dashboard público (componente `DashboardPublic`)
- `/admin` - Área administrativa protegida por autenticação simples

### Sistema de Autenticação

A aplicação utiliza autenticação simples baseada em localStorage:
- Senha: definida no componente `SimpleAuth`
- Sessão: expira em 4 horas automaticamente
- Verificação: realizada no componente `Admin`

### Banco de Dados (Supabase)

**Tabelas principais:**
- `registros_chamados_diarios` - Registros diários de chamados por integrante
- `intercom_monthly_stats` - Estatísticas mensais do Intercom
- `notes` - Sistema de anotações

**Configuração:**
- RLS (Row Level Security) habilitado
- Políticas públicas para todas as operações (sem autenticação)
- Timestamps automáticos com triggers

### Componentes Principais

**Dashboards:**
- `DashboardPublic` - Dashboard público com estatísticas
- `DailySummary` / `DailySummaryCompact` - Resumos diários

**Rastreamento:**
- `SupportTracker` / `SupportTrackerFixed` / `SupportTrackerSimple` - Diferentes versões do rastreador
- `IntercomMonthlyTracker` / `IntercomMonthlyTrackerFixed` - Rastreamento mensal do Intercom

**Visualização:**
- `IntercomViewer` - Visualizador de dados do Intercom
- `CSVUploader` - Upload e processamento de CSVs
- `NotesWidget` - Sistema de anotações

### Integração com Supabase

```typescript
// Cliente configurado em src/integrations/supabase/client.ts
import { supabase } from "@/integrations/supabase/client";

// Tipos TypeScript gerados automaticamente
import type { Database } from './types';
```

### Convenções de Código

- **Imports**: Usar alias `@/` para src/
- **Componentes**: PascalCase, um componente por arquivo
- **Hooks**: Prefixo `use` (ex: `use-mobile.tsx`, `use-toast.ts`)
- **Estilos**: Tailwind CSS com classes utilitárias
- **UI**: Componentes shadcn/ui em `src/components/ui/`

### Estrutura de Diretórios

```
src/
├── components/        # Componentes React
│   └── ui/           # Componentes shadcn/ui
├── hooks/            # Custom hooks
├── integrations/     # Integrações externas
│   └── supabase/     # Cliente e tipos Supabase
├── lib/              # Utilitários
└── pages/            # Páginas da aplicação
```

### Migrations do Banco

Migrations estão em `supabase/migrations/` e incluem:
- Criação de tabelas com constraints
- Configuração de RLS e policies
- Índices para performance
- Functions e triggers para timestamps automáticos

### Variáveis de Ambiente

As credenciais do Supabase estão hardcoded em `src/integrations/supabase/client.ts`:
- URL: `https://nrlxuiorheypaxypesrn.supabase.co`
- Chave pública: definida no arquivo client.ts