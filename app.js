// ── Firebase (dynamic import so firebase-config.js can be gitignored) ──
let db = null;
async function initFirebase() {
  try {
    const { default: firebaseConfig } = await import('./firebase-config.js');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getDatabase, ref, set, get, child } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    window._fbRef = ref;
    window._fbSet = set;
    window._fbGet = get;
    window._fbChild = child;
  } catch (e) {
    console.warn('Firebase 미연결 (데모 모드):', e.message);
  }
}
initFirebase();

// ── 게임 데이터 ──
const GAMES = [
  { id: 'quoriko',       name: '쿼리도',       players: [2, 4],        tag: '전략',  active: true  },
  { id: 'yacht',         name: '요트 주사위',   players: [2,3,4,5,6],   tag: '주사위', active: true  },
  { id: 'mahe',          name: '마헤',          players: [2,3,4,5],     tag: '레이싱', active: true  },
  { id: 'winners-circle',name: '위너스 서클',   players: [2,3,4,5,6],   tag: '베팅',  active: false },
  { id: 'splendor',      name: '스플랜더',      players: [2,3,4],       tag: '보석',  active: false },
  { id: 'catan',         name: '카탄',          players: [3,4],         tag: '개척',  active: false },
];

// ── 테마 ──
const THEMES = ['dark', 'light', 'excel'];
const THEME_LABELS = { dark: '🌙 다크', light: '☀️ 라이트', excel: '📊 엑셀' };

function getTheme() { return localStorage.getItem('pwf-theme') || 'dark'; }
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pwf-theme', theme);
  const btn = document.querySelector('.theme-btn');
  if (btn) btn.textContent = THEME_LABELS[theme];
  document.querySelectorAll('.theme-btn').forEach(b => b.textContent = THEME_LABELS[theme]);
  updateFormulaBar();
}
window.cycleTheme = function () {
  const cur = getTheme();
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  applyTheme(next);
};

// ── 상태 ──
let currentGame = null;
let selectedPlayers = null;

// ── 화면 전환 ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── 닉네임 화면 ──
window.enterLobby = function () {
  const val = document.getElementById('nicknameInput').value.trim();
  if (!val) { showToast('닉네임을 입력해주세요'); return; }
  sessionStorage.setItem('pwf-nickname', val);
  showLobby();
};
document.getElementById('nicknameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') window.enterLobby();
});

// ── 로비 ──
function showLobby() {
  const nickname = sessionStorage.getItem('pwf-nickname');
  if (!nickname) { showScreen('screenNickname'); return; }
  document.getElementById('greetingText').textContent = `안녕하세요, ${nickname}님`;
  renderGameList();
  renderExcelGrid();
  updateFormulaBar();
  showScreen('screenLobby');
}

window.changeNickname = function () {
  sessionStorage.removeItem('pwf-nickname');
  showScreen('screenNickname');
};

function renderGameList() {
  const list = document.getElementById('gameList');
  list.innerHTML = '';
  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card' + (g.active ? '' : ' disabled');
    card.innerHTML = `
      <div class="game-info">
        <span class="game-name">${g.name}</span>
        <span class="game-meta">${g.players[0]}~${g.players[g.players.length-1]}인 · ${g.tag}</span>
      </div>
      <span class="game-tag ${g.active ? 'tag-active' : 'tag-soon'}">${g.active ? '플레이' : '준비중'}</span>
    `;
    if (g.active) card.addEventListener('click', () => openRoom(g));
    list.appendChild(card);
  });
}

// ── Excel 그리드 ──
function renderExcelGrid() {
  const body = document.getElementById('excelGridBody');
  body.innerHTML = '';

  const headers = ['게임 이름', '인원', '장르', '상태'];
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<td class="row-num">1</td>` +
    headers.map(h => `<td><span class="xl-cell" style="font-weight:700;background:#f0ede6">${h}</span></td>`).join('');
  body.appendChild(headerRow);

  GAMES.forEach((g, i) => {
    const tr = document.createElement('tr');
    const playerRange = `${g.players[0]}~${g.players[g.players.length-1]}인`;
    const statusText = g.active ? '▶ 플레이' : '○ 준비중';
    tr.innerHTML = `<td class="row-num">${i + 2}</td>
      <td><span class="xl-cell game-${g.active ? 'active' : 'inactive'}" data-id="${g.id}">${g.name}</span></td>
      <td><span class="xl-cell">${playerRange}</span></td>
      <td><span class="xl-cell">${g.tag}</span></td>
      <td><span class="xl-cell">${statusText}</span></td>`;
    if (g.active) {
      tr.querySelector(`[data-id="${g.id}"]`).addEventListener('click', function() {
        document.querySelectorAll('.xl-cell').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('cellRef').textContent = `A${i+2}`;
        document.getElementById('formulaContent').textContent =
          `=VLOOKUP("${g.name}", 게임목록, 2, FALSE)`;
        setTimeout(() => openRoom(g), 300);
      });
    }
    body.appendChild(tr);
  });
}

function updateFormulaBar() {
  const nickname = sessionStorage.getItem('pwf-nickname') || '닉네임';
  document.getElementById('formulaContent').textContent =
    `=VLOOKUP(${nickname}, 게임목록, 2, FALSE)`;
}

window.excelSheetClick = function(name) {
  document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  showToast(`${name} 시트`);
};

// ── 방 입장 화면 ──
function openRoom(game) {
  currentGame = game;
  selectedPlayers = game.players[0];
  document.getElementById('roomTitle').textContent = game.name;
  document.getElementById('roomCodeDisplay').classList.remove('show');
  document.getElementById('roomCodeInput').value = '';
  renderPlayerSelector(game);
  showScreen('screenRoom');
}

function renderPlayerSelector(game) {
  const container = document.getElementById('playerSelector');
  container.innerHTML = '';
  game.players.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'player-btn' + (n === selectedPlayers ? ' selected' : '');
    btn.textContent = `${n}인`;
    btn.addEventListener('click', () => {
      selectedPlayers = n;
      document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    container.appendChild(btn);
  });
}

window.showLobby = showLobby;

// ── 방 만들기 ──
window.createRoom = async function () {
  const code = generateCode();
  const nickname = sessionStorage.getItem('pwf-nickname');

  if (db) {
    try {
      await window._fbSet(window._fbRef(db, `games/${currentGame.id}/${code}`), {
        host: nickname,
        game: currentGame.id,
        maxPlayers: selectedPlayers,
        createdAt: Date.now(),
        status: 'waiting',
      });
    } catch (e) {
      console.warn('Firebase 저장 실패:', e);
    }
  }

  document.getElementById('roomCodeValue').textContent = code;
  document.getElementById('roomCodeDisplay').classList.add('show');
  showToast(`방 코드: ${code}`);
};

// ── 방 입장 ──
window.joinRoom = async function () {
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (code.length !== 4) { showToast('4자리 방 코드를 입력해주세요'); return; }

  if (db) {
    try {
      const snap = await window._fbGet(window._fbChild(window._fbRef(db), `games/${currentGame.id}/${code}`));
      if (!snap.exists()) { showToast('방을 찾을 수 없습니다'); return; }
    } catch (e) {
      console.warn('Firebase 조회 실패:', e);
    }
  }

  showToast(`${code} 방에 입장합니다!`);
  // TODO: 각 게임 페이지로 이동
  // window.location.href = `/games/${currentGame.id}/?room=${code}`;
};

document.getElementById('roomCodeInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') window.joinRoom();
});

// ── 유틸 ──
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── PWA ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// ── 초기화 ──
applyTheme(getTheme());
const savedNickname = sessionStorage.getItem('pwf-nickname');
if (savedNickname) {
  showLobby();
} else {
  showScreen('screenNickname');
}
