/**
 * games/shared/room-ui.js
 * PlayingwithFriend 공통 룸 UI 유틸리티
 * quoriko / yacht / mahe 등 모든 게임 페이지에서 import해 사용
 */

// ── 공통 상수 ──────────────────────────────────────────────────────────────
export const PLAYER_COLORS = [
  '#e8c547', '#e84747', '#47b8e8', '#47e888',
  '#ff9800', '#9c27b0', '#00bcd4', '#4caf50',
];
export const RANK_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
export const RANK_COLORS = ['gold', 'silver', '#cd7f32', '#666688', '#888', '#888', '#888', '#888'];

// ── Firebase 공통 설정 ──────────────────────────────────────────────────────
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAsZMn2WA4jQjyT_C9JXeNy95isET75FzM',
  authDomain: 'playingwithfriend-5628d.firebaseapp.com',
  databaseURL: 'https://playingwithfriend-5628d-default-rtdb.firebaseio.com',
  projectId: 'playingwithfriend-5628d',
  storageBucket: 'playingwithfriend-5628d.firebasestorage.app',
  messagingSenderId: '127477048637',
  appId: '1:127477048637:web:11240af56c8b89b9a7d154',
};

// ── 공통 CSS (룸 UI 전용) ───────────────────────────────────────────────────
export const ROOM_CSS = `
/* === PlayingwithFriend 공통 룸 UI === */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700;900&family=Bebas+Neue&display=swap');

:root {
  --bg:#0d0d0f; --surface:#161619;
  --text:#e8e8f0; --muted:#666688;
  --accent:#5555ff; --green:#44cc88; --red:#ff5555;
  --border:#333355;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg); color: var(--text);
  font-family: 'Noto Sans KR', sans-serif;
  min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
  padding: 14px 8px 50px; overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* 뒤로가기 */
.back-nav {
  width: 100%; max-width: 480px;
  display: flex; align-items: center; margin-bottom: 6px;
}
.back-nav-btn {
  background: none; border: none; color: var(--muted);
  font-family: 'Noto Sans KR', sans-serif; font-size: 13px;
  cursor: pointer; display: flex; align-items: center; gap: 5px;
  padding: 4px 0; transition: color .2s;
}
.back-nav-btn:hover { color: var(--text); }

/* 화면 공통 */
.screen { width: 100%; max-width: 480px; display: none; flex-direction: column; gap: 12px; align-items: center; }
.screen.active { display: flex; }

/* 카드 */
.card {
  background: var(--surface); border-radius: 16px; padding: 22px 24px;
  width: 100%; border: 2px solid var(--border); box-shadow: 0 6px 28px #00000050;
}
.card h2 { font-size: 16px; font-weight: 900; margin-bottom: 14px; letter-spacing: .5px; }
.card h2 span { color: var(--accent); }

/* 방 코드 박스 */
.room-code-box {
  background: #0d0d0f; border-radius: 12px; padding: 14px 18px;
  text-align: center; border: 2px dashed #444466; margin: 8px 0;
}
.room-code {
  font-family: 'Bebas Neue', sans-serif; font-size: 42px;
  letter-spacing: 10px; color: var(--accent);
}
.room-code-hint { font-size: 11px; color: var(--muted); margin-top: 4px; }

/* 대기 슬롯 */
.waiting-list { width: 100%; display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
.waiting-slot {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #0d0d0f;
  border-radius: 10px; border: 2px solid var(--border);
}
.waiting-slot.filled { border-color: #444466; }
.slot-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.slot-name { font-size: 13px; font-weight: 700; flex: 1; }
.slot-tag {
  font-size: 10px; color: var(--muted); padding: 2px 8px;
  border-radius: 8px; background: #1e1e26; border: 1px solid var(--border);
}
.slot-me { color: var(--accent); border-color: var(--accent); background: #5555ff15; }

/* 버튼 */
.btn-full {
  width: 100%; padding: 13px; border-radius: 12px; border: none;
  font-family: 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: all .2s; letter-spacing: .5px;
}
.btn-full.primary { background: var(--accent); color: #fff; box-shadow: 0 4px 18px #5555ff40; }
.btn-full.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 22px #5555ff60; }
.btn-full.secondary { background: #1e1e26; color: var(--muted); border: 2px solid var(--border); margin-top: 6px; }
.btn-full.secondary:hover { color: var(--text); border-color: var(--muted); }
.btn-full:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

/* 연결 뱃지 */
.conn-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; color: var(--muted); margin-bottom: 6px; }
.conn-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
.conn-dot.offline { background: var(--red); animation: none; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

/* 로딩 */
.loading-screen {
  width: 100%; max-width: 480px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px; min-height: 200px; color: var(--muted);
}
.spinner {
  width: 36px; height: 36px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 결과 오버레이 */
.overlay {
  display: none; position: fixed; inset: 0; background: #000000cc;
  backdrop-filter: blur(10px); z-index: 100;
  align-items: center; justify-content: center; flex-direction: column;
}
.overlay.show { display: flex; }
.result-card {
  background: var(--surface); border-radius: 20px; padding: 30px 38px;
  text-align: center; border: 2px solid var(--border);
  box-shadow: 0 20px 60px #00000080; animation: pop .4s cubic-bezier(.34,1.56,.64,1);
  min-width: 280px; max-width: 420px; width: calc(100% - 32px);
}
@keyframes pop { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
.result-title { font-family:'Bebas Neue',sans-serif; font-size: 40px; letter-spacing: 5px; margin-bottom: 14px; }
.result-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 10px; margin-bottom: 5px; background: #ffffff08;
}
.result-rank { font-family:'Bebas Neue',sans-serif; font-size: 26px; width: 30px; text-align: right; }
.result-dot { width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0; }
.result-name { flex: 1; text-align: left; font-weight: 700; font-size: 13px; }
.result-note { font-size: 11px; color: var(--muted); }
.result-sub-detail { font-size: 11px; color: var(--muted); margin-top: 2px; }

/* 토스트 */
.toast {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(60px);
  background: #222233; border: 1px solid #444466; border-radius: 12px;
  padding: 10px 20px; font-size: 13px; color: var(--text);
  box-shadow: 0 6px 20px #00000060; z-index: 200;
  transition: transform .3s ease; white-space: nowrap; pointer-events: none;
}
.toast.show { transform: translateX(-50%) translateY(0); }

/* 반응형 */
@media (max-width: 480px) {
  body { padding: 10px 8px 60px; }
}
`;

// ── 유틸리티 함수 ────────────────────────────────────────────────────────────

/** 공통 CSS 인젝션 (한 번만 호출) */
export function injectRoomCSS() {
  if (document.getElementById('pwf-room-css')) return;
  const style = document.createElement('style');
  style.id = 'pwf-room-css';
  style.textContent = ROOM_CSS;
  document.head.insertBefore(style, document.head.firstChild);
}

/** 토스트 메시지 */
let _toastTimer = null;
export function showToast(msg, dur = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}

/** 화면 전환 */
export function showScreen(id) {
  const loading = document.getElementById('loadingScreen');
  if (loading) loading.style.display = 'none';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/** 대기실 슬롯 렌더링 */
export function renderWaitingSlots(containerId, players, playerCount, myId) {
  const list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = '';
  for (let i = 0; i < playerCount; i++) {
    const p = players?.[i];
    const div = document.createElement('div');
    div.className = 'waiting-slot' + (p ? ' filled' : '');
    const isMe = p && p.id === myId;
    div.innerHTML = `
      <div class="slot-dot" style="background:${PLAYER_COLORS[i]}${p ? '' : '44'}"></div>
      <div class="slot-name" style="color:${p ? PLAYER_COLORS[i] : PLAYER_COLORS[i] + '44'}">${p ? p.nick : '( 대기 중... )'}</div>
      ${p ? `<div class="slot-tag ${isMe ? 'slot-me' : ''}">${isMe ? '나' : '참가'}</div>` : ''}
    `;
    list.appendChild(div);
  }
}

/** 게임 시작 버튼 상태 업데이트 */
export function updateStartButton(btnId, mySlot, players, playerCount) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const filled = Object.keys(players || {}).length;
  btn.disabled = !(mySlot === 0 && filled === playerCount);
  if (mySlot === 0 && filled === playerCount)
    btn.textContent = '▶ 게임 시작!';
  else if (mySlot === 0)
    btn.textContent = `게임 시작 (${filled}/${playerCount}명 대기 중)`;
  else
    btn.textContent = '방장이 시작하길 기다리는 중...';
}

/** URL 파라미터 파싱 */
export function parseRoomParams() {
  const p = new URLSearchParams(location.search);
  return {
    roomCode:    (p.get('room') || '').toUpperCase(),
    playerCount: Math.max(2, parseInt(p.get('players') || '2')),
    isHost:      p.get('host') === 'true',
  };
}

/** sessionStorage에서 닉네임 가져오기 */
export function getMyNick() {
  return sessionStorage.getItem('pwf-nickname') || '익명';
}

/** 랜덤 User ID 생성 */
export function genUserId() {
  return 'U' + Math.random().toString(36).slice(2, 9).toUpperCase();
}

/** 공통 대기실 HTML 렌더링 */
export function buildWaitScreenHTML(gameTitle) {
  return `
    <div class="card">
      <h2>🕐 대기실 — <span id="waitMode"></span></h2>
      <div class="room-code-box">
        <div class="room-code" id="waitCode">----</div>
        <div class="room-code-hint">이 코드를 친구에게 공유하세요</div>
      </div>
      <div class="waiting-list" id="waitingList"></div>
      <button class="btn-full primary" id="startBtn" disabled>게임 시작</button>
      <button class="btn-full secondary" id="leaveBtn">나가기</button>
    </div>
  `;
}
