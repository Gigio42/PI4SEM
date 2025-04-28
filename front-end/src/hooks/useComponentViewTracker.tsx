import { useEffect } from 'react';
import componentsService from '@/services/components.service';

/**
 * Hook para rastrear a visualização de um componente
 * 
 * @param componentId ID do componente sendo visualizado
 * @param shouldTrack Flag para controlar quando o rastreamento deve ocorrer (opcional)
 */
export function useComponentViewTracker(componentId: number | null, shouldTrack = true) {
  useEffect(() => {
    // Só rastreia se houver um ID válido e shouldTrack for true
    if (componentId && shouldTrack) {
      const trackView = async () => {
        try {
          await componentsService.getComponentById(componentId);
          // O rastreamento é feito dentro do método getComponentById
        } catch (error) {
          console.error('Error tracking component view:', error);
        }
      };

      trackView();
    }
  }, [componentId, shouldTrack]);
}

/**
 * Hook para rastrear a visualização de múltiplos componentes
 * 
 * @param componentIds Array de IDs de componentes sendo visualizados
 * @param shouldTrack Flag para controlar quando o rastreamento deve ocorrer (opcional)
 */
export function useBulkComponentViewTracker(componentIds: number[], shouldTrack = true) {
  useEffect(() => {
    // Só rastreia se houver IDs e shouldTrack for true
    if (componentIds.length > 0 && shouldTrack) {
      const trackViews = async () => {
        try {
          // Registra cada visualização
          const trackPromises = componentIds.map(id => 
            componentsService.getComponentById(id).catch(err => console.error(`Error tracking view for component ${id}:`, err))
          );
          
          await Promise.all(trackPromises);
        } catch (error) {
          console.error('Error tracking component views:', error);
        }
      };

      trackViews();
    }
  }, [componentIds.join(','), shouldTrack]); // Usando join para criar uma string dependência que muda quando o array muda
}
