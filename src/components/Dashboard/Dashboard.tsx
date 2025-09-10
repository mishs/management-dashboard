import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
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
import { StatisticsSection } from '../StatisticsSection/StatisticsSection';
import { SavingIndicator } from '../SavingIndicator/SavingIndicator';
import { useGetTasksQuery, useUpdateTasksMutation } from '../../store/api/tasksApi';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setTasks, moveTask } from '../../store/slices/tasksSlice';
import { SwimLane as SwimLaneEnum, Task, UpdateTaskPayload } from '../../types/task';
import { calculateAffectedTasks } from '../../utils/taskHelpers';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const { data: fetchedTasks, error, isLoading } = useGetTasksQuery();
  const [updateTasks] = useUpdateTasksMutation();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSwimLane, setActiveSwimLane] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    let destinationIndex = 0;
    if (overData.type === 'task') {
      const destinationTaskId = overData.task.id;
      destinationIndex = tasks[destinationSwimLane].findIndex(
        task => task.id === destinationTaskId
      );
      
      if (sourceSwimLane === destinationSwimLane) {
        const sourceIndex = tasks[sourceSwimLane].findIndex(task => task.id === taskId);
        if (sourceIndex < destinationIndex) {
          destinationIndex--;
        }
      }
    } else if (overData.type === 'swimlane') {
      destinationIndex = tasks[destinationSwimLane].length;
    }

    const sourceIndex = tasks[sourceSwimLane].findIndex(task => task.id === taskId);
    if (sourceSwimLane === destinationSwimLane && sourceIndex === destinationIndex) {
      return;
    }

    dispatch(moveTask({
      taskId,
      sourceSwimLane,
      destinationSwimLane,
      destinationIndex,
    }));

    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const affectedTasks = calculateAffectedTasks(
        tasks,
        taskId,
        sourceSwimLane,
        destinationSwimLane,
        destinationIndex
      );

      if (affectedTasks.length > 0) {
        await updateTasks(affectedTasks).unwrap();
      }
    } catch (error) {
      console.error('Failed to update tasks:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load tasks. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }} data-testid="dashboard">
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            mb: 6, 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            My Fancy Task Dashboard
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Drag and drop tasks between swim lanes to update their status
          </Typography>
          
          {isSaving && <SavingIndicator />}
        </Paper>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Grid container spacing={6}>
            {Object.entries(tasks).map(([swimLaneId, swimLaneTasks]) => (
              <Grid item xs={12} lg={4} key={swimLaneId}>
                <SwimLane
                  swimLane={parseInt(swimLaneId) as SwimLaneEnum}
                  tasks={swimLaneTasks}
                />
              </Grid>
            ))}
          </Grid>

          <DragOverlay>
            {activeTask && activeSwimLane ? (
              <TaskCard task={activeTask} swimLane={activeSwimLane} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>

        <StatisticsSection tasks={tasks} />
      </Container>
    </Box>
  );
};