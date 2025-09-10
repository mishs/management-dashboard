import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SwimLane } from '../SwimLane/SwimLane';
import { TaskCard } from '../TaskCard/TaskCard';
import { useGetTasksQuery, useUpdateTasksMutation } from '../../store/api/tasksApi';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setTasks, moveTask } from '../../store/slices/tasksSlice';
import { SwimLane as SwimLaneEnum, Task, UpdateTaskPayload } from '../../types/task';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const { data: fetchedTasks, error, isLoading } = useGetTasksQuery();
  const [updateTasks] = useUpdateTasksMutation();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSwimLane, setActiveSwimLane] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (fetchedTasks) {
      dispatch(setTasks(fetchedTasks));
    }
  }, [fetchedTasks, dispatch]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { task, swimLane } = active.data.current || {};
    
    if (task && swimLane) {
      setActiveTask(task);
      setActiveSwimLane(swimLane);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeSwimLane = activeData.swimLane;
    const overSwimLane = overData.swimLane;

    if (activeSwimLane === overSwimLane) return;

    // Handle cross-swimlane dragging
    if (overData.type === 'swimlane') {
      const taskId = activeData.task.id;
      const destinationIndex = tasks[overSwimLane].length;

      dispatch(moveTask({
        taskId,
        sourceSwimLane: activeSwimLane,
        destinationSwimLane: overSwimLane,
        destinationIndex,
      }));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    setActiveSwimLane(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const sourceSwimLane = activeData.swimLane as SwimLaneEnum;
    const destinationSwimLane = overData.swimLane as SwimLaneEnum;
    const taskId = activeData.task.id;

    // Find destination index
    let destinationIndex = 0;
    if (overData.type === 'task') {
      const destinationTaskId = overData.task.id;
      destinationIndex = tasks[destinationSwimLane].findIndex(
        task => task.id === destinationTaskId
      );
      
      // If dragging within the same swimlane, adjust for the removed item
      if (sourceSwimLane === destinationSwimLane) {
        const sourceIndex = tasks[sourceSwimLane].findIndex(task => task.id === taskId);
        if (sourceIndex < destinationIndex) {
          destinationIndex--;
        }
      }
    } else if (overData.type === 'swimlane') {
      destinationIndex = tasks[destinationSwimLane].length;
    }

    // Only update if position actually changed
    const sourceIndex = tasks[sourceSwimLane].findIndex(task => task.id === taskId);
    if (sourceSwimLane === destinationSwimLane && sourceIndex === destinationIndex) {
      return;
    }

    // Update local state
    dispatch(moveTask({
      taskId,
      sourceSwimLane,
      destinationSwimLane,
      destinationIndex,
    }));

    // Prepare affected tasks for API update
    try {
      const affectedTasks: UpdateTaskPayload[] = [];
      
      // Get current state after the move
      const currentTasks = { ...tasks };
      
      // Simulate the move to get the correct priorities
      const sourceTask = currentTasks[sourceSwimLane].find(task => task.id === taskId);
      if (!sourceTask) return;

      // Remove from source
      currentTasks[sourceSwimLane] = currentTasks[sourceSwimLane].filter(task => task.id !== taskId);
      
      // Add to destination
      currentTasks[destinationSwimLane].splice(destinationIndex, 0, sourceTask);

      // Add affected tasks from source swimlane (if different from destination)
      if (sourceSwimLane !== destinationSwimLane) {
        currentTasks[sourceSwimLane].forEach((task, index) => {
          affectedTasks.push({
            id: task.id,
            priority: index + 1,
            taskName: task.taskName,
            swimLane: sourceSwimLane,
          });
        });
      }

      // Add affected tasks from destination swimlane
      currentTasks[destinationSwimLane].forEach((task, index) => {
        affectedTasks.push({
          id: task.id,
          priority: index + 1,
          taskName: task.taskName,
          swimLane: destinationSwimLane,
        });
      });

      // Send only affected tasks to backend
      if (affectedTasks.length > 0) {
        await updateTasks(affectedTasks).unwrap();
      }
    } catch (error) {
      console.error('Failed to update tasks:', error);
      // Optionally revert the local state or show an error message
    }
  };

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
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load tasks. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Fancy Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Drag and drop tasks between swim lanes to organize your workflow
        </Typography>
      </Paper>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={3}>
          {Object.entries(tasks).map(([swimLaneId, swimLaneTasks]) => (
            <Grid item xs={12} md={4} key={swimLaneId}>
              <SwimLane
                swimLane={parseInt(swimLaneId) as SwimLaneEnum}
                tasks={swimLaneTasks}
              />
            </Grid>
          ))}
        </Grid>

        <DragOverlay>
          {activeTask && activeSwimLane ? (
            <TaskCard task={activeTask} swimLane={activeSwimLane} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Container>
  );
};