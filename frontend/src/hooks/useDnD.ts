import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

export const useDnD = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return { sensors };
};
