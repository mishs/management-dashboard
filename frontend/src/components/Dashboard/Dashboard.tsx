import React, { useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { toast } from 'sonner';
import { SwimLane } from '../SwimLane/SwimLane';
import { TaskCard } from '../TaskCard/TaskCard';
import { StatisticsSection } from '../StatisticsSection/StatisticsSection';
import { SavingIndicator } from '../SavingIndicator/SavingIndicator';
import { useGetTasksQuery, useUpdateTasksMutation } from '../../store/api/tasksApi';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setTasks, setActiveTask, setSaving, moveTask } from '../../store/slices/tasksSlice';
import { calculateAffectedTasks } from '../../utils/taskHelpers';
import { TaskWithSwimLane, LANE_NAMES } from '../../types';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, activeTask, saving } = useAppSelector((state) => state.tasks);
  
  const { data: tasksData, isLoading, error } = useGetTasksQuery();
  const [updateTasks] = useUpdateTasksMutation();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Transform API data to include swimLane property
  useEffect(() => {
    if (tasksData) {
      const transformedTasks: { [key: number]: TaskWithSwimLane[] } = {};
      
      Object.entries(tasksData).forEach(([laneId, laneTasks]) => {
        transformedTasks[parseInt(laneId)] = laneTasks.map(task => ({
          ...task,
          swimLane: parseInt(laneId) as 1 | 2 | 3,
        }));
      });
      
      dispatch(setTasks(transformedTasks));
    }
  }, [tasksData, dispatch]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id as string);
    
    // Find the task across all lanes
    let foundTask: TaskWithSwimLane | undefined;
    Object.values(tasks).forEach(laneTasks => {
      const task = laneTasks.find(t => t.id === taskId);
      if (task) foundTask = task;
    });
    
    if (foundTask) {
      dispatch(setActiveTask(foundTask));
    }
  }, [tasks, dispatch]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    dispatch(setActiveTask(null));
    
    if (!over) return;
    
    const taskId = parseInt(active.id as string);
    const targetLaneId = parseInt(over.id as string);
    
    // Find source lane and task
    let sourceLaneId: number | null = null;
    let task: TaskWithSwimLane | undefined;
    
    Object.entries(tasks).forEach(([laneId, laneTasks]) => {
      const foundTask = laneTasks.find(t => t.id === taskId);
      if (foundTask) {
        sourceLaneId = parseInt(laneId);
        task = foundTask;
      }
    });
    
    if (!sourceLaneId || !task) return;
    
    // Calculate new priority (append to end of target lane)
    const newPriority = tasks[targetLaneId].length + 1;
    
    // Calculate affected tasks
    const affectedTasks = calculateAffectedTasks(
      tasks,
      taskId,
      sourceLaneId,
      targetLaneId,
      newPriority
    );
    
    if (affectedTasks.length === 0) return;
    
    // Update local state optimistically
    dispatch(moveTask({
      taskId,
      sourceLane: sourceLaneId,
      targetLane: targetLaneId,
      newPriority,
    }));
    
    // Show saving indicator and persist to backend
    dispatch(setSaving(true));
    
    try {
      await updateTasks(affectedTasks).unwrap();
      
      if (sourceLaneId !== targetLaneId) {
        toast.success(`Task moved to ${LANE_NAMES[targetLaneId as keyof typeof LANE_NAMES]}`);
      } else {
        toast.success('Task priority updated');
      }
    } catch (error) {
      toast.error('Failed to update task. Please try again.');
      console.error('Failed to update tasks:', error);
    } finally {
      dispatch(setSaving(false));
    }
  }, [tasks, dispatch, updateTasks]);

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
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }} data-testid="dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
          My Fancy Task Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: saving ? 1 : 0 }}>
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
          <SwimLane laneId={1} tasks={tasks[1] || []} />
          <SwimLane laneId={2} tasks={tasks[2] || []} />
          <SwimLane laneId={3} tasks={tasks[3] || []} />
        </Box>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      <StatisticsSection tasks={tasks} />
    </Container>
  );
};