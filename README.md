# UXperiment-Labs

Uma plataforma abrangente para desenvolvimento, experimentação e compartilhamento de componentes de UI. O UXperiment-Labs permite que os usuários explorem, personalizem e implementem componentes modernos de interface de usuário com facilidade.

## Visão Geral do Projeto

UXperiment-Labs é uma aplicação full-stack que oferece aos desenvolvedores e designers uma biblioteca de componentes de UI prontos para uso, estilos e templates. A plataforma oferece diferentes planos de assinatura que garantem acesso a recursos premium.

O sistema é construído com uma stack tecnológica moderna:
- **Frontend**: Next.js com React e TypeScript
- **Backend**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT e Google OAuth

## Arquitetura do Sistema

A aplicação segue uma arquitetura cliente-servidor:

### Frontend (Next.js)
- Implementa estrutura App Router
- Usa contexto React para gerenciamento de estado
- Fornece UI responsiva com princípios modernos de design
- Implementa controle de acesso baseado em papéis (usuário vs administrador)

### Backend (NestJS)
- API RESTful com arquitetura modular
- Integração com Prisma ORM para operações de banco de dados
- Autenticação com estratégias JWT e Google OAuth
- Autorização baseada em papéis para recursos protegidos

### Banco de Dados (PostgreSQL)
- Banco de dados relacional com esquema robusto
- Modelos para usuários, componentes, assinaturas, planos e análises

## Principais Funcionalidades

### Biblioteca de Componentes
- Navegue e pesquise componentes de UI por categoria
- Visualize componentes com demonstrações interativas
- Copie código HTML e CSS para implementação direta
- Adicione componentes aos favoritos para acesso rápido

### Sistema de Assinatura
- Múltiplos níveis de planos (gratuito, básico, premium)
- Gerenciamento de assinaturas com renovação e cancelamento
- Integração de processamento de pagamento
- Controle de acesso para conteúdo premium

### Autenticação de Usuário
- Login por email/senha
- Integração com Google OAuth
- Gerenciamento de sessão com JWT
- Permissões baseadas em papéis (administrador vs usuários comuns)

### Painel de Administração
- Gerenciamento de usuários
- Gerenciamento de componentes
- Gerenciamento de assinaturas
- Análises e estatísticas

## Modelos de Dados

A aplicação inclui os seguintes modelos de dados principais:

### Usuário
- Detalhes de autenticação (email, senha, ID do Google)
- Informações de perfil (nome, imagem)
- Papel (usuário ou administrador)
- Relacionamento com assinaturas e favoritos

### Componente
- Detalhes do componente UI (nome, conteúdo CSS, conteúdo HTML)
- Categorização e estilização
- Estatísticas de visualização

### Assinatura
- Relacionamento usuário-plano
- Datas de início e fim
- Status (ativo, cancelado, expirado, pendente)
- Informações de pagamento

### Plano
- Detalhes do nível de preço (nome, descrição, preço)
- Duração e recursos
- Informações de desconto

### Estatísticas
- Análises de visualizações de componentes
- Métricas de atividade do usuário
- Acompanhamento de assinaturas e receita

## Configuração e Instalação

### Pré-requisitos
- Node.js (v16+)
- PostgreSQL
- npm ou pnpm

### Configuração do Ambiente de Desenvolvimento

1. Clone o repositório:
   ```
   git clone https://github.com/yourusername/UXperiment-Labs.git
   cd UXperiment-Labs
   ```

2. Instale as dependências:
   ```
   npm run install-all
   ```
   
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` no diretório `back-end` com a string de conexão do banco de dados e o segredo JWT

4. Inicie os servidores de desenvolvimento:
   ```
   npm run dev
   ```
   Isso iniciará os servidores frontend e backend no modo de desenvolvimento.

## Estrutura do Projeto

```
UXperiment-Labs/
├── back-end/                # Backend NestJS
│   ├── prisma/              # Esquema de banco de dados e migrações
│   │   ├── schema.prisma    # Definição do esquema Prisma
│   │   └── migrations/      # Migrações de banco de dados
│   └── src/                 # Código fonte
│       ├── auth/            # Módulo de autenticação
│       ├── components/      # Módulo de componentes
│       ├── favoritos/       # Módulo de favoritos
│       ├── plans/           # Módulo de planos de assinatura
│       ├── statistics/      # Módulo de análise
│       ├── subscription/    # Módulo de assinatura
│       └── users/           # Módulo de usuários
│
├── front-end/               # Frontend Next.js
│   ├── public/              # Ativos estáticos
│   └── src/                 # Código fonte
│       ├── app/             # Next.js App Router
│       │   ├── components/  # Componentes UI
│       │   ├── styles/      # Página de estilos CSS
│       │   ├── adm/         # Painel de administração
│       │   └── subscription/# Gerenciamento de assinatura
│       ├── contexts/        # Contextos React
│       ├── hooks/           # Hooks React personalizados
│       ├── services/        # Serviços de API
│       └── types/           # Definições de tipos TypeScript
```

## Funcionalidades Baseadas em Papéis

### Funcionalidades de Usuário Regular
- Navegar e pesquisar componentes
- Visualizar detalhes e código dos componentes
- Salvar componentes como favoritos
- Assinar planos premium
- Acessar estilos e templates
- Gerenciar assinatura

### Funcionalidades de Administrador
- Gerenciar componentes (criar, editar, excluir)
- Gerenciar usuários (visualizar, editar papéis)
- Gerenciar planos de assinatura
- Visualizar estatísticas da plataforma
- Acesso a todos os componentes sem necessidade de assinatura

## Regras de Negócio

1. Administradores não podem ter assinaturas no sistema.
2. Componentes podem ser marcados como premium e acessíveis apenas para usuários com assinaturas ativas.
3. Assinaturas têm durações específicas e datas de expiração.
4. Usuários podem cancelar assinaturas a qualquer momento, mas manterão o acesso até o final do período de cobrança atual.
5. O sistema rastreia visualizações de componentes e outras estatísticas para fins analíticos.

## Documentação da API

A API fornece endpoints para todas as principais funcionalidades:

### Autenticação
- `POST /auth/login` - Autenticar usuário
- `GET /auth/google` - Iniciar fluxo OAuth do Google
- `GET /auth/google/redirect` - Tratar retorno OAuth do Google

### Usuários
- `POST /users` - Criar um novo usuário
- `GET /users/login` - Login do usuário
- `GET /users/:userId` - Obter detalhes do usuário

### Componentes
- `GET /components` - Listar todos os componentes
- `GET /components/:id` - Obter detalhes do componente
- `POST /components` - Criar um componente (somente administrador)
- `PUT /components/:id` - Atualizar um componente (somente administrador)
- `DELETE /components/:id` - Excluir um componente (somente administrador)

### Assinaturas
- `GET /subscriptions/plans` - Listar planos disponíveis
- `GET /subscriptions/user/:userId` - Obter assinaturas do usuário
- `POST /subscriptions` - Criar uma assinatura
- `PATCH /subscriptions/:id/cancel` - Cancelar uma assinatura

### Favoritos
- `GET /favoritos/user/:userId` - Obter favoritos do usuário
- `POST /favoritos` - Adicionar componente aos favoritos
- `DELETE /favoritos/:id` - Remover componente dos favoritos
