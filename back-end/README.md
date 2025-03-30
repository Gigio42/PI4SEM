# API Documentation

## **Rotas Disponíveis**

### **Usuários**

#### **1. Criar Usuário**
- **Rota:** `POST /users`
- **Descrição:** Cria um novo usuário.
- **Parâmetros no Corpo da Requisição (JSON):**
  ```json
  {
    "email": "string",
    "password": "string"
  }

Resposta (JSON):
```json
  {
    "id": "number",
    "email": "string",
    "password": "string"
  }

2. Login do Usuário
Rota: GET /users/login
Descrição: Faz login de um usuário.

Parâmetros no Corpo da Requisição (JSON):
{
  "email": "string",
  "password": "string"
}

Resposta (JSON):
{
  "message": "Login bem-sucedido"
}

Erros Possíveis:
404 Not Found: "Usuário ou senha inválidos."

3. Adicionar Subscription a um Usuário
Rota: POST /users/:userId/subscription
Descrição: Adiciona uma assinatura a um usuário.
Parâmetros na URL:
userId (number): ID do usuário.
Parâmetros no Corpo da Requisição (JSON):
{
  "type": "string",
  "startDate": "ISO 8601 date string",
  "endDate": "ISO 8601 date string",
  "status": "boolean"
}

Resposta (JSON):
{
  "id": "number",
  "type": "string",
  "startDate": "ISO 8601 date string",
  "endDate": "ISO 8601 date string",
  "status": "boolean",
  "userId": "number"
}

Erros Possíveis:
404 Not Found: "Usuário com ID X não encontrado."
400 Bad Request: "Dados da assinatura incompletos." ou "A data de início deve ser anterior à data de término."

4. Verificar Subscription de um Usuário
Rota: GET /users/:userId/subscription
Descrição: Verifica se um usuário já possui uma assinatura.
Parâmetros na URL:
userId (number): ID do usuário.
Resposta (JSON):
{
  "id": "number",
  "type": "string",
  "startDate": "ISO 8601 date string",
  "endDate": "ISO 8601 date string",
  "status": "boolean",
  "userId": "number",
  "user": {
    "id": "number",
    "email": "string",
    "password": "string",
    "googleId": "string",
    "name": "string",
    "picture": "string"
  }
}

Erros Possíveis:
404 Not Found: "Usuário com ID X não encontrado." ou "O usuário com ID X não possui uma assinatura."

Autenticação com Google

5. Iniciar Login com Google
Rota: GET /auth/google
Descrição: Redireciona o usuário para o fluxo de autenticação do Google.
Parâmetros: Nenhum.
Resposta: Redireciona para o Google.

6. Callback do Google
Rota: GET /auth/google/redirect
Descrição: Trata o redirecionamento do Google após a autenticação.
Parâmetros: Nenhum.
Resposta: Redireciona para o frontend.

Componentes

7. Criar Componente
Rota: POST /components
Descrição: Cria um novo componente CSS.

Parâmetros no Corpo da Requisição (JSON):
{
  "name": "string",
  "cssContent": "string"
}

Resposta (JSON):
{
  "id": "number",
  "name": "string",
  "cssContent": "string"
}

8. Listar Componentes
Rota: GET /components
Descrição: Retorna todos os componentes CSS.
Parâmetros: Nenhum.
Resposta (JSON):
[
  {
    "id": "number",
    "name": "string",
    "cssContent": "string"
  }
]
