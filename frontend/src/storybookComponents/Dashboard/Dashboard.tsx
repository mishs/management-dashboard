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
import { SwimLane } from './SwimLane/SwimLane';
import { TaskCard } from './TaskCard/TaskCard';
import { StatisticsSection } from '@storybookComponents/StatisticsSection/StatisticsSection';
import { SavingIndicator } from './SavingIndicator/SavingIndicator';
import { useGetTasksQuery, useUpdateTasksMutation } from '@store/api/tasksApi';
import { useDnD } from '@hooks/useDnD';
import { useAppDispatch, useAppSelector } from '@hooks';
import { setTasks, setActiveTask, moveTask } from '@store/slices/tasksSlice';
import { TaskWithSwimLane, LANE_NAMES } from '@types';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasksState = useAppSelector((state) => state.tasks);
  const { tasks: localTasks, activeTask: activeTaskId, saving } = tasksState;
  const { data: tasksData, isLoading, error } = useGetTasksQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    skip: localTasks.length > 0,
  });
  const [updateTasks] = useUpdateTasksMutation();
  const tasks: TaskWithSwimLane[] = localTasks;
  const swimLaneTasks = {
    1: React.useMemo(() => {
      const filtered = tasks.filter(t => t.swimLane === 1);
      console.log('🏊 Lane 1 tasks:', filtered.length, filtered.map(t => t.id));
      return filtered;
    }, [tasks]),
    2: React.useMemo(() => {
      const filtered = tasks.filter(t => t.swimLane === 2);
      console.log('🏊 Lane 2 tasks:', filtered.length, filtered.map(t => t.id));
      return filtered;
    }, [tasks]),
    3: React.useMemo(() => {
      const filtered = tasks.filter(t => t.swimLane === 3);
      console.log('🏊 Lane 3 tasks:', filtered.length, filtered.map(t => t.id));
      return filtered;
    }, [tasks]),
  };
  const { sensors } = useDnD();
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    dispatch(setActiveTask(String(active.id)));
  }, [dispatch]);
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('🎯 Drag end:', { activeId: active.id, overId: over?.id });
    dispatch(setActiveTask(null));
    if (!over) {
      console.log('❌ No drop target');
      return;
    }
    const taskId = parseInt(active.id as string);
    const targetLaneId = parseInt(over.id as string);
    console.log('📋 Task move:', { taskId, targetLaneId });
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('❌ Task not found:', taskId);
      return;
    }
    const sourceLaneId = task.swimLane;
    console.log('🔄 Move details:', { taskId, sourceLaneId, targetLaneId, taskName: task.taskName });
    if (sourceLaneId === targetLaneId) {
      console.log('⏭️ Same lane drop, skipping');
      return;
    }
    console.log('🚀 Dispatching moveTask action');
    dispatch(moveTask({
      taskId,
      sourceLane: sourceLaneId,
      targetLane: targetLaneId,
      newPriority: 1,
    }));
    toast.success(`Task moved to ${LANE_NAMES[targetLaneId as keyof typeof LANE_NAMES]}`);
  }, [tasks, dispatch, updateTasks]);
  useEffect(() => {
    console.log('🔄 useEffect - Initialize tasks:', {
      hasTasksData: !!tasksData,
      localTasksLength: localTasks.length,
    });
    if (tasksData && localTasks.length === 0) {
      const transformedTasks: TaskWithSwimLane[] = Object.entries(tasksData).flatMap(([laneId, laneTasks]) =>
        laneTasks.map((task: any) => ({
          ...task,
          swimLane: parseInt(laneId) as 1 | 2 | 3,
        }))
      );
      console.log('📥 Setting initial tasks:', transformedTasks.length);
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