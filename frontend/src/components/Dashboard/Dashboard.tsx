import React, { useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { toast } from 'sonner';
import { SwimLane } from '../SwimLane/SwimLane';
import { TaskCard } from '../TaskCard/TaskCard';
import { StatisticsSection } from '../StatisticsSection/StatisticsSection';
import { SavingIndicator } from '../SavingIndicator/SavingIndicator';
import { useGetTasksQuery, useUpdateTasksMutation } from '../../store/api/tasksApi';
import { useDnD } from '../../hooks/useDnD';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setTasks, setActiveTask, setSaving, moveTask } from '../../store/slices/tasksSlice';
import { calculateAffectedTasks } from '../../utils/taskHelpers';
import { TaskWithSwimLane, LANE_NAMES } from '../../types';

export const Dashboard: React.FC = () => {
  // State and hooks
  const dispatch = useAppDispatch();
  const tasksState = useAppSelector((state) => state.tasks);
  const { tasks: localTasks, activeTask: activeTaskId, saving } = tasksState;
  
  const { data: tasksData, isLoading, error } = useGetTasksQuery();
  const [updateTasks] = useUpdateTasksMutation();

  // Use local tasks from Redux state, fallback to API data
  const tasks: TaskWithSwimLane[] = React.useMemo(() => {
    if (localTasks.length > 0) {
      return localTasks;
    }
    if (isLoading || !tasksData) return [];
    return Object.entries(tasksData).flatMap(([laneId, laneTasks]) =>
      laneTasks.map(task => ({ ...task, swimLane: parseInt(laneId) as 1 | 2 | 3 }))
    );
  }, [localTasks, tasksData, isLoading]);

  // Memoize swimlane filtering
  const swimLaneTasks = {
    1: React.useMemo(() => tasks.filter(t => t.swimLane === 1), [tasks]),
    2: React.useMemo(() => tasks.filter(t => t.swimLane === 2), [tasks]),
    3: React.useMemo(() => tasks.filter(t => t.swimLane === 3), [tasks]),
  };

  // DnD hooks
  const { sensors, draggedId } = useDnD();

  // Handle drag start events
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    dispatch(setActiveTask(active.id));
  }, [dispatch]);

  // Handle drag end events
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    dispatch(setActiveTask(null));
    
    if (!over) return;

    const taskId = parseInt(active.id as string);
    const targetLaneId = parseInt(over.id as string);

    // Find the task in the flat array
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const sourceLaneId = task.swimLane;
    
    // Skip if dropping in the same lane
    if (sourceLaneId === targetLaneId) return;

    // Update local state immediately (optimistic update)
    dispatch(moveTask({
      taskId,
      sourceLane: sourceLaneId,
      targetLane: targetLaneId,
      newPriority: 1, // Will be recalculated in the reducer
    }));

    // Show success message
    toast.success(`Task moved to ${LANE_NAMES[targetLaneId as keyof typeof LANE_NAMES]}`);

    // Optionally update backend (commented out for now to ensure UI works)
    /*
    dispatch(setSaving(true));
    try {
      const affectedTasks = calculateAffectedTasks(
        tasks,
        taskId,
        sourceLaneId,
        targetLaneId,
        1
      );
      await updateTasks(affectedTasks).unwrap();
    } catch (error) {
      toast.error('Failed to update task. Please try again.');
      // Revert the optimistic update on error
      dispatch(moveTask({
        taskId,
        sourceLane: targetLaneId,
        targetLane: sourceLaneId,
        newPriority: task.priority,
      }));
    } finally {
      dispatch(setSaving(false));
    }
    */
  }, [tasks, dispatch, updateTasks]);

  // Initialize tasks from API data only once
  useEffect(() => {
    if (tasksData && localTasks.length === 0) {
      const transformedTasks: TaskWithSwimLane[] = Object.entries(tasksData).flatMap(([laneId, laneTasks]) =>
        laneTasks.map((task: any) => ({
          ...task,
          swimLane: parseInt(laneId) as 1 | 2 | 3,
        }))
      );
      dispatch(setTasks(transformedTasks));
    }
  }, [tasksData, dispatch, localTasks.length]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography color="error" align="center">
          Failed to load tasks. Please refresh the page.
        </Typography>
      </Container>
    );
  }

  return (
  <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', backgroundColor: 'var(--mui-bg-default)', fontFamily: 'Inter, Roboto, sans-serif', px: { xs: 2, md: 6 }, gap: 4 }} data-testid="dashboard">
      <Box sx={{ mb: 4 }}>
  <Typography variant="h1" component="h1" sx={{ mb: 1, fontSize: '1.65rem', fontWeight: 900, color: 'var(--mui-text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.12)', letterSpacing: '0.5px', fontFamily: 'Inter, Roboto, sans-serif' }}>
          My Fancy Task Dashboard
        </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mb: saving ? 1 : 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--mui-text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.12)', letterSpacing: '0.5px', fontFamily: 'Inter, Roboto, sans-serif' }}>
          Drag and drop tasks between swim lanes to update their status
        </Typography>
        {saving && <SavingIndicator />}
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <SwimLane laneId={1} tasks={swimLaneTasks[1]} />
          <SwimLane laneId={2} tasks={swimLaneTasks[2]} />
          <SwimLane laneId={3} tasks={swimLaneTasks[3]} />
        </Box>

        <DragOverlay>
          {activeTaskId ? (
            (() => {
              const foundTask = tasks.find(t => t.id.toString() === activeTaskId);
              return foundTask ? <TaskCard task={foundTask} isDragging /> : null;
            })()
          ) : null}
        </DragOverlay>
      </DndContext>

  <StatisticsSection tasks={tasks} />
    </Container>
  );
};