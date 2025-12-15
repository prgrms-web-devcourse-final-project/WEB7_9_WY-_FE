'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CalendarEvent } from '@/types';
import { GradientButton } from '@/components/common';

interface NotificationPreference {
  sevenDaysBefore: boolean;
  oneDayBefore: boolean;
  dayOf: boolean;
}

interface NotificationPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export default function NotificationPreferenceModal({
  open,
  onClose,
  event,
}: NotificationPreferenceModalProps) {
  const theme = useTheme();
  const { addNotification } = useNotificationStore();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    sevenDaysBefore: true,
    oneDayBefore: true,
    dayOf: true,
  });

  useEffect(() => {
    // Reset preferences when modal opens
    if (open) {
      setPreferences({
        sevenDaysBefore: true,
        oneDayBefore: true,
        dayOf: true,
      });
    }
  }, [open]);

  const handleSave = () => {
    if (!event) return;

    // Add notification for demonstration
    addNotification({
      title: '알림 설정 완료',
      message: `${event.title}에 대한 알림이 설정되었습니다.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  if (!event) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h4" color="text.primary">
            알림 설정
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            bgcolor: theme.palette.background.default,
            borderRadius: 2,
            p: 2,
            mb: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {event.date} {event.time}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          언제 알림을 받으시겠어요?
        </Typography>

        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.sevenDaysBefore}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    sevenDaysBefore: e.target.checked,
                  }))
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                    '& + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.primary">
                7일 전 알림
              </Typography>
            }
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              px: 2,
              py: 1,
              mx: 0,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.oneDayBefore}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    oneDayBefore: e.target.checked,
                  }))
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                    '& + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.primary">
                1일 전 알림
              </Typography>
            }
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              px: 2,
              py: 1,
              mx: 0,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.dayOf}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    dayOf: e.target.checked,
                  }))
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                    '& + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.primary">
                당일 알림
              </Typography>
            }
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              px: 2,
              py: 1,
              mx: 0,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          취소
        </Button>
        <GradientButton onClick={handleSave}>저장</GradientButton>
      </DialogActions>
    </Dialog>
  );
}
