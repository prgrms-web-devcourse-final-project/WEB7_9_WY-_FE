'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import { MainLayout } from '@/components/layout';

const faqItems = [
  {
    question: '파티에 어떻게 참여하나요?',
    answer: '파티 탭에서 원하는 파티를 선택하고 "참여하기" 버튼을 눌러 참여할 수 있습니다. 파티장이 승인하면 채팅방에 참여할 수 있습니다.',
  },
  {
    question: '예매는 어떻게 하나요?',
    answer: '캘린더에서 원하는 이벤트를 선택하고 "예매하기" 버튼을 누르면 티켓 예매 사이트로 이동합니다.',
  },
  {
    question: '아티스트는 몇 명까지 팔로우할 수 있나요?',
    answer: '현재 팔로우 제한은 없습니다. 원하는 만큼 아티스트를 팔로우할 수 있습니다.',
  },
  {
    question: '파티를 만들려면 어떻게 해야 하나요?',
    answer: '파티 탭에서 우측 하단의 + 버튼을 눌러 새 파티를 만들 수 있습니다. 이벤트, 출발지, 도착지 등을 입력해주세요.',
  },
  {
    question: '채팅방에서 강퇴당했어요. 어떻게 해야 하나요?',
    answer: '파티장에 의해 강퇴된 경우 해당 파티에 다시 참여할 수 없습니다. 다른 파티를 찾아보시거나 새로운 파티를 만들어보세요.',
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">고객센터</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            자주 묻는 질문
          </Typography>
          <Card sx={{ mb: 3 }}>
            {faqItems.map((item, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                disableGutters
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  borderBottom: index < faqItems.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body1">{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Card>

          <Typography variant="h4" sx={{ mb: 2 }}>
            문의하기
          </Typography>
          <Card>
            <List disablePadding>
              <ListItem
                component="div"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="이메일 문의"
                  secondary="support@fandomapp.com"
                />
              </ListItem>
              <Divider />
              <ListItem
                component="div"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ChatIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="1:1 채팅 상담"
                  secondary="평일 09:00 - 18:00"
                />
              </ListItem>
              <Divider />
              <ListItem
                component="div"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="전화 문의"
                  secondary="1588-0000 (평일 09:00 - 18:00)"
                />
              </ListItem>
            </List>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}
