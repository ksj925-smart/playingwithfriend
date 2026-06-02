// ── Firebase 초기화 (firebase-config.js가 window.firebaseConfig를 주입) ──
let db = null;
async function initFirebase() {
  try {
    if (!window.firebaseConfig) throw new Error('firebaseConfig not found');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getDatabase, ref, set, get, child } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = initializeApp(window.firebaseConfig);
    db = getDatabase(app);
    window._fbRef = ref;
    window._fbSet = set;
    window._fbGet = get;
    window._fbChild = child;
    console.log('Firebase 연결 성공');
  } catch (e) {
    console.warn('Firebase 미연결 (데모 모드):', e.message);
  }
}
initFirebase();

// ── 게임 데이터 ──
const GAMES = [
  { id: 'quoriko',       name: '쿼리도',       players: [2, 4],        tag: '전략',  active: true  },
  { id: 'yacht',         name: '요트 주사위',   players: [2,3,4,5,6,7,8], tag: '주사위', active: true  },
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

  // 헤더 행 (행1: 컬럼 타이틀)
  const cols = ['게임 이름', '인원', '장르', '상태', '비고'];
  const headerRow = document.createElement('tr');
  headerRow.className = 'xl-header-row';
  headerRow.innerHTML = `<td class="xl-rownum">1</td>` +
    cols.map(h => `<td><span class="xl-cell xl-header-cell">${h}</span></td>`).join('');
  body.appendChild(headerRow);

  // 데이터 행
  GAMES.forEach((g, i) => {
    const rowNum = i + 2;
    const playerRange = `${g.players[0]}~${g.players[g.players.length - 1]}인`;
    const statusText = g.active ? '● 플레이 가능' : '○ 준비중';
    const note = g.active ? '' : '개발 예정';

    const tr = document.createElement('tr');
    tr.dataset.gameId = g.id;

    const activeClass = g.active ? 'xl-active' : 'xl-inactive';
    tr.innerHTML = `
      <td class="xl-rownum">${rowNum}</td>
      <td><span class="xl-cell ${activeClass}" data-col="A" data-row="${rowNum}">${g.name}</span></td>
      <td><span class="xl-cell" data-col="B" data-row="${rowNum}">${playerRange}</span></td>
      <td><span class="xl-cell" data-col="C" data-row="${rowNum}">${g.tag}</span></td>
      <td><span class="xl-cell" data-col="D" data-row="${rowNum}">${statusText}</span></td>
      <td><span class="xl-cell xl-inactive" data-col="E" data-row="${rowNum}">${note}</span></td>`;

    // 행 전체 클릭으로 선택 + 활성 게임이면 방 입장
    tr.addEventListener('click', (e) => {
      const cell = e.target.closest('.xl-cell');
      if (!cell) return;
      selectXlRow(tr, rowNum, cell.dataset.col, g);
      if (g.active) setTimeout(() => openRoom(g), 280);
    });

    body.appendChild(tr);
  });

  // 빈 행 추가 (엑셀처럼 아래로 채움)
  for (let i = GAMES.length + 2; i <= 30; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="xl-rownum">${i}</td><td></td><td></td><td></td><td></td><td></td>`;
    body.appendChild(tr);
  }
}

function selectXlRow(tr, rowNum, col, g) {
  // 이전 선택 초기화
  document.querySelectorAll('.xl-cell.xl-selected').forEach(c => c.classList.remove('xl-selected'));
  document.querySelectorAll('.excel-grid tbody tr.xl-row-selected').forEach(r => r.classList.remove('xl-row-selected'));
  document.querySelectorAll('.excel-grid thead th.xl-col-selected').forEach(h => h.classList.remove('xl-col-selected'));

  // 새 선택
  tr.classList.add('xl-row-selected');
  const clickedCell = tr.querySelector(`[data-col="${col}"]`);
  if (clickedCell) clickedCell.classList.add('xl-selected');

  // 열 헤더 강조
  const colEl = document.getElementById(`xlCol${col}`);
  if (colEl) colEl.classList.add('xl-col-selected');

  // 수식 입력줄 업데이트
  document.getElementById('cellRef').textContent = `${col}${rowNum}`;
  document.getElementById('formulaContent').textContent =
    `=VLOOKUP("${g.name}", 게임목록, 2, FALSE)`;
}

function updateFormulaBar() {
  const nickname = sessionStorage.getItem('pwf-nickname') || '닉네임';
  document.getElementById('cellRef').textContent = 'A1';
  document.getElementById('formulaContent').textContent =
    `=VLOOKUP(${nickname}, 게임목록, 2, FALSE)`;
}

window.xlRibbonTab = function(btn) {
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
};

window.excelSheetClick = function(tab, name) {
  document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
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

// ── 게임별 이동 경로 ──
const GAME_PATHS = {
  quoriko: '/games/quoriko/',
  yacht:   '/games/yacht/',
};

// ── 방 만들기 ──
window.createRoom = async function () {
  const code = generateCode();
  const nickname = sessionStorage.getItem('pwf-nickname');

  // 게임 전용 페이지가 있으면 이동
  if (GAME_PATHS[currentGame.id]) {
    window.location.href =
      `${GAME_PATHS[currentGame.id]}?room=${code}&players=${selectedPlayers}&host=true`;
    return;
  }

  // 범용 처리 (아직 개별 페이지 없는 게임)
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

  // 게임 전용 페이지가 있으면 이동
  if (GAME_PATHS[currentGame.id]) {
    window.location.href =
      `${GAME_PATHS[currentGame.id]}?room=${code}&players=${selectedPlayers}`;
    return;
  }

  // 범용 처리
  if (db) {
    try {
      const snap = await window._fbGet(window._fbChild(window._fbRef(db), `games/${currentGame.id}/${code}`));
      if (!snap.exists()) { showToast('방을 찾을 수 없습니다'); return; }
    } catch (e) {
      console.warn('Firebase 조회 실패:', e);
    }
  }
  showToast(`${code} 방에 입장합니다!`);
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
