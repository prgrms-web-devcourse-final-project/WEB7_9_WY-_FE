'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowBack,
  AccessTime,
  Person,
  Phone,
  Email,
  LocalShipping,
  LocationOn,
} from '@mui/icons-material';
import {
  useBookingSessionStore,
  useSelectedSeatsDetails,
  useSelectedSeatsTotal,
  useFormattedRemainingTime,
} from '@/stores/bookingSessionStore';
import type { DeliveryMethod, RecipientInfo } from '@/types/booking';

export default function DeliveryInfoView() {
  const theme = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const {
    deliveryMethod,
    recipient,
    setDeliveryInfo,
    saveDeliveryInfo,
    releaseSeats,
    selectedSeatIds,
    setStep,
    error,
  } = useBookingSessionStore();

  const selectedSeatsDetails = useSelectedSeatsDetails();
  const totalAmount = useSelectedSeatsTotal();
  const remainingTime = useFormattedRemainingTime();

  // Local form state
  const [method, setMethod] = useState<DeliveryMethod>(deliveryMethod || 'PICKUP');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>(
    recipient || {
      name: '',
      phone: '',
      email: '',
      address: '',
      addressDetail: '',
      zipCode: '',
    }
  );

  // Sync with store
  useEffect(() => {
    if (deliveryMethod) setMethod(deliveryMethod);
    if (recipient) setRecipientInfo(recipient);
  }, [deliveryMethod, recipient]);

  const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(e.target.value as DeliveryMethod);
  };

  const handleRecipientChange = (field: keyof RecipientInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipientInfo((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleBack = async () => {
    // 좌석 해제하고 좌석 선택으로 돌아가기
    if (selectedSeatIds.length > 0) {
      await releaseSeats(selectedSeatIds);
    }
    setStep('seats');
  };

  const handleNext = async () => {
    // Validate
    if (!recipientInfo.name || !recipientInfo.phone) {
      return;
    }

    if (method === 'DELIVERY') {
      if (!recipientInfo.address || !recipientInfo.zipCode) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // Store에 저장
      setDeliveryInfo(method, recipientInfo);

      // 서버에 저장 (내부에서 step을 payment로 변경)
      await saveDeliveryInfo();
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    if (!recipientInfo.name || !recipientInfo.phone) return false;
    if (method === 'DELIVERY') {
      return !!(recipientInfo.address && recipientInfo.zipCode);
    }
    return true;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
          }}
        >
          이전
        </Button>

        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
          수령 정보
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
          }}
        >
          <AccessTime fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {remainingTime}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={3}>
          {/* Recipient Info */}
          <Box>
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Person /> 수령인 정보
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="이름 *"
                value={recipientInfo.name}
                onChange={handleRecipientChange('name')}
                InputProps={{
                  startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.common.white, 0.05),
                  },
                }}
              />

              <TextField
                fullWidth
                label="전화번호 *"
                placeholder="010-1234-5678"
                value={recipientInfo.phone}
                onChange={handleRecipientChange('phone')}
                InputProps={{
                  startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.common.white, 0.05),
                  },
                }}
              />

              <TextField
                fullWidth
                label="이메일"
                type="email"
                placeholder="example@email.com"
                value={recipientInfo.email || ''}
                onChange={handleRecipientChange('email')}
                InputProps={{
                  startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.common.white, 0.05),
                  },
                }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Delivery Method */}
          <Box>
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LocalShipping /> 수령 방법
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={method} onChange={handleMethodChange}>
                <FormControlLabel
                  value="PICKUP"
                  control={
                    <Radio
                      sx={{
                        color: 'text.disabled',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                          현장 수령
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          공연 당일 현장에서 수령 (무료)
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: method === 'PICKUP' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: method === 'PICKUP' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  }}
                />

                <FormControlLabel
                  value="DELIVERY"
                  control={
                    <Radio
                      sx={{
                        color: 'text.disabled',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                          배송 수령
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          택배 배송 (배송비 별도)
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: method === 'DELIVERY' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: method === 'DELIVERY' ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  }}
                />
              </RadioGroup>
            </FormControl>

            {/* Delivery Address */}
            {method === 'DELIVERY' && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                  배송 주소
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="우편번호 *"
                    placeholder="12345"
                    value={recipientInfo.zipCode || ''}
                    onChange={handleRecipientChange('zipCode')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="주소 *"
                    placeholder="서울시 강남구 테헤란로 123"
                    value={recipientInfo.address || ''}
                    onChange={handleRecipientChange('address')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="상세주소"
                    placeholder="101동 1001호"
                    value={recipientInfo.addressDetail || ''}
                    onChange={handleRecipientChange('addressDetail')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                      },
                    }}
                  />
                </Stack>
              </Box>
            )}

            {/* Pickup Info */}
            {method === 'PICKUP' && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
                  현장 수령 안내
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 공연 당일 공연장 입구의 티켓 수령 창구에서 수령 가능합니다.
                  <br />
                  • 신분증과 예매 번호를 지참해주세요.
                  <br />
                  • 공연 시작 2시간 전부터 수령 가능합니다.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Error */}
          {error && (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: 1,
                borderColor: 'error.main',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {/* Selected Seats Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            선택 좌석: {selectedSeatsDetails.map((s) => `${s.block} ${s.rowNumber}열 ${s.seatNumber}번`).join(', ')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              총 결제금액
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
              }}
            >
              {totalAmount.toLocaleString()}원
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            disabled={!isFormValid() || isSaving}
            onClick={handleNext}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: 'primary.main',
              fontWeight: 700,
              '&:disabled': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                color: alpha(theme.palette.common.white, 0.5),
              },
            }}
          >
            {isSaving ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : '결제하기'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
