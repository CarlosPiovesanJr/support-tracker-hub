# Support Tracker Hub

Sistema completo de rastreamento e análise de chamados de suporte com dashboard em tempo real.

## 🚀 Características

- **Dashboard Público**: Visualização em tempo real de estatísticas de chamados
- **Área Administrativa**: Registro diário de chamados por integrante
- **Integração Supabase**: Banco de dados PostgreSQL com RLS
- **Sistema de Ajustes**: Controles +/- para ajustar totais em tempo real
- **Autenticação Simples**: Proteção da área administrativa
- **Responsivo**: Interface adaptada para desktop e mobile

## 🛠 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI  
- **Roteamento**: React Router DOM
- **Estado**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Deploy**: Docker + Nginx

## 📊 Funcionalidades

### Dashboard Público
- Estatísticas do dia atual
- Top performers individual
- Dados combinados WhatsApp + Intercom
- Histórico por período
- Filtros por atendente e data

### Área Administrativa
- Registro diário de chamados por integrante
- Sistema de ajustes com controles +/-
- Salvamento automático no banco
- Resumo em tempo real
- Gestão de notas e anotações

## 🏃‍♂️ Como Executar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Lint
npm run lint
```

### Deploy com Docker

```bash
# Build da imagem
docker build -t support-tracker-hub .

# Executar container
docker run -p 80:80 support-tracker-hub
```

### Estrutura do Banco

```sql
-- Tabela principal
registros_chamados_diarios
- id (uuid)
- data (date)
- integrante (text)
- chamados_whatsapp (integer)
- created_at (timestamp)
- updated_at (timestamp)

-- Dados mensais do Intercom
intercom_monthly_stats
- id (uuid)
- user_name (text)
- monthly_total (integer)
- evaluation_percentage (decimal)
- month (date)
```

## 🔧 Configuração

### Variáveis de Ambiente

As credenciais do Supabase estão configuradas em `src/integrations/supabase/client.ts`.

### Autenticação

A área administrativa usa autenticação simples baseada em localStorage com sessão de 4 horas.

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção  
npm run build

# Build de desenvolvimento
npm run build:dev

# Linting
npm run lint

# Preview da build
npm run preview
```

## 🌟 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

**Support Tracker Hub** - Sistema de rastreamento de chamados de suporte © 2025
