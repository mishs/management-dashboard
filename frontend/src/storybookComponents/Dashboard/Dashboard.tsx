import React, { useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { Box, Button, Container, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { toast } from 'sonner';
import { SwimLane } from './SwimLane/SwimLane';
import { TaskCard } from './TaskCard/TaskCard';
import { SaveStatus } from './SaveStatus/SaveStatus';
import { StatisticsSection } from '@storybookComponents/StatisticsSection/StatisticsSection';
import { useGetTasksQuery } from '@store/api/tasksApi';
import { useDnD } from '@hooks/useDnD';
import { useAppDispatch, useAppSelector } from '@hooks';
import { boardReceived, dismissSaveStatus, selectVisibleTasks, setActiveTask } from '@store/slices/tasksSlice';
import { saveMove } from '@store/saveMove';
import { newOperationId, tasksInLane } from '@utils/boardHelpers';
import { LANE_NAMES, LaneId } from '@types';

const isLaneId = (value: number): value is LaneId => value in LANE_NAMES;

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loaded, activeTask: activeTaskId, save } = useAppSelector((state) => state.tasks);
  const tasks = useAppSelector(selectVisibleTasks);
  const { data, isError, isFetching, refetch } = useGetTasksQuery();
  const { sensors } = useDnD();
  const saving = save.status === 'saving';

  // Every board read from the server goes through the revision guard in the slice.
  useEffect(() => {
    if (data) dispatch(boardReceived(data));
  }, [data, dispatch]);

  // Toast only after the server has confirmed the save (the status line below persists).
  const toastedFor = useRef<string | null>(null);
  useEffect(() => {
    if (save.status === 'saved' && toastedFor.current !== save.intent.operationId) {
      toastedFor.current = save.intent.operationId;
      toast.success(`Saved: “${save.intent.taskName}” moved to ${LANE_NAMES[save.intent.toLane]}`);
    }
  }, [save]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    dispatch(setActiveTask(String(event.active.id)));
  }, [dispatch]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    dispatch(setActiveTask(null));
    if (!over || saving) return;
    const taskId = Number(active.id);
    const toLane = Number(over.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !isLaneId(toLane) || task.swimLane === toLane) return;
    dispatch(saveMove({
      operationId: newOperationId(),
      taskId,
      taskName: task.taskName,
      fromLane: task.swimLane,
      toLane,
    }));
  }, [tasks, saving, dispatch]);

  const handleRetry = useCallback(() => {
    if (save.status === 'failed') dispatch(saveMove(save.intent)); // same operation id: never applied twice
  }, [save, dispatch]);

  const handleReloadBoard = useCallback(() => {
    dispatch(dismissSaveStatus());
    refetch();
  }, [dispatch, refetch]);

  if (!loaded && isError && !isFetching) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }} data-testid="load-error">
        <Alert
          severity="error"
          action={
            <Button color="inherit" variant="outlined" size="small" onClick={() => refetch()} data-testid="load-retry">
              Try again
            </Button>
          }
        >
          <AlertTitle>We couldn't load your tasks</AlertTitle>
          The task board isn't reachable right now. Check your connection, then try again.
        </Alert>
      </Container>
    );
  }

  if (!loaded) {
    return (
      <Container
        maxWidth="xl"
        sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
        data-testid="board-loading"
        role="status"
      >
        <CircularProgress aria-hidden />
        <Typography color="text.secondary">Loading your tasks…</Typography>
      </Container>
    );
  }

  const activeTask = activeTaskId ? tasks.find((t) => t.id.toString() === activeTaskId) : undefined;

  return (
  <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', backgroundColor: 'var(--mui-bg-default)', fontFamily: 'Inter, Roboto, sans-serif', px: { xs: 2, md: 6 }, gap: 4 }} data-testid="dashboard">
      <Box sx={{ mb: 3 }}>
  <Typography variant="h1" component="h1" sx={{ mb: 1, fontSize: '1.65rem', fontWeight: 900, color: 'var(--mui-text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.12)', letterSpacing: '0.5px', fontFamily: 'Inter, Roboto, sans-serif' }}>
          My Fancy Task Dashboard
        </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mui-text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.12)', letterSpacing: '0.5px', fontFamily: 'Inter, Roboto, sans-serif' }}>
          Drag and drop tasks between swim lanes to update their status
        </Typography>
        <SaveStatus
          save={save}
          onRetry={handleRetry}
          onDismiss={() => dispatch(dismissSaveStatus())}
          onReloadBoard={handleReloadBoard}
        />
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
          {([1, 2, 3] as const).map((lane) => (
            <SwimLane
              key={lane}
              laneId={lane}
              tasks={tasksInLane(tasks, lane)}
              dragDisabled={saving}
              savingTaskId={saving ? save.intent.taskId : null}
            />
          ))}
        </Box>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
  <StatisticsSection tasks={tasks} />
    </Container>
  );
};
