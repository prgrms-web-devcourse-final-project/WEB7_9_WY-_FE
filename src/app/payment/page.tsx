'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  TextField,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { MainLayout } from '@/components/layout';
import { GradientButton } from '@/components/common';
import { useBookingStore } from '@/stores/bookingStore';

export default function PaymentPage() {
  const router = useRouter();
  const {
    currentEvent,
    selectedSection,
    selectedSeats,
    seats,
    calculateTotalPrice,
    processPayment,
    isLoading,
    error,
  } = useBookingStore();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const selectedSeatDetails = seats.filter((s) => selectedSeats.includes(s.id));
  const totalPrice = calculateTotalPrice();

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await processPayment({
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryDate,
      cvv,
      cardholderName,
    });

    if (success) {
      router.push('/payment/complete');
    }
  };

  if (!currentEvent || !selectedSection) {
    return null;
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">결제</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Order Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              예매 정보
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  공연
                </Typography>
                <Typography variant="body2">{currentEvent.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  일시
                </Typography>
                <Typography variant="body2">
                  {currentEvent.date} {currentEvent.time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  좌석
                </Typography>
                <Typography variant="body2">
                  {selectedSection.name} {selectedSeatDetails.map((s) => `${s.row}${s.number}`).join(', ')}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={600}>
                  총 결제금액
                </Typography>
                <Typography variant="h4" color="secondary.main">
                  {totalPrice.toLocaleString()}원
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CreditCardIcon color="primary" />
              <Typography variant="h4">카드 정보</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="카드 번호"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                sx={{ mb: 2 }}
                required
                slotProps={{
                  input: { inputMode: 'numeric' },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="유효기간"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  required
                  sx={{ flex: 1 }}
                  slotProps={{
                    input: { inputMode: 'numeric' },
                  }}
                />
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="000"
                  required
                  sx={{ flex: 1 }}
                  slotProps={{
                    input: { inputMode: 'numeric' },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="카드 소유자 이름"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="홍길동"
                sx={{ mb: 3 }}
                required
              />

              <GradientButton type="submit" fullWidth loading={isLoading} sx={{ py: 1.5 }}>
                {totalPrice.toLocaleString()}원 결제하기
              </GradientButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
