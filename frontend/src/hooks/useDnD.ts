import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState, useCallback } from 'react';

export const useDnD = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: any) => {
    setDraggedId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event: any) => {
    setDraggedId(null);
    // Additional drag end logic can be handled in Dashboard
  }, []);

  return {
    sensors,
    draggedId,
    handleDragStart,
    handleDragEnd,
  };
};
