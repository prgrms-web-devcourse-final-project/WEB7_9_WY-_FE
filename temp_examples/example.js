// ============================================
// 전역 변수
// ============================================
let followingArtists = [];
let isLoggedIn = false;
let currentUser = {
    name: '사용자',
    email: 'user@example.com'
};
let selectedArtists = [];

const allArtists = [
    { name: 'BTS', short: 'BTS', schedules: 12, fans: 1250000 },
    { name: 'BLACKPINK', short: 'BP', schedules: 8, fans: 980000 },
    { name: 'NewJeans', short: 'NJ', schedules: 15, fans: 870000 },
    { name: 'aespa', short: 'æ', schedules: 10, fans: 760000 },
    { name: 'SEVENTEEN', short: 'SVT', schedules: 9, fans: 650000 },
    { name: 'IVE', short: 'IVE', schedules: 11, fans: 540000 },
    { name: 'TWICE', short: 'TW', schedules: 7, fans: 890000 },
    { name: 'Stray Kids', short: 'SKZ', schedules: 13, fans: 720000 },
    { name: 'LE SSERAFIM', short: 'LSF', schedules: 9, fans: 480000 },
    { name: '(G)I-DLE', short: 'GID', schedules: 8, fans: 430000 },
    { name: 'TXT', short: 'TXT', schedules: 10, fans: 520000 },
    { name: 'ENHYPEN', short: 'EN', schedules: 12, fans: 610000 },
    { name: 'Red Velvet', short: 'RV', schedules: 6, fans: 560000 },
    { name: 'NCT', short: 'NCT', schedules: 11, fans: 680000 }
];

// ============================================
// 알림 시스템
// ============================================
let notifications = [
    {
        id: 1,
        type: 'schedule',
        title: 'BTS WORLD TOUR 2025',
        message: '내일 오후 6시 공연이 있습니다!',
        time: '방금 전',
        read: false
    },
    {
        id: 2,
        type: 'party_request',
        title: '파티 신청',
        message: '행복한 팬(여성,22세)님이 "지민이 최애 🎤" 파티에 신청했습니다',
        time: '10분 전',
        read: false,
        partyId: 1,
        applicantId: 2
    },
    {
        id: 3,
        type: 'party_accepted',
        title: '파티 승인 완료',
        message: '"방탄 월드투어 함께 가요 💜" 파티 신청이 승인되었습니다!',
        time: '1시간 전',
        read: false,
        partyId: 3
    },
    {
        id: 4,
        type: 'party_request',
        title: '파티 신청',
        message: '댕댕(남성,23세)님이 "지민이 최애 🎤" 파티에 신청했습니다',
        time: '2시간 전',
        read: false,
        partyId: 1,
        applicantId: 3
    },
    {
        id: 5,
        type: 'schedule',
        title: 'NewJeans 팬사인회',
        message: '내일 오후 2시 팬사인회가 있습니다!',
        time: '어제',
        read: true
    },
  // 🆕 강퇴 알림 추가!
    {
        id: 6,
        type: 'party_kicked',
        title: '파티에서 강퇴되었습니다',
        message: '"지민이 최애 🎤" 파티에서 강퇴되었습니다. 참여자들을 평가해주세요.',
        time: '3분 전',
        read: false,
        partyId: 1,
        kickedUserId: 1,
        kickedUserName: '푸바오'
    }
];

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        renderNotifications();
    } else {
        panel.style.display = 'none';
    }
}

function renderNotifications() {
    const listEl = document.getElementById('notification-list');
    const badgeEl = document.getElementById('notification-badge');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badgeEl.style.display = 'flex';
        badgeEl.textContent = unreadCount;
    } else {
        badgeEl.style.display = 'none';
    }
    
    if (notifications.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
                <p>알림이 없습니다</p>
            </div>
        `;
        return;
    }
    
    listEl.innerHTML = notifications.map(notif => {
        let icon = '📅';
        let actionButtons = '';
        
        if (notif.type === 'schedule') {
            icon = '📅';
        } else if (notif.type === 'party_request') {
            icon = '🎉';
            actionButtons = `
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button onclick="acceptFromNotification(${notif.id}, ${notif.partyId}, ${notif.applicantId})" style="flex: 1; padding: 8px; background: #4caf50; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                        ✓ 수락
                    </button>
                    <button onclick="rejectFromNotification(${notif.id}, ${notif.partyId}, ${notif.applicantId})" style="flex: 1; padding: 8px; background: white; color: #666; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                        ✕ 거절
                    </button>
                </div>
            `;
        } else if (notif.type === 'party_accepted') {
            icon = '✅';
            actionButtons = `
                <button onclick="goToChatFromNotification(${notif.id}, ${notif.partyId})" style="width: 100%; padding: 8px; margin-top: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                    💬 채팅방 이동
                </button>
            `;
        } else if (notif.type === 'party_kicked') {
    // 🆕 강퇴 알림
    icon = '❌';
    actionButtons = `
        <button onclick="rateAfterKick(${notif.id}, ${notif.partyId})" style="width: 100%; padding: 10px; margin-top: 12px; background: #ff1744; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            ⭐ 참여자 평가하기
        </button>
    `;
}
        
        const bgColor = notif.read ? '#fff' : '#f9f9ff';
        const borderColor = notif.read ? '#e0e0e0' : '#667eea';
        
        return `
            <div onclick="markAsRead(${notif.id})" style="padding: 16px; border-bottom: 1px solid #f0f0f0; cursor: pointer; background: ${bgColor}; border-left: 3px solid ${borderColor}; transition: background 0.2s;">
                <div style="display: flex; gap: 12px;">
                    <div style="font-size: 24px;">${icon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: 700; color: #222; margin-bottom: 4px;">
                            ${notif.title}
                        </div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                            ${notif.message}
                        </div>
                        <div style="font-size: 11px; color: #999;">
                            ${notif.time}
                        </div>
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function markAsRead(notificationId) {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
        notif.read = true;
        renderNotifications();
    }
}

function acceptFromNotification(notificationId, partyId, applicantId) {
    const applicant = applicantsData[partyId].find(a => a.id === applicantId);
    if (applicant) {
        applicant.status = 'accepted';
        notifications = notifications.filter(n => n.id !== notificationId);
        showNotification(`${applicant.name}님의 신청을 수락했습니다! ✓`);
        renderNotifications();
    }
}

function rejectFromNotification(notificationId, partyId, applicantId) {
    if (confirm('정말 이 신청을 거절하시겠습니까?')) {
        const applicant = applicantsData[partyId].find(a => a.id === applicantId);
        if (applicant) {
            applicant.status = 'rejected';
            notifications = notifications.filter(n => n.id !== notificationId);
            showNotification(`${applicant.name}님의 신청을 거절했습니다`);
            renderNotifications();
        }
    }
}

function goToChatFromNotification(notificationId, partyId) {
    markAsRead(notificationId);
    document.getElementById('notification-panel').style.display = 'none';
    openChatRoom(partyId);
}

function clearAllNotifications() {
    if (confirm('모든 알림을 삭제하시겠습니까?')) {
        notifications = [];
        renderNotifications();
        showNotification('모든 알림이 삭제되었습니다');
    }
}

function addNotification(type, title, message, data = {}) {
    const newNotif = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        time: '방금 전',
        read: false,
        ...data
    };
    
    notifications.unshift(newNotif);
    renderNotifications();
}

// ============================================
// 페이지 네비게이션
// ============================================
function goToHome() {
    console.log('🏠 홈으로 이동');
    const globalHeader = document.getElementById('global-header');
    const onboarding = document.getElementById('onboarding');
    const calendar = document.getElementById('calendar');
    
    onboarding.classList.remove('active');
    onboarding.style.display = 'none';
    
    globalHeader.classList.remove('hidden');
    globalHeader.style.display = 'flex';
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    calendar.classList.add('active');
    calendar.style.display = 'block';
    
    setTimeout(() => {
        initCalendarListeners();
    }, 100);
    
    window.scrollTo(0, 0);
}

function initCalendarListeners() {
    console.log('🔄 캘린더 이벤트 리스너 초기화');
    
    document.querySelectorAll('.upcoming-event-card .btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const btnText = this.textContent.trim();
            console.log('버튼 클릭:', btnText);
            
            if (btnText === '예매하기' || btnText === '응모하기' || btnText === '신청하기') {
                goToBookingPage();
            } else if (btnText.includes('파티')) {
                goToPartyPage();
            }
        });
    });
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const newChip = chip.cloneNode(true);
        chip.parentNode.replaceChild(newChip, chip);
        
        newChip.addEventListener('click', function() {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const artist = this.dataset.artist;
            if (artist === 'all') {
                showNotification('전체 아티스트 일정을 표시합니다');
            } else {
                showNotification(`${artist} 일정으로 필터링되었습니다`);
            }
        });
    });
    
    const moreBtn = document.querySelector('.filter-chip-more');
    if (moreBtn) {
        const newMoreBtn = moreBtn.cloneNode(true);
        moreBtn.parentNode.replaceChild(newMoreBtn, moreBtn);
        newMoreBtn.addEventListener('click', goToArtistsPage);
    }
    
    const manageBtn = document.querySelector('.content-header .btn-primary');
    if (manageBtn) {
        const newBtn = manageBtn.cloneNode(true);
        manageBtn.parentNode.replaceChild(newBtn, manageBtn);
        newBtn.addEventListener('click', goToArtistsPage);
    }
    
    document.querySelectorAll('.calendar-day').forEach(day => {
        const newDay = day.cloneNode(true);
        day.parentNode.replaceChild(newDay, day);
        
        newDay.addEventListener('click', function() {
            const dayNum = this.querySelector('.day-number').textContent;
            const eventItems = this.querySelectorAll('.event-item');
            openEventModal(dayNum, eventItems);
        });
    });
    
    const calendarNav = document.querySelector('.calendar-nav');
    if (calendarNav) {
        const buttons = calendarNav.querySelectorAll('button');
        buttons.forEach((btn, index) => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            if (index === 0) {
                newBtn.addEventListener('click', () => showNotification('이전 달로 이동'));
            } else if (index === 1) {
                newBtn.addEventListener('click', () => showNotification('오늘로 이동'));
            } else if (index === 2) {
                newBtn.addEventListener('click', () => showNotification('다음 달로 이동'));
            }
        });
    }
    
    console.log('✅ 캘린더 이벤트 리스너 초기화 완료');
}

function goToArtistsPage() {
    console.log('📍 아티스트 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const artistsScreen = document.getElementById('artists');
    artistsScreen.classList.add('active');
    artistsScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
    showNotification('아티스트 페이지로 이동했습니다');
}

function goToBookingPage() {
    console.log('🎫 예매 페이지로 이동');
    goToEventDetail();
}

function goToPartyPage() {
    console.log('🎉 팬 파티 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const partyScreen = document.getElementById('party');
    partyScreen.classList.add('active');
    partyScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
    showNotification('팬 파티 페이지로 이동했습니다');
}

function goToCreatePartyPage() {
    console.log('✍️ 새 팬 파티 만들기 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const createPartyScreen = document.getElementById('create-party');
    createPartyScreen.classList.add('active');
    createPartyScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
}

function goToMyPartiesPage() {
    console.log('📋 내 파티 관리 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const myPartiesScreen = document.getElementById('my-parties');
    myPartiesScreen.classList.add('active');
    myPartiesScreen.style.display = 'block';
    
    switchPartyTab('created');
    
    window.scrollTo(0, 0);
}

function switchPartyTab(tabName) {
    console.log('🔄 파티 탭 전환:', tabName);
    
    document.querySelectorAll('.party-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.borderBottomColor = 'transparent';
        tab.style.color = '#999';
    });
    
    document.querySelectorAll('.party-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const selectedTab = document.getElementById(`tab-${tabName}`);
    selectedTab.classList.add('active');
    selectedTab.style.borderBottomColor = '#ff1744';
    selectedTab.style.color = '#ff1744';
    
    const selectedContent = document.getElementById(`${tabName}-parties`);
    selectedContent.style.display = 'block';
}

function goToChatsPage() {
    if (!isLoggedIn) {
        showNotification('로그인이 필요합니다');
        goToLoginPage();
        return;
    }
    
    console.log('💬 채팅방 목록 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const chatsScreen = document.getElementById('chats');
    chatsScreen.classList.add('active');
    chatsScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
}

// ============================================
// 채팅방 시스템
// ============================================
const chatRoomData = {
    1: {
        title: '지민이 최애 🎤',
        participants: 3,
        icon: '🎤',
        isOwner: true,
        members: [
            { id: 1, name: '나', isMe: true },
            { id: 2, name: '방탄 최애', isMe: false },
            { id: 3, name: '행복한 팬', isMe: false }
        ]
    },
    2: {
        title: '뉴진스와 함께 🐰',
        participants: 2,
        icon: '🐰',
        isOwner: false,
        members: [
            { id: 1, name: '나', isMe: true },
            { id: 4, name: '사탕', isMe: false }
        ]
    },
    3: {
        title: 'aespa 팬들 모여라',
        participants: 4,
        icon: '🎵',
        isOwner: false,
        members: [
            { id: 1, name: '나', isMe: true },
            { id: 5, name: '에스파러버', isMe: false },
            { id: 6, name: '윈터최고', isMe: false },
            { id: 7, name: '카리나팬', isMe: false }
        ]
    }
};

let currentChatRoomId = null;

function openChatRoom(roomId) {
    console.log('💬 채팅방 열기:', roomId);
    
    currentChatRoomId = roomId;
    const roomData = chatRoomData[roomId];
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    document.getElementById('chatroom-title').textContent = roomData.title;
    document.getElementById('chatroom-participants').textContent = `참여자 ${roomData.participants}명`;
    document.getElementById('participants-badge').textContent = roomData.participants;
    
    const chatroomScreen = document.getElementById('chatroom');
    chatroomScreen.classList.add('active');
    chatroomScreen.style.display = 'block';
    
    setTimeout(() => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function toggleParticipantsPanel() {
    const panel = document.getElementById('participants-panel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        renderParticipantsList();
    } else {
        panel.style.display = 'none';
    }
}

function renderParticipantsList() {
    const roomData = chatRoomData[currentChatRoomId];
    const listEl = document.getElementById('participants-list');
    const leaveSection = document.getElementById('leave-party-section');
    
    if (roomData.isOwner) {
        leaveSection.style.display = 'none';
    } else {
        leaveSection.style.display = 'block';
    }
    
    listEl.innerHTML = roomData.members.map(member => {
        const isMe = member.isMe;
        const canKick = roomData.isOwner && !isMe;
        
        return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${isMe ? '#f0f4ff' : 'white'}; border-radius: 8px; margin-bottom: 8px; border: 2px solid ${isMe ? '#667eea' : '#f0f0f0'};">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; flex-shrink: 0;">
                    👤
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 15px; font-weight: 700; color: #222;">
                        ${member.name}
                        ${isMe ? '<span style="font-size: 12px; color: #667eea; margin-left: 6px;">(나)</span>' : ''}
                        ${roomData.isOwner && isMe ? '<span style="font-size: 12px; color: #ff1744; margin-left: 6px;">👑 파티장</span>' : ''}
                    </div>
                </div>
                ${canKick ? `
                    <button onclick="kickMember(${member.id}, '${member.name}')" style="padding: 6px 12px; background: white; border: 2px solid #ffcdd2; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #c62828; transition: all 0.2s;">
                        강퇴
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function kickMember(memberId, memberName) {
    if (confirm(`정말 ${memberName}님을 강퇴하시겠습니까?`)) {
        const roomData = chatRoomData[currentChatRoomId];
        
        roomData.members = roomData.members.filter(m => m.id !== memberId);
        roomData.participants--;
        
        document.getElementById('chatroom-participants').textContent = `참여자 ${roomData.participants}명`;
        document.getElementById('participants-badge').textContent = roomData.participants;
        
        renderParticipantsList();
        showNotification(`${memberName}님을 강퇴했습니다`);
        
        addSystemMessage(`${memberName}님이 강퇴되었습니다`);
    }
}



function addSystemMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const timeStr = `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    
    const systemHTML = `
        <div style="text-align: center; margin: 16px 0;">
            <span style="display: inline-block; padding: 8px 16px; background: #f0f0f0; border-radius: 16px; font-size: 13px; color: #666;">
                ${message} (${timeStr})
            </span>
        </div>
    `;
    
    chatMessages.innerHTML += systemHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const timeStr = `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    
    const messageHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
            <div style="display: flex; gap: 8px; align-items: end; flex-direction: row-reverse;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 16px; border-radius: 18px; max-width: 70%; font-size: 14px; color: white; line-height: 1.5;">
                    ${message}
                </div>
                <span style="font-size: 11px; color: #999; white-space: nowrap;">${timeStr}</span>
            </div>
        </div>
    `;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += messageHTML;
    
    input.value = '';
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================
// 파티 신청자 관리
// ============================================
const applicantsData = {
    1: [
        { id: 1, name: '방탄 최애', age: '23세', gender: '여성', status: 'pending' },
        { id: 2, name: '행복한 팬', age: '25세', gender: '여성',  status: 'pending' },
        { id: 3, name: '댕댕', age: '22세', gender: '여성',  status: 'pending' }
    ],
    2: [
        { id: 4, name: '사탕', age: '20세', gender: '여성',  status: 'pending' }
    ]
};

function showPartyApplicants(partyId) {
    const modal = document.getElementById('applicants-modal');
    const titleEl = document.getElementById('applicants-party-title');
    const countEl = document.getElementById('applicants-count');
    const listEl = document.getElementById('applicants-list');
    
    const partyTitles = {
        1: '지민이 최애 🎤',
        2: '뉴진스와 함께 🐰'
    };
    
    titleEl.textContent = partyTitles[partyId];
    
    const applicants = applicantsData[partyId] || [];
    const pendingCount = applicants.filter(a => a.status === 'pending').length;
    countEl.textContent = `대기 중인 신청자 ${pendingCount}명`;
    
    listEl.innerHTML = '';
    
    if (applicants.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <p>아직 신청자가 없습니다</p>
            </div>
        `;
    } else {
        applicants.forEach(applicant => {
            let statusBadge = '';
            let actionButtons = '';
            
            if (applicant.status === 'pending') {
                statusBadge = '<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #fff3e0; color: #f57c00;">대기중</span>';
                actionButtons = `
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn btn-primary btn-sm" onclick="acceptApplicant(${partyId}, ${applicant.id})" style="flex: 1;">✓ 수락</button>
                        <button class="btn btn-outline btn-sm" onclick="rejectApplicant(${partyId}, ${applicant.id})" style="flex: 1;">✕ 거절</button>
                    </div>
                `;
            } else if (applicant.status === 'accepted') {
                statusBadge = '<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e8f5e9; color: #388e3c;">수락됨</span>';
                actionButtons = '<div style="margin-top: 12px; font-size: 13px; color: #388e3c; font-weight: 600;">✓ 수락 완료</div>';
            } else if (applicant.status === 'rejected') {
                statusBadge = '<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #ffebee; color: #c62828;">거절됨</span>';
                actionButtons = '<div style="margin-top: 12px; font-size: 13px; color: #999;">✕ 거절됨</div>';
            }
            
            const applicantHTML = `
                <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; border: 2px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="display: flex; gap: 16px; align-items: center;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">👤</div>
                            <div>
                                <div style="font-size: 16px; font-weight: 700; color: #222; margin-bottom: 4px;">
                                    ${applicant.name}
                                </div>
                                <div style="font-size: 13px; color: #666;">
                                    ${applicant.gender} · ${applicant.age}
                                </div>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    ${actionButtons}
                </div>
            `;
            
            listEl.innerHTML += applicantHTML;
        });
    }
    
    modal.classList.add('active');
}

function closeApplicantsModal() {
    document.getElementById('applicants-modal').classList.remove('active');
}

function acceptApplicant(partyId, applicantId) {
    const applicant = applicantsData[partyId].find(a => a.id === applicantId);
    if (applicant) {
        applicant.status = 'accepted';
        
        const partyTitles = {
            1: '지민이 최애 🎤',
            2: '뉴진스와 함께 🐰'
        };
        
        addNotification(
            'party_accepted',
            '파티 승인 완료',
            `"${partyTitles[partyId]}" 파티 신청이 승인되었습니다!`,
            { partyId: partyId }
        );
        
        showNotification(`${applicant.name}님의 신청을 수락했습니다! ✓`);
        showPartyApplicants(partyId);
    }
}

function rejectApplicant(partyId, applicantId) {
    if (confirm('정말 이 신청을 거절하시겠습니까?')) {
        const applicant = applicantsData[partyId].find(a => a.id === applicantId);
        if (applicant) {
            applicant.status = 'rejected';
            showNotification(`${applicant.name}님의 신청을 거절했습니다`);
            showPartyApplicants(partyId);
        }
    }
}

function submitParty() {
    console.log('📝 팬 파티 제출');
    
    const event = document.getElementById('party-event').value;
    const title = document.getElementById('party-title').value.trim();
    const partyType = document.querySelector('input[name="party-type"]:checked').value;
    const departure = document.getElementById('party-departure').value.trim();
    const arrival = document.getElementById('party-arrival').value.trim();
    const capacity = document.getElementById('party-capacity').value;
    
    if (!event) {
        showNotification('❌ 참여할 이벤트를 선택해주세요');
        document.getElementById('party-event').focus();
        return;
    }
    
    if (!title) {
        showNotification('❌ 파티 제목을 입력해주세요');
        document.getElementById('party-title').focus();
        return;
    }
    
    if (!departure) {
        showNotification('❌ 출발지를 입력해주세요');
        document.getElementById('party-departure').focus();
        return;
    }
    
    if (!arrival) {
        showNotification('❌ 도착지를 입력해주세요');
        document.getElementById('party-arrival').focus();
        return;
    }
    
    if (!capacity) {
        showNotification('❌ 모집 인원을 선택해주세요');
        document.getElementById('party-capacity').focus();
        return;
    }
    
    const partyTypeText = partyType === 'departure' ? '출발팟' : '복귀팟';
    showNotification(`🎉 ${partyTypeText} 팬 파티가 생성되었습니다!`);
    
    document.getElementById('party-event').value = '';
    document.getElementById('party-title').value = '';
    document.getElementById('party-description').value = '';
    document.getElementById('party-departure').value = '';
    document.getElementById('party-arrival').value = '';
    document.getElementById('party-capacity').value = '';
    document.getElementById('party-contact').value = '';
    document.querySelector('input[name="transport"][value="subway"]').checked = true;
    document.querySelector('input[name="party-type"][value="departure"]').checked = true;
    document.querySelector('input[name="gender"][value="any"]').checked = true;
    document.getElementById('party-age').value = '20s';
    
    setTimeout(() => {
        goToPartyPage();
    }, 1500);
}

// ============================================
// 아티스트 관리
// ============================================
function createArtistCard(artist, isFollowing = false) {
    const followBtnText = isFollowing ? '✓ 팔로잉' : '+ 팔로우';
    const followClass = isFollowing ? 'following' : '';
    const cardClass = isFollowing ? 'following' : '';
    
    return `
        <div class="artist-card ${cardClass}" data-artist="${artist.name}">
            <div class="artist-image">${artist.short}</div>
            <div class="artist-info">
                <div class="artist-name">${artist.name}</div>
                
                <button class="artist-follow-btn ${followClass}" data-artist="${artist.name}">
                    ${followBtnText}
                </button>
            </div>
        </div>
    `;
}

function renderMyArtistsPage() {
    const followingGrid = document.getElementById('following-artists-grid-main');
    const allGrid = document.getElementById('all-artists-grid-main');
    const followingCount = document.getElementById('following-count-main');
    const noFollowing = document.getElementById('no-following-main');
    
    if (!followingGrid || !allGrid) return;
    
    if (followingArtists.length === 0) {
        followingGrid.style.display = 'none';
        noFollowing.style.display = 'block';
    } else {
        followingGrid.style.display = 'grid';
        noFollowing.style.display = 'none';
        followingGrid.innerHTML = followingArtists
            .map(name => {
                const artist = allArtists.find(a => a.name === name);
                return createArtistCard(artist, true);
            })
            .join('');
    }
    
    followingCount.textContent = followingArtists.length;
    
    allGrid.innerHTML = allArtists
        .map(artist => createArtistCard(artist, followingArtists.includes(artist.name)))
        .join('');
    
    document.querySelectorAll('.artist-follow-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFollowArtist(this.dataset.artist);
        });
    });
}

function toggleFollowArtist(artistName) {
    const index = followingArtists.indexOf(artistName);
    
    if (index === -1) {
        followingArtists.push(artistName);
        showNotification(`${artistName}를 팔로우했습니다! ❤️`);
    } else {
        followingArtists.splice(index, 1);
        showNotification(`${artistName} 팔로우를 취소했습니다`);
    }
    
    renderMyArtistsPage();
}

// ============================================
// 이벤트 모달
// ============================================
function openEventModal(dayNum, eventItems) {
    const modal = document.getElementById('event-modal');
    const modalDate = document.getElementById('modal-date');
    const modalEventCount = document.getElementById('modal-event-count');
    const modalEventList = document.getElementById('modal-event-list');
    
    modalDate.textContent = `2025년 11월 ${dayNum}일`;
    modalEventCount.textContent = eventItems.length > 0 ? `${eventItems.length}개의 일정` : '예정된 일정 없음';
    
    modalEventList.innerHTML = '';
    
    if (eventItems.length === 0) {
        modalEventList.innerHTML = `
            <div class="modal-empty">
                <div class="modal-empty-icon">📅</div>
                <p>이 날은 예정된 일정이 없습니다</p>
            </div>
        `;
    } else {
        eventItems.forEach(item => {
            const eventText = item.textContent;
            let eventType = 'broadcast';
            let eventTypeText = '방송';
            let eventTime = '17:00';
            let eventLocation = 'KBS 여의도';
            
            if (item.classList.contains('concert')) {
                eventType = 'concert';
                eventTypeText = '콘서트';
                eventTime = '18:00';
                eventLocation = '서울 잠실종합운동장';
            } else if (item.classList.contains('fansign')) {
                eventType = 'fansign';
                eventTypeText = '팬미팅';
                eventTime = '14:00';
                eventLocation = '예스24 라이브홀';
            } else if (item.classList.contains('birthday')) {
                eventType = 'birthday';
                eventTypeText = '생일';
                eventTime = '종일';
                eventLocation = '특별한 날';
            }
            
            let actionsHTML = '';
            if (eventType === 'birthday') {
                actionsHTML = `
                    <div class="modal-event-actions" style="justify-content: center;">
                        <button class="btn btn-primary modal-alarm-btn" data-event="${eventText}" title="생일 알림 설정" style="width: 100%; max-width: 200px;">
                            🔔 생일 알림 설정
                        </button>
                    </div>
                `;
            } else if (eventType === 'concert' || eventType === 'fansign') {
                actionsHTML = `
                    <div class="modal-event-actions">
                        <button class="btn btn-primary modal-book-btn" data-event="${eventText}" style="flex: 2;">예매하기</button>
                        <button class="btn btn-outline modal-party-btn" data-event="${eventText}">파티 찾기</button>
                        <button class="btn btn-outline modal-alarm-btn" data-event="${eventText}" title="알림 설정">🔔</button>
                    </div>
                `;
            } else {
                actionsHTML = `
                    <div class="modal-event-actions">
                        <button class="btn btn-primary modal-book-btn" data-event="${eventText}" style="flex: 2;">신청하기</button>
                        <button class="btn btn-outline modal-party-btn" data-event="${eventText}">파티 찾기</button>
                        <button class="btn btn-outline modal-alarm-btn" data-event="${eventText}" title="알림 설정">🔔</button>
                    </div>
                `;
            }
            
            const eventHTML = `
                <div class="modal-event-item ${eventType}">
                    <span class="modal-event-type ${eventType}">${eventTypeText}</span>
                    <div class="modal-event-title">${eventText}</div>
                    <div class="modal-event-details">
                        <div>🕐 ${eventTime}</div>
                        <div>📍 ${eventLocation}</div>
                    </div>
                    ${actionsHTML}
                </div>
            `;
            modalEventList.innerHTML += eventHTML;
        });
    }
    
    modal.classList.add('active');
    
    setTimeout(() => {
        document.querySelectorAll('.modal-book-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventName = this.dataset.event;
                closeModal();
                goToBookingPage();
                setTimeout(() => showNotification(`${eventName} 예매 페이지로 이동했습니다`), 300);
            });
        });
        
        document.querySelectorAll('.modal-party-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventName = this.dataset.event;
                closeModal();
                goToPartyPage();
                setTimeout(() => showNotification(`${eventName} 팬 파티를 찾고 있습니다`), 300);
            });
        });
        
        document.querySelectorAll('.modal-alarm-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventName = this.dataset.event;
                const isBirthdayBtn = this.textContent.includes('생일');
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    if (isBirthdayBtn) {
                        this.innerHTML = '🔔 생일 알림 설정';
                    } else {
                        this.textContent = '🔔';
                    }
                    showNotification(`${eventName} 알림이 해제되었습니다`);
                } else {
                    this.classList.add('active');
                    if (isBirthdayBtn) {
                        this.innerHTML = '✓ 알림 설정됨';
                        this.style.background = '#4caf50';
                        this.style.borderColor = '#4caf50';
                    } else {
                        this.textContent = '🔕';
                    }
                    
                    addNotification('schedule', eventName, '일정 전날 밤 12시에 알림이 전송됩니다');
                    showNotification(`${eventName} 알림이 설정되었습니다! 🔔`);
                }
            });
        });
    }, 100);
}

function closeModal() {
    document.getElementById('event-modal').classList.remove('active');
}

// ============================================
// 알림 및 인증
// ============================================
function showNotification(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLogin() {
    goToLoginPage();
}

function showSignup() {
    goToSignupPage();
}

function goToLoginPage() {
    console.log('🔐 로그인 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    document.getElementById('global-header').style.display = 'none';
    
    const loginScreen = document.getElementById('login');
    loginScreen.classList.add('active');
    loginScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
}

function goToSignupPage() {
    console.log('📝 회원가입 페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    document.getElementById('global-header').style.display = 'none';
    
    const signupScreen = document.getElementById('signup');
    signupScreen.classList.add('active');
    signupScreen.style.display = 'block';
    
    window.scrollTo(0, 0);
}

function performLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email) {
        showNotification('❌ 이메일을 입력해주세요');
        document.getElementById('login-email').focus();
        return;
    }
    
    if (!password) {
        showNotification('❌ 비밀번호를 입력해주세요');
        document.getElementById('login-password').focus();
        return;
    }
    
    isLoggedIn = true;
    currentUser.email = email;
    currentUser.name = email.split('@')[0];
    
    document.getElementById('header-auth-buttons').style.display = 'none';
    document.getElementById('header-user-menu').style.display = 'flex';
    
    showNotification('🎉 로그인 성공!');
    
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    setTimeout(() => {
        goToHome();
    }, 1000);
}

function performSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    const agreePrivacy = document.getElementById('agree-privacy').checked;
    
    if (!name) {
        showNotification('❌ 이름을 입력해주세요');
        document.getElementById('signup-name').focus();
        return;
    }
    
    if (!email) {
        showNotification('❌ 이메일을 입력해주세요');
        document.getElementById('signup-email').focus();
        return;
    }
    
    if (!password) {
        showNotification('❌ 비밀번호를 입력해주세요');
        document.getElementById('signup-password').focus();
        return;
    }
    
    if (password.length < 6) {
        showNotification('❌ 비밀번호는 6자 이상이어야 합니다');
        document.getElementById('signup-password').focus();
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('❌ 비밀번호가 일치하지 않습니다');
        document.getElementById('signup-password-confirm').focus();
        return;
    }
    
    if (!agreeTerms) {
        showNotification('❌ 만 14세 이상 동의가 필요합니다');
        return;
    }
    
    if (!agreePrivacy) {
        showNotification('❌ 이용약관 및 개인정보 처리방침 동의가 필요합니다');
        return;
    }
    
    isLoggedIn = true;
    currentUser.name = name;
    currentUser.email = email;
    
    document.getElementById('header-auth-buttons').style.display = 'none';
    document.getElementById('header-user-menu').style.display = 'flex';
    
    showNotification('🎉 회원가입 성공! 환영합니다!');
    
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-password-confirm').value = '';
    document.getElementById('agree-terms').checked = false;
    document.getElementById('agree-privacy').checked = false;
    document.getElementById('agree-marketing').checked = false;
    
    setTimeout(() => {
        const onboarding = document.getElementById('onboarding');
        const globalHeader = document.getElementById('global-header');
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        onboarding.classList.add('active');
        onboarding.style.display = 'flex';
        
        globalHeader.style.display = 'none';
        
        window.scrollTo(0, 0);
    }, 1500);
}

function goToMyPage() {
    if (!isLoggedIn) {
        showNotification('로그인이 필요합니다');
        goToLoginPage();
        return;
    }
    
    console.log('👤 마이페이지로 이동');
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const mypageScreen = document.getElementById('mypage');
    mypageScreen.classList.add('active');
    mypageScreen.style.display = 'block';
    
    document.getElementById('mypage-username').textContent = currentUser.name || '사용자';
    document.getElementById('mypage-email').textContent = currentUser.email || 'user@example.com';
    document.getElementById('mypage-name-input').value = currentUser.name || '';
    document.getElementById('mypage-email-input').value = currentUser.email || '';
    document.getElementById('mypage-password-input').value = '';
    document.getElementById('mypage-password-confirm-input').value = '';
    
    window.scrollTo(0, 0);
}

function updateUserInfo() {
    const newName = document.getElementById('mypage-name-input').value.trim();
    const newPassword = document.getElementById('mypage-password-input').value;
    const confirmPassword = document.getElementById('mypage-password-confirm-input').value;
    
    if (!newName) {
        showNotification('❌ 이름을 입력해주세요');
        document.getElementById('mypage-name-input').focus();
        return;
    }
    
    if (newPassword || confirmPassword) {
        if (newPassword.length < 6) {
            showNotification('❌ 비밀번호는 6자 이상이어야 합니다');
            document.getElementById('mypage-password-input').focus();
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('❌ 비밀번호가 일치하지 않습니다');
            document.getElementById('mypage-password-confirm-input').focus();
            return;
        }
    }
    
    currentUser.name = newName;
    
    document.getElementById('mypage-username').textContent = newName;
    document.getElementById('mypage-password-input').value = '';
    document.getElementById('mypage-password-confirm-input').value = '';
    
    showNotification('✅ 회원 정보가 수정되었습니다!');
}

function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        isLoggedIn = false;
        currentUser = {
            name: '사용자',
            email: 'user@example.com'
        };
        
        document.getElementById('header-auth-buttons').style.display = 'flex';
        document.getElementById('header-user-menu').style.display = 'none';
        
        showNotification('로그아웃 되었습니다');
        
        setTimeout(() => {
            goToHome();
        }, 1000);
    }
}

// ============================================
// 예매 시스템
// ============================================
let bookingData = {
    eventName: 'BTS WORLD TOUR 2025',
    date: '',
    time: '',
    section: '',
    seats: [],
    totalPrice: 0
};

const seatPrices = {
    'VIP': 170000,
    'R': 140000,
    'S': 110000,
    'A': 80000
};

const timeSlotsByDate = {
    '2025-12-15': [
        { time: '14:00', available: 136 },
        { time: '19:00', available: 8 }
    ],
    '2025-12-16': [
        { time: '14:00', available: 200 },
        { time: '19:00', available: 150 }
    ],
    '2025-12-17': [
        { time: '18:00', available: 180 }
    ]
};

function goToEventDetail() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const screen = document.getElementById('event-detail');
    screen.classList.add('active');
    screen.style.display = 'block';
    window.scrollTo(0, 0);
}

function updateTimeSlots() {
    const date = document.getElementById('booking-date').value;
    const timeSlotsDiv = document.getElementById('time-slots');
    const buttonsDiv = document.getElementById('time-slot-buttons');
    const proceedBtn = document.getElementById('proceed-to-seats-btn');
    
    if (!date) {
        timeSlotsDiv.style.display = 'none';
        proceedBtn.style.display = 'none';
        return;
    }
    
    timeSlotsDiv.style.display = 'block';
    bookingData.date = date;
    
    const slots = timeSlotsByDate[date] || [];
    buttonsDiv.innerHTML = slots.map((slot, idx) => `
        <div class="time-slot-btn" data-time="${slot.time}" onclick="selectTimeSlot('${slot.time}')" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <div>
                <div style="font-size: 16px; font-weight: 700; color: #222;">${idx + 1}회차 ${slot.time}</div>
                <div style="font-size: 13px; color: #666;">잔여 ${slot.available}석</div>
            </div>
            <div style="font-size: 24px;">→</div>
        </div>
    `).join('');
}

function selectTimeSlot(time) {
    bookingData.time = time;
    
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        if (btn.dataset.time === time) {
            btn.style.borderColor = '#667eea';
            btn.style.background = '#f0f4ff';
        } else {
            btn.style.borderColor = '#e0e0e0';
            btn.style.background = 'white';
        }
    });
    
    document.getElementById('proceed-to-seats-btn').style.display = 'block';
}

function goToSeatSelection() {
    if (!bookingData.date || !bookingData.time) {
        showNotification('날짜와 회차를 선택해주세요');
        return;
    }
    
    const hasWaiting = Math.random() > 0.7;
    if (hasWaiting) {
        const waitingDiv = document.getElementById('waiting-notice');
        waitingDiv.style.display = 'block';
        
        let waitNum = Math.floor(Math.random() * 50) + 10;
        const waitNumSpan = document.getElementById('waiting-number');
        waitNumSpan.textContent = waitNum;
        
        const interval = setInterval(() => {
            waitNum--;
            waitNumSpan.textContent = waitNum;
            if (waitNum <= 0) {
                clearInterval(interval);
                waitingDiv.style.display = 'none';
            }
        }, 1000);
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const screen = document.getElementById('seat-section');
    screen.classList.add('active');
    screen.style.display = 'block';
    window.scrollTo(0, 0);
}

function selectSeatSection(section) {
    bookingData.section = section;
    bookingData.seats = [];
    
    document.getElementById('selected-section-name').textContent = `${section}석`;
    
    goToSeatDetail();
}

function goToSeatDetail() {
    const grid = document.getElementById('seat-grid');
    const section = bookingData.section;
    
    grid.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 12; col++) {
            const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
            const isUnavailable = Math.random() > 0.85;
            
            const seat = document.createElement('div');
            seat.className = 'seat-item';
            seat.dataset.seat = seatId;
            seat.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 4px;
                background: ${isUnavailable ? '#999' : '#e0e0e0'};
                cursor: ${isUnavailable ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: ${isUnavailable ? 'white' : '#666'};
                transition: all 0.2s;
            `;
            seat.textContent = seatId;
            
            if (!isUnavailable) {
                seat.onclick = () => toggleSeat(seatId, seat);
            }
            
            grid.appendChild(seat);
        }
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const screen = document.getElementById('seat-detail');
    screen.classList.add('active');
    screen.style.display = 'block';
    window.scrollTo(0, 0);
    
    updateSeatDisplay();
}

function toggleSeat(seatId, element) {
    if (bookingData.seats.includes(seatId)) {
        bookingData.seats = bookingData.seats.filter(s => s !== seatId);
        element.style.background = '#e0e0e0';
        element.style.color = '#666';
    } else {
        if (bookingData.seats.length >= 4) {
            showNotification('최대 4석까지 선택 가능합니다');
            return;
        }
        bookingData.seats.push(seatId);
        element.style.background = '#667eea';
        element.style.color = 'white';
    }
    
    updateSeatDisplay();
}

function updateSeatDisplay() {
    const display = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('selected-price-display');
    const proceedBtn = document.getElementById('proceed-to-payment-btn');
    
    if (bookingData.seats.length === 0) {
        display.textContent = '좌석을 선택해주세요';
        priceDisplay.textContent = '0원';
        proceedBtn.style.display = 'none';
    } else {
        display.textContent = `${bookingData.section}석 ${bookingData.seats.join(', ')}`;
        const price = seatPrices[bookingData.section] * bookingData.seats.length;
        bookingData.totalPrice = price;
        priceDisplay.textContent = `${price.toLocaleString()}원`;
        proceedBtn.style.display = 'block';
    }
}

function goToPayment() {
    if (bookingData.seats.length === 0) {
        showNotification('좌석을 선택해주세요');
        return;
    }
    
    document.getElementById('payment-datetime').textContent = `${bookingData.date} ${bookingData.time}`;
    document.getElementById('payment-seats').textContent = `${bookingData.section}석 ${bookingData.seats.join(', ')}`;
    document.getElementById('payment-ticket-price').textContent = `${bookingData.totalPrice.toLocaleString()}원`;
    document.getElementById('payment-total-price').textContent = `${(bookingData.totalPrice + 3700).toLocaleString()}원`;
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const screen = document.getElementById('payment');
    screen.classList.add('active');
    screen.style.display = 'block';
    window.scrollTo(0, 0);
}

function completePayment() {
    const agree1 = document.getElementById('payment-agree-1').checked;
    const agree2 = document.getElementById('payment-agree-2').checked;
    
    if (!agree1 || !agree2) {
        showNotification('약관에 동의해주세요');
        return;
    }
    
    document.getElementById('complete-datetime').textContent = `${bookingData.date} ${bookingData.time}`;
    document.getElementById('complete-seats').textContent = `${bookingData.section}석 ${bookingData.seats.join(', ')}`;
    document.getElementById('complete-price').textContent = `${(bookingData.totalPrice + 3700).toLocaleString()}원`;
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const screen = document.getElementById('payment-complete');
    screen.classList.add('active');
    screen.style.display = 'block';
    
    document.getElementById('global-header').style.display = 'none';
    
    window.scrollTo(0, 0);
}

function goToSeatSection() {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    document.getElementById('seat-section').classList.add('active');
    document.getElementById('seat-section').style.display = 'block';
    window.scrollTo(0, 0);
}

// ============================================
// 애니메이션 스타일
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 페이지 로드 완료');
    
    const globalHeader = document.getElementById('global-header');
    const onboarding = document.getElementById('onboarding');
    
    if (isLoggedIn) {
        document.getElementById('header-auth-buttons').style.display = 'none';
        document.getElementById('header-user-menu').style.display = 'flex';
    } else {
        document.getElementById('header-auth-buttons').style.display = 'flex';
        document.getElementById('header-user-menu').style.display = 'none';
    }
    
    if (onboarding && onboarding.classList.contains('active')) {
        globalHeader.classList.add('hidden');
    }
    
    const startBtn = document.getElementById('start-btn');
    const selectedCount = document.getElementById('selected-count');
    
    document.querySelectorAll('.onboarding-artist').forEach(artist => {
        artist.addEventListener('click', function() {
            const artistName = this.dataset.artist;
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedArtists = selectedArtists.filter(a => a !== artistName);
            } else {
                this.classList.add('selected');
                selectedArtists.push(artistName);
            }
            
            selectedCount.textContent = selectedArtists.length;
            
            if (selectedArtists.length > 0) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
            } else {
                startBtn.disabled = true;
                startBtn.style.opacity = '0.5';
                startBtn.style.cursor = 'not-allowed';
            }
        });
    });
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (selectedArtists.length > 0) {
                followingArtists = [...selectedArtists];
                
                onboarding.classList.remove('active');
                onboarding.style.display = 'none';
                
                globalHeader.classList.remove('hidden');
                globalHeader.style.display = 'flex';
                
                const calendar = document.getElementById('calendar');
                calendar.classList.add('active');
                calendar.style.display = 'block';
                
                setTimeout(() => {
                    initCalendarListeners();
                }, 100);
                
                window.scrollTo(0, 0);
                
                setTimeout(() => {
                    showNotification(`${selectedArtists.join(', ')}의 일정을 보여드릴게요! 🎉`);
                }, 300);
            }
        });
    }
    
    renderMyArtistsPage();
    
    document.querySelectorAll('input[name="party-type"]').forEach(radio => {
        const label = radio.closest('label');
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="party-type"]').forEach(r => {
                const lbl = r.closest('label');
                if (r.checked) {
                    lbl.style.borderColor = '#667eea';
                    lbl.style.background = '#f0f4ff';
                } else {
                    lbl.style.borderColor = '#e0e0e0';
                    lbl.style.background = 'white';
                }
            });
        });
    });
    
    document.querySelectorAll('#party .btn-primary').forEach(btn => {
        if (btn.textContent === '참여하기') {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('나의 개인 정보를 담은 신청 알림을 보냅니다.')) {
                    this.textContent = '참여 완료';
                    this.style.background = '#4caf50';
                    showNotification('팬 파티에 참여했습니다! 🎉');
                }
            });
        }
    });
    
    document.querySelectorAll('#party .btn-outline').forEach(btn => {
        if (btn.textContent === '상세보기') {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                showNotification('팬 파티 상세 정보를 확인합니다');
            });
        }
    });
    
    const modal = document.getElementById('event-modal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    const applicantsModal = document.getElementById('applicants-modal');
    applicantsModal.addEventListener('click', function(e) {
        if (e.target === applicantsModal) {
            closeApplicantsModal();
        }
    });
    
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('notification-panel');
        const notifBtn = e.target.closest('button[onclick="toggleNotificationPanel()"]');
        
        if (panel.style.display === 'block' && !panel.contains(e.target) && !notifBtn) {
            panel.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('participants-panel');
        const participantsBtn = e.target.closest('button[onclick="toggleParticipantsPanel()"]');
        
        if (panel && panel.style.display === 'block' && !panel.contains(e.target) && !participantsBtn) {
            panel.style.display = 'none';
        }
    });
    
    if (isLoggedIn) {
        renderNotifications();
    }
});
function goToBookingHistoryPage() {
    if (!isLoggedIn) {
        showNotification('로그인이 필요합니다');
        goToLoginPage();
        return;
    }
    
    console.log('🎫 예매 확인 페이지로 이동');
    
    showNotification('예매 내역 페이지로 이동합니다');
  
  }

// ============================================
// 채팅방 참가자 관리 & 별점 평가
// ============================================

// 채팅방 데이터
const chatroomData = {
    currentUserId: 1,
    hostId: 1,
    participants: [
        { id: 1, name: '푸바오', role: 'host' },
        { id: 2, name: '방탄 최애', role: 'member' },
        { id: 3, name: '행복한 팬', role: 'member' }
    ]
};

let selectedParticipantId = null;
const ratings = {};

// 참가자 목록 로드
function loadParticipantsList() {
    const listContainer = document.getElementById('participants-list');
    const leaveSectionContainer = document.getElementById('leave-party-section');
    const isHost = chatroomData.currentUserId === chatroomData.hostId;
    
    leaveSectionContainer.style.display = isHost ? 'none' : 'block';
    
    listContainer.innerHTML = chatroomData.participants.map(p => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; transition: all 0.2s; ${isHost && p.id !== chatroomData.currentUserId ? 'cursor: pointer;' : ''}" 
             ${isHost && p.id !== chatroomData.currentUserId ? `onclick="showParticipantMenu(event, ${p.id}, '${p.name}')"` : ''}>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; flex-shrink: 0;">
                👤
            </div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 600; color: #222;">
                    ${p.name}
                    ${p.role === 'host' ? '<span style="background: #ff1744; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-left: 6px;">방장</span>' : ''}
                    ${p.id === chatroomData.currentUserId ? '<span style="color: #667eea; font-size: 12px; margin-left: 6px;">(나)</span>' : ''}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 2px;">
                    ${p.role === 'host' ? '파티 운영자' : '참여자'}
                </div>
            </div>
        </div>
    `).join('');
}

// 참가자 메뉴 표시
function showParticipantMenu(event, participantId, participantName) {
    event.stopPropagation();
    
    const menu = document.getElementById('participant-menu');
    selectedParticipantId = participantId;
    
    menu.style.display = 'block';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    document.getElementById('kick-participant-btn').setAttribute('data-name', participantName);
    
    setTimeout(() => {
        document.addEventListener('click', closeParticipantMenu);
    }, 0);
}

// 참가자 메뉴 닫기
function closeParticipantMenu() {
    const menu = document.getElementById('participant-menu');
    menu.style.display = 'none';
    selectedParticipantId = null;
    document.removeEventListener('click', closeParticipantMenu);
}

// 참가자 강퇴
function kickParticipant() {
    if (!selectedParticipantId) return;
    
    const participantName = document.getElementById('kick-participant-btn').getAttribute('data-name');
    
    if (confirm(`정말 "${participantName}"님을 강퇴하시겠습니까?`)) {
        const index = chatroomData.participants.findIndex(p => p.id === selectedParticipantId);
        if (index !== -1) {
            const kickedParticipant = chatroomData.participants[index];
            
            // 참가자 목록에서 제거
            chatroomData.participants.splice(index, 1);
            
            // 참가자 수 업데이트
            const badge = document.getElementById('participants-badge');
            badge.textContent = chatroomData.participants.length;
            
            document.getElementById('chatroom-participants').textContent = 
                `참여자 ${chatroomData.participants.length}명`;
            
            // 목록 새로고침
            loadParticipantsList();
            
            // 방장에게 알림
            showNotification(`${participantName}님이 강퇴되었습니다`);
            
            // 🆕 강퇴당한 사람에게 알림 전송
            sendKickNotification(selectedParticipantId, participantName, '지민이 최애 🎤');
        }
    }
    
    closeParticipantMenu();
}

// 🆕 강퇴 알림 전송 함수
function sendKickNotification(userId, userName, partyName) {
    // 현재 채팅방의 참가자 정보 복사 (강퇴당한 사람 제외)
    const participantsForRating = chatroomData.participants
        .filter(p => p.id !== userId)  // 강퇴당한 사람 제외
        .map(p => ({ ...p }));  // 복사
    
    // 강퇴당한 사람에게 알림 추가
    addNotification(
        'party_kicked',
        '파티에서 강퇴되었습니다',
        `"${partyName}" 파티에서 강퇴되었습니다. 참여자들을 평가해주세요.`,
        { 
            partyId: currentChatRoomId,
            kickedUserId: userId,
            kickedUserName: userName,
            participants: participantsForRating  // 🆕 평가할 참가자 정보
        }
    );
    
    console.log(`[강퇴 알림 전송] ${userName}님에게 알림 전송됨`);
}

// 파티 나가기
function leaveParty() {
    if (confirm('정말 파티에서 나가시겠습니까?')) {
        showRatingModal();
    }
}

// 별점 평가 모달 표시
function showRatingModal() {
    const modal = document.getElementById('rating-modal');
    const ratingList = document.getElementById('rating-list');
    
    document.getElementById('participants-panel').style.display = 'none';
    
    const otherParticipants = chatroomData.participants.filter(
        p => p.id !== chatroomData.currentUserId
    );
    
    otherParticipants.forEach(p => {
        ratings[p.id] = 0;
    });
    
    ratingList.innerHTML = otherParticipants.map(p => `
        <div class="rating-card">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; flex-shrink: 0;">
                    👤
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 700; color: #222;">
                        ${p.name}
                        ${p.role === 'host' ? '<span style="background: #ff1744; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-left: 6px;">방장</span>' : ''}
                    </div>
                    <div style="font-size: 13px; color: #666; margin-top: 4px;">
                        이 참여자와의 경험은 어떠셨나요?
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center;">
                <div class="rating-stars" data-user-id="${p.id}">
                    <span class="star" data-rating="1" onclick="setRating(${p.id}, 1)">★</span>
                    <span class="star" data-rating="2" onclick="setRating(${p.id}, 2)">★</span>
                    <span class="star" data-rating="3" onclick="setRating(${p.id}, 3)">★</span>
                    <span class="star" data-rating="4" onclick="setRating(${p.id}, 4)">★</span>
                    <span class="star" data-rating="5" onclick="setRating(${p.id}, 5)">★</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 12px; font-size: 14px; color: #999; min-height: 20px;">
                <span id="rating-text-${p.id}"></span>
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
}

// 별점 설정
function setRating(userId, rating) {
    ratings[userId] = rating;
    
    const starsContainer = document.querySelector(`.rating-stars[data-user-id="${userId}"]`);
    const stars = starsContainer.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    const ratingTexts = {
        1: '😞 별로예요',
        2: '😐 그저 그래요',
        3: '😊 괜찮아요',
        4: '😄 좋아요',
        5: '🤩 최고예요!'
    };
    
    document.getElementById(`rating-text-${userId}`).textContent = ratingTexts[rating];
}

// 별점 제출
function submitRatings() {
    const unratedParticipants = Object.entries(ratings).filter(([id, rating]) => rating === 0);
    
    if (unratedParticipants.length > 0) {
        if (!confirm('아직 평가하지 않은 참여자가 있습니다. 그래도 제출하시겠습니까?')) {
            return;
        }
    }
    
    console.log('평가 데이터:', ratings);
    
    document.getElementById('rating-modal').style.display = 'none';
    
    // 🆕 강퇴 알림에서 온 경우
    if (window.currentKickNotificationId) {
        notifications = notifications.filter(n => n.id !== window.currentKickNotificationId);
        renderNotifications();
        window.currentKickNotificationId = null;
        
        showNotification('평가가 완료되었습니다.');
        
        // 홈 또는 현재 페이지 유지
        // 이미 다른 페이지에 있다면 그대로 유지
    } else {
        // 일반 나가기에서 온 경우 (채팅방에서)
        showNotification('평가가 완료되었습니다. 파티에서 나갔습니다.');
        
        setTimeout(() => {
            goToChatsPage();
        }, 1500);
    }
}

// 별점 건너뛰기
function skipRating() {
    if (confirm('평가를 건너뛰시겠습니까?')) {
        document.getElementById('rating-modal').style.display = 'none';
        
        // 🆕 강퇴 알림에서 온 경우
        if (window.currentKickNotificationId) {
            notifications = notifications.filter(n => n.id !== window.currentKickNotificationId);
            renderNotifications();
            window.currentKickNotificationId = null;
            
            showNotification('평가를 건너뛰었습니다');
        } else {
            // 일반 나가기에서 온 경우
            showNotification('파티에서 나갔습니다');
            setTimeout(() => {
                goToChatsPage();
            }, 1000);
        }
    }
}

// 🆕 강퇴 후 평가하기 (알림에서 호출)
function rateAfterKick(notificationId, partyId) {
    console.log('⭐ 참여자 평가하기 클릭:', notificationId, partyId);
    
    // 알림 데이터 가져오기
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !notification.participants) {
        showNotification('참가자 정보를 불러올 수 없습니다');
        return;
    }
    
    // 알림을 읽음으로 표시
    markAsRead(notificationId);
    
    // 알림 패널 닫기
    const panel = document.getElementById('notification-panel');
    if (panel) {
        panel.style.display = 'none';
    }
    
    // 🆕 알림 데이터로 별점 모달 표시
    showRatingModalFromNotification(notification.participants, notificationId);
}
// 🆕 알림에서 바로 별점 모달 표시
function showRatingModalFromNotification(participants, notificationId) {
    const modal = document.getElementById('rating-modal');
    const ratingList = document.getElementById('rating-list');
    
    // 평가할 참가자들 초기화
    participants.forEach(p => {
        ratings[p.id] = 0;
    });
    
    ratingList.innerHTML = participants.map(p => `
        <div class="rating-card">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; flex-shrink: 0;">
                    👤
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 700; color: #222;">
                        ${p.name}
                        ${p.role === 'host' ? '<span style="background: #ff1744; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-left: 6px;">방장</span>' : ''}
                    </div>
                    <div style="font-size: 13px; color: #666; margin-top: 4px;">
                        이 참여자와의 경험은 어떠셨나요?
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center;">
                <div class="rating-stars" data-user-id="${p.id}">
                    <span class="star" data-rating="1" onclick="setRating(${p.id}, 1)">★</span>
                    <span class="star" data-rating="2" onclick="setRating(${p.id}, 2)">★</span>
                    <span class="star" data-rating="3" onclick="setRating(${p.id}, 3)">★</span>
                    <span class="star" data-rating="4" onclick="setRating(${p.id}, 4)">★</span>
                    <span class="star" data-rating="5" onclick="setRating(${p.id}, 5)">★</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 12px; font-size: 14px; color: #999; min-height: 20px;">
                <span id="rating-text-${p.id}"></span>
            </div>
        </div>
    `).join('');
    
    // 평가 완료 후 알림 삭제를 위한 임시 저장
    window.currentKickNotificationId = notificationId;
    
    modal.style.display = 'flex';
}