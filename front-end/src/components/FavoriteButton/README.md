# Componente de Favoritos

Este componente permite adicionar a funcionalidade de favoritos em qualquer parte da aplicação UXperiment Labs. Ele foi projetado para ser reutilizável, fácil de implementar e fornecer feedback visual ao usuário.

## Como usar

### 1. Botão de Favorito

O componente `FavoriteButton` pode ser adicionado em qualquer página ou componente:

```tsx
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';

// Dentro do seu componente ou página:
<FavoriteButton 
  componentId={component.id}
  userId={userId}
  initialState={false} // ou true se já for favorito
  onToggle={(isFavorite) => {
    // Lógica a ser executada quando o estado de favorito mudar
    console.log(isFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }}
  size="medium" // "small", "medium" ou "large"
  className="classeCss" // Classe CSS opcional para personalização
/>
```

### 2. Sistema de Notificações

Para mostrar notificações de feedback ao usuário:

```tsx
import { useNotification } from '@/contexts/NotificationContext';

// Dentro do seu componente ou página:
const { showToast } = useNotification();

// Para mostrar uma notificação:
showToast('Componente adicionado aos favoritos', 'success');
// Tipos disponíveis: 'success', 'error', 'info', 'warning'
```

## Funcionalidades

- **Botão de favorito animado**: O botão possui uma animação suave ao clicar
- **Estado de carregamento**: Mostra um indicador visual quando a operação está em andamento
- **Feedback visual**: Notificações toast informam o usuário sobre o resultado da ação
- **Diferentes tamanhos**: O botão pode ser configurado em diferentes tamanhos
- **Personalização via CSS**: O botão pode receber classes CSS adicionais para personalização

## Considerações

- O componente verifica automaticamente o status de favorito ao ser montado
- O botão é acessível, com atributos aria-label e title
- Ele evita múltiplos cliques durante o carregamento
- A funcionalidade inclui tratamento de erros

## Exemplos de Uso

### Em cards de componentes:
```tsx
<div className="componentCard">
  <div className="cardHeader">
    <h3>{component.name}</h3>
    <FavoriteButton 
      componentId={component.id}
      userId={userId}
      size="small"
    />
  </div>
  {/* Resto do card */}
</div>
```

### Em páginas de detalhes:
```tsx
<div className="componentDetails">
  <h1>{component.name}</h1>
  <div className="actions">
    <FavoriteButton 
      componentId={component.id}
      userId={userId}
      size="large"
      onToggle={(isFavorite) => {
        showToast(
          isFavorite 
            ? 'Componente adicionado aos favoritos' 
            : 'Componente removido dos favoritos',
          isFavorite ? 'success' : 'info'
        );
      }}
    />
    {/* Outros botões de ação */}
  </div>
  {/* Resto dos detalhes */}
</div>
```
