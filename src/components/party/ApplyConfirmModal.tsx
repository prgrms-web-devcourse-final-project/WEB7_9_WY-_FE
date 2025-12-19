'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { Party } from '@/types';

interface ApplyConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  party: Party | null;
}

export default function ApplyConfirmModal({
  open,
  onClose,
  onConfirm,
  party,
}: ApplyConfirmModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!isAgreed) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAgreed(false);
    setError(null);
    onClose();
  };

  if (!party) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>파티 참가 신청</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {party.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {party.eventName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {party.departure} → {party.arrival}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            현재 {party.currentMembers}/{party.maxMembers}명
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 1,
            bgcolor: 'info.main',
            color: 'info.contrastText',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <InfoIcon fontSize="small" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              개인정보 제공 안내
            </Typography>
            <Typography variant="body2">
              파티 참가 신청 시 다음 정보가 파티장에게 전달됩니다:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li>닉네임</li>
              <li>프로필 사진 (설정한 경우)</li>
              <li>성별 및 나이대</li>
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              위 내용을 확인했으며, 개인정보 제공에 동의합니다.
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!isAgreed || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isLoading ? '신청 중...' : '신청하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
