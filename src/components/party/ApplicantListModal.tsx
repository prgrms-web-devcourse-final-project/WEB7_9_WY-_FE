'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Stack,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { usePartyStore } from '@/stores/partyStore';

interface ApplicantListModalProps {
  open: boolean;
  onClose: () => void;
  partyId: string;
  partyTitle: string;
}

export default function ApplicantListModal({
  open,
  onClose,
  partyId,
  partyTitle,
}: ApplicantListModalProps) {
  const theme = useTheme();
  const {
    fetchPartyApplicants,
    getApplicants,
    acceptApplicant,
    rejectApplicant,
    isLoading,
  } = usePartyStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 모달이 열릴 때 신청자 목록 조회
  useEffect(() => {
    if (open && partyId) {
      fetchPartyApplicants(Number(partyId));
    }
  }, [open, partyId, fetchPartyApplicants]);

  const applicants = getApplicants(partyId);
  const pendingApplicants = applicants.filter((a) => a.status === 'PENDING');

  const handleAccept = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await acceptApplicant(Number(partyId), Number(applicationId));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await rejectApplicant(Number(partyId), Number(applicationId));
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6" component="span" fontWeight={600}>
          신청자 관리
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {partyTitle}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && pendingApplicants.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              신청자 목록을 불러오는 중...
            </Typography>
          </Box>
        ) : pendingApplicants.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              대기 중인 신청자가 없습니다
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              대기 중인 신청자 ({pendingApplicants.length}명)
            </Typography>
            <Stack spacing={1.5}>
              {pendingApplicants.map((applicant, index) => (
                <Box key={applicant.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={applicant.userAvatar}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.secondary.main,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {applicant.userName}
                        </Typography>
                        {applicant.appliedAt && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(applicant.appliedAt)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          processingId === applicant.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CheckCircleIcon />
                          )
                        }
                        onClick={() => handleAccept(applicant.id)}
                        disabled={processingId !== null}
                        sx={{
                          bgcolor: theme.palette.success.main,
                          '&:hover': {
                            bgcolor: theme.palette.success.dark,
                          },
                        }}
                      >
                        수락
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          processingId === applicant.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CancelIcon />
                          )
                        }
                        onClick={() => handleReject(applicant.id)}
                        disabled={processingId !== null}
                        sx={{
                          color: theme.palette.error.main,
                          borderColor: theme.palette.error.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            borderColor: theme.palette.error.main,
                          },
                        }}
                      >
                        거절
                      </Button>
                    </Box>
                  </Box>
                  {index < pendingApplicants.length - 1 && (
                    <Divider sx={{ my: 0.5, opacity: 0 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
