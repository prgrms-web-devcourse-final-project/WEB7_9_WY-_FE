'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  ConfirmationNumber,
  Person,
  Phone,
  Email,
  LocalShipping,
  PhoneAndroid,
  LocationOn,
} from '@mui/icons-material';
import { useBookingStore } from '@/stores/bookingStore';
import GradientButton from '@/components/common/GradientButton';
import type { BuyerInfo, DeliveryInfo, DeliveryMethod } from '@/types';

export default function BookingConfirmPage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    currentEvent,
    selectedSection,
    selectedSeats,
    calculateTotalPrice,
    getSelectedSeatDetails,
    setBuyerInfo,
    setDeliveryInfo,
    setTermsAgreed,
    setStep,
  } = useBookingStore();

  const [buyerInfo, setBuyerInfoState] = useState<BuyerInfo>({
    name: '',
    phone: '',
    email: '',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('mobile');
  const [deliveryAddress, setDeliveryAddress] = useState({
    postalCode: '',
    address: '',
    detailAddress: '',
  });

  const [termsAgreement, setTermsAgreement] = useState({
    service: false,
    privacy: false,
    refund: false,
  });

  const seatDetails = getSelectedSeatDetails();
  const totalPrice = calculateTotalPrice();

  useEffect(() => {
    // Redirect if no booking data
    if (!currentEvent || selectedSeats.length === 0) {
      router.push('/booking');
    }
  }, [currentEvent, selectedSeats, router]);

  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
  };

  const handleProceedToPayment = () => {
    // Validate buyer info
    if (!buyerInfo.name || !buyerInfo.phone || !buyerInfo.email) {
      alert('예매자 정보를 모두 입력해주세요.');
      return;
    }

    // Validate delivery info for physical tickets
    if (deliveryMethod === 'physical') {
      if (!deliveryAddress.postalCode || !deliveryAddress.address || !deliveryAddress.detailAddress) {
        alert('배송 주소를 모두 입력해주세요.');
        return;
      }
    }

    // Validate terms agreement
    if (!termsAgreement.service || !termsAgreement.privacy || !termsAgreement.refund) {
      alert('모든 약관에 동의해주세요.');
      return;
    }

    // Save to store
    setBuyerInfo(buyerInfo);

    const deliveryInfo: DeliveryInfo = {
      method: deliveryMethod,
      ...(deliveryMethod === 'physical' && {
        postalCode: deliveryAddress.postalCode,
        address: deliveryAddress.address,
        detailAddress: deliveryAddress.detailAddress,
      }),
    };
    setDeliveryInfo(deliveryInfo);
    setTermsAgreed(true);
    setStep('payment');

    router.push('/payment');
  };

  if (!currentEvent) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              mb: 1,
            }}
          >
            예매 확인
          </Typography>
          <Typography variant="body1" color="text.secondary">
            예매 정보를 확인하고 티켓 수령 방법을 선택해주세요
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Order Summary */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33%' } }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ConfirmationNumber />
                주문 요약
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    공연
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                    {currentEvent.title}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    일시
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {currentEvent.date} {currentEvent.time}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    장소
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {currentEvent.venue}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    구역
                  </Typography>
                  <Chip
                    label={selectedSection?.name}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      border: 1,
                      borderColor: 'primary.main',
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    좌석 ({selectedSeats.length}석)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {seatDetails.map((seat) => (
                      <Chip
                        key={seat.id}
                        label={`${seat.row}${seat.number}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          border: 1,
                          borderColor: 'primary.main',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
                    총 결제금액
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                    }}
                  >
                    {totalPrice.toLocaleString()}원
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Buyer Info & Delivery */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Buyer Information */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Person />
                  예매자 정보
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={buyerInfo.name}
                    onChange={(e) => setBuyerInfoState({ ...buyerInfo, name: e.target.value })}
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        '& fieldset': { borderColor: 'divider' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputBase-input': { color: 'text.primary' },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="전화번호"
                    placeholder="010-1234-5678"
                    value={buyerInfo.phone}
                    onChange={(e) => setBuyerInfoState({ ...buyerInfo, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        '& fieldset': { borderColor: 'divider' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputBase-input': { color: 'text.primary' },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="이메일"
                    type="email"
                    placeholder="example@email.com"
                    value={buyerInfo.email}
                    onChange={(e) => setBuyerInfoState({ ...buyerInfo, email: e.target.value })}
                    InputProps={{
                      startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: alpha(theme.palette.common.white, 0.05),
                        '& fieldset': { borderColor: 'divider' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      },
                      '& .MuiInputLabel-root': { color: 'text.secondary' },
                      '& .MuiInputBase-input': { color: 'text.primary' },
                    }}
                  />
                </Stack>
              </Paper>

              {/* Delivery Method */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocalShipping />
                  티켓 수령 방법
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={deliveryMethod}
                    onChange={(e) => handleDeliveryMethodChange(e.target.value as DeliveryMethod)}
                  >
                    <FormControlLabel
                      value="mobile"
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
                          <PhoneAndroid sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                              모바일 티켓
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SMS/이메일로 QR 코드 발송 (무료)
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                    />

                    <FormControlLabel
                      value="physical"
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
                              실물 티켓 배송
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              택배 배송 (배송비 3,000원)
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                    />

                    <FormControlLabel
                      value="pickup"
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
                      sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                    />
                  </RadioGroup>
                </FormControl>

                {/* Physical Delivery Address */}
                {deliveryMethod === 'physical' && (
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
                        label="우편번호"
                        placeholder="12345"
                        value={deliveryAddress.postalCode}
                        onChange={(e) =>
                          setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: alpha(theme.palette.common.white, 0.05),
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="기본 주소"
                        placeholder="서울시 강남구 테헤란로 123"
                        value={deliveryAddress.address}
                        onChange={(e) =>
                          setDeliveryAddress({ ...deliveryAddress, address: e.target.value })
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: alpha(theme.palette.common.white, 0.05),
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="상세 주소"
                        placeholder="101동 1001호"
                        value={deliveryAddress.detailAddress}
                        onChange={(e) =>
                          setDeliveryAddress({ ...deliveryAddress, detailAddress: e.target.value })
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: alpha(theme.palette.common.white, 0.05),
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                          },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiInputBase-input': { color: 'text.primary' },
                        }}
                      />
                    </Stack>
                  </Box>
                )}

                {/* Pickup Location Info */}
                {deliveryMethod === 'pickup' && (
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
                      수령 안내
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 공연 당일 공연장 입구의 티켓 수령 창구에서 수령 가능합니다.
                      <br />
                      • 신분증과 예매 번호를 지참해주세요.
                      <br />• 공연 시작 2시간 전부터 수령 가능합니다.
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Terms Agreement */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  약관 동의
                </Typography>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAgreement.service}
                        onChange={(e) =>
                          setTermsAgreement({ ...termsAgreement, service: e.target.checked })
                        }
                        sx={{
                          color: 'text.disabled',
                          '&.Mui-checked': { color: 'primary.main' },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.primary">
                        서비스 이용약관 동의 (필수)
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAgreement.privacy}
                        onChange={(e) =>
                          setTermsAgreement({ ...termsAgreement, privacy: e.target.checked })
                        }
                        sx={{
                          color: 'text.disabled',
                          '&.Mui-checked': { color: 'primary.main' },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.primary">
                        개인정보 수집 및 이용 동의 (필수)
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAgreement.refund}
                        onChange={(e) =>
                          setTermsAgreement({ ...termsAgreement, refund: e.target.checked })
                        }
                        sx={{
                          color: 'text.disabled',
                          '&.Mui-checked': { color: 'primary.main' },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.primary">
                        취소 및 환불 규정 동의 (필수)
                      </Typography>
                    }
                  />
                </Stack>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.back()}
                  sx={{
                    py: 1.5,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      bgcolor: alpha(theme.palette.text.secondary, 0.08),
                    },
                  }}
                >
                  이전으로
                </Button>
                <GradientButton
                  fullWidth
                  onClick={handleProceedToPayment}
                >
                  결제하기
                </GradientButton>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
