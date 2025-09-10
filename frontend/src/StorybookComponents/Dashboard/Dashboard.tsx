import React, { useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SwimLane } from '../SwimLane/SwimLane';
import { TaskCard } from '../TaskCard/TaskCard';
import { StatisticsSection } from '../StatisticsSection/StatisticsSection';
import { SavingIndicator } from '../SavingIndicator/SavingIndicator';
import { useGetTasksQuery, useUpdateTasksMutation } from '../../store/api/tasksApi';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setTasks, moveTask } from '../../store/slices/tasksSlice';
import { calculateAffectedTasks } from '../../utils/taskHelpers';
import { Task, SwimLane as SwimLaneEnum, SWIM_LANE_LABELS } from '../../types/task';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const { data: fetchedTasks, isLoading, error } = useGetTasksQuery();
  const [updateTasks, { isLoading: isUpdating }] = useUpdateTasksMutation();
  
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update local state when data is fetched
  React.useEffect(() => {
    if (fetchedTasks) {
      dispatch(setTasks(fetchedTasks));
    }
  }, [fetchedTasks, dispatch]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskId = Number(active.id);
    
    // Find the task across all swim lanes
    const task = Object.values(tasks)
      .flat()
      .find(t => t.id === taskId);
    
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = Number(active.id);
    const overId = String(over.id);
    
    // Determine if we're dropping on a swim lane or a task
    let destinationSwimLane: SwimLaneEnum;
    let destinationIndex: number;

    if (overId.startsWith('swimlane-')) {
      // Dropping on a swim lane
      destinationSwimLane = Number(overId.replace('swimlane-', '')) as SwimLaneEnum;
      destinationIndex = tasks[destinationSwimLane].length;
    } else {
      // Dropping on a task - find which swim lane and position
      const targetTask = Object.entries(tasks).find(([, taskList]) =>
        taskList.some(task => task.id === Number(overId))
      );
      
      if (!targetTask) return;
      
      destinationSwimLane = Number(targetTask[0]) as SwimLaneEnum;
      destinationIndex = targetTask[1].findIndex(task => task.id === Number(overId));
    }

    // Find source swim lane
    const sourceEntry = Object.entries(tasks).find(([, taskList]) =>
      taskList.some(task => task.id === taskId)
    );
    
    if (!sourceEntry) return;
    
    const sourceSwimLane = Number(sourceEntry[0]) as SwimLaneEnum;

    // Don't do anything if dropping in the same position
    if (sourceSwimLane === destinationSwimLane) {
      const currentIndex = tasks[sourceSwimLane].findIndex(task => task.id === taskId);
      if (currentIndex === destinationIndex) return;
    }

    try {
      // Optimistically update the UI
      dispatch(moveTask({
        taskId,
        sourceSwimLane,
        destinationSwimLane,
        destinationIndex,
      }));

      // Calculate affected tasks for the API call
      const affectedTasks = calculateAffectedTasks(
        tasks,
        taskId,
        sourceSwimLane,
        destinationSwimLane,
        destinationIndex
      );

      // Update the backend
      await updateTasks(affectedTasks).unwrap();
      
      toast.success('Task moved successfully');
    } catch (error) {
      // Revert the optimistic update on error
      dispatch(setTasks(fetchedTasks || tasks));
      toast.error('Failed to move task. Please try again.');
      console.error('Failed to update tasks:', error);
    }
  }, [tasks, dispatch, updateTasks, fetchedTasks]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load tasks. Please refresh the page to try again.
        </Alert>
      </Container>
    );
  }

  const totalTasks = Object.values(tasks).reduce((sum, taskList) => sum + taskList.length, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          My Fancy Task Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your tasks with drag and drop functionality
        </Typography>
      </Box>

      <StatisticsSection tasks={tasks} />
      
      <SavingIndicator isVisible={isUpdating} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Object.entries(tasks).map(([swimLaneId, taskList]) => (
            <Grid item xs={12} md={4} key={swimLaneId}>
              <SwimLane
                id={Number(swimLaneId) as SwimLaneEnum}
                title={SWIM_LANE_LABELS[Number(swimLaneId) as SwimLaneEnum]}
                tasks={taskList}
                color={getSwimLaneColor(Number(swimLaneId) as SwimLaneEnum)}
              />
            </Grid>
          ))}
        </Grid>

        <DragOverlay>
          {activeTask ? (
            <Paper elevation={8} sx={{ transform: 'rotate(5deg)' }}>
              <TaskCard task={activeTask} isDragging />
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>

      {totalTasks === 0 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            No tasks yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your tasks will appear here once they're loaded.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

function getSwimLaneColor(swimLane: SwimLaneEnum): string {
  switch (swimLane) {
    case SwimLaneEnum.TODO:
      return '#1976d2';
    case SwimLaneEnum.IN_PROGRESS:
      return '#ff9800';
    case SwimLaneEnum.COMPLETED:
      return '#2e7d32';
    default:
      return '#757575';
  }
}