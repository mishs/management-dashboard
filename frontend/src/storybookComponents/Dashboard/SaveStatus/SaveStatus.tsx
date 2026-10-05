import React from 'react';
import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';
import { LANE_NAMES } from '@types';
import type { SaveState } from '@store/slices/tasksSlice';
import { SavingIndicator } from '../SavingIndicator/SavingIndicator';

interface SaveStatusProps {
  save: SaveState;
  onRetry: () => void;
  onDismiss: () => void;
  onReloadBoard: () => void;
}

/**
 * Plain-language save feedback tied to the real request.
 * The polite status region always exists so screen readers announce changes;
 * failures use role="alert". The box keeps a fixed minimum height so the board
 * does not jump when a message appears.
 */
export const SaveStatus: React.FC<SaveStatusProps> = ({ save, onRetry, onDismiss, onReloadBoard }) => {
  const quoted = save.status === 'idle' ? '' : `“${save.intent.taskName}”`;

  let content: React.ReactNode = null;
  if (save.status === 'saving') {
    content = (
      <SavingIndicator
        message={`Saving… moving ${quoted} to ${LANE_NAMES[save.intent.toLane]}. Other moves are paused until this finishes.`}
      />
    );
  } else if (save.status === 'saved') {
    content = (
      <Alert
        severity="success"
        role="none"
        onClose={onDismiss}
        closeText="Dismiss message"
        sx={{ py: 0 }}
      >
        <strong>Saved.</strong> {quoted} is now in {LANE_NAMES[save.intent.toLane]}.
      </Alert>
    );
  }

  let failure: React.ReactNode = null;
  if (save.status === 'failed') {
    const { intent } = save;
    const from = LANE_NAMES[intent.fromLane];
    const to = LANE_NAMES[intent.toLane];
    const text = {
      'not-saved': {
        title: 'Not saved',
        body: `${quoted} was not moved to ${to}, so it is still in ${from}. Check your connection, then retry.`,
      },
      unconfirmed: {
        title: 'Save not confirmed',
        body: `We couldn't confirm that ${quoted} was moved to ${to}. It is shown in its last confirmed place. Retrying is safe: it will not move the task twice.`,
      },
      rejected: {
        title: 'Not saved',
        body: `${quoted} could not be moved to ${to}${save.serverMessage ? `: ${save.serverMessage}` : '.'} Reload the board to see the latest saved tasks.`,
      },
    }[save.failure];
    failure = (
      <Alert
        severity="error"
        data-testid="save-error"
        data-failure={save.failure}
        sx={{ alignItems: 'center' }}
        action={
          <Stack direction="row" spacing={1}>
            {save.failure === 'rejected' ? (
              <Button color="inherit" size="small" variant="outlined" onClick={onReloadBoard} data-testid="save-reload">
                Reload board
              </Button>
            ) : (
              <Button color="inherit" size="small" variant="outlined" onClick={onRetry} data-testid="save-retry">
                Retry
              </Button>
            )}
            <Button color="inherit" size="small" onClick={onDismiss} data-testid="save-dismiss">
              Dismiss
            </Button>
          </Stack>
        }
      >
        <AlertTitle sx={{ mb: 0 }}>{text.title}</AlertTitle>
        {text.body}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: 64, mt: 1 }}>
      <Box role="status" aria-live="polite" data-testid="save-status" data-state={save.status}>
        {content}
      </Box>
      {failure}
    </Box>
  );
};
