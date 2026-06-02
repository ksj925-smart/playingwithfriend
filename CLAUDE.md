# PlayingwithFriend — 프로젝트 지침

## 프로젝트 개요
- **프로젝트명**: PlayingwithFriend
- **목적**: 친구와 함께하는 온라인 보드게임 통합 플랫폼
- **GitHub**: ksj925-smart/playingwithfriend
- **호스팅**: Firebase Hosting (`playingwithfriend-5628d`)
- **배포 URL**: https://playingwithfriend-5628d.web.app

## 권한 설정
- 모든 파일 읽기/쓰기/생성/삭제 자동 허용
- 터미널 명령어 실행 자동 허용
- Git 작업 자동 허용
- Firebase 배포 자동 허용
- npm/패키지 설치 자동 허용
- 매번 확인 없이 바로 진행

## 기술 스택
- **프론트엔드**: Vanilla HTML/CSS/JS (프레임워크 없음)
- **DB**: Firebase Realtime Database
- **호스팅**: Firebase Hosting
- **폰트**: Pretendard (메인 로비), Noto Sans KR + Bebas Neue (게임 화면)

## 폴더 구조
```
playingwithfriend/
├── index.html          # 메인 로비 (닉네임 입력 → 게임 목록 → 방 입장)
├── style.css           # 메인 CSS (다크/라이트/엑셀 3종 테마)
├── app.js              # 메인 JS
├── firebase-config.js  # Firebase 설정 (gitignore 대상)
├── firebase.json       # Firebase 배포 설정
├── .firebaserc         # Firebase 프로젝트 ID
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── CLAUDE.md           # 이 파일
├── .claude/
│   └── settings.json   # Claude Code 권한 설정
└── games/
    ├── shared/
    │   └── room-ui.js  # 공통 룸 UI 모듈 (ES module)
    ├── quoriko/        # 쿼리도 온라인 (2인/4인)
    ├── yacht/          # 요트 주사위 온라인 (2~8인)
    ├── mahe/           # 마헤 (준비중)
    ├── winners-circle/ # 위너스 서클 (준비중)
    ├── splendor/       # 스플랜더 (준비중)
    └── catan/          # 카탄 (준비중)
```

## Firebase DB 구조
```
games/
  quoriko/{roomCode}/
    code, playerCount, status, players, game
  yacht/{roomCode}/
    code, playerCount, status, players, game
```

## 개발 원칙
- 이메일/소셜 로그인 없음 — 닉네임만 입력해서 바로 시작
- 닉네임은 `sessionStorage['pwf-nickname']`에 저장
- 테마는 `localStorage['pwf-theme']`에 저장 (dark/light/excel)
- 랭킹/전적/리더보드 없음
- 4자리 방 코드로 친구와 입장
- 모바일 퍼스트 (max-width 480px 기준)
- PWA 지원

## 공통 룸 UI (games/shared/room-ui.js)
새 게임 추가 시 반드시 이 모듈을 import해서 사용:
```js
import {
  PLAYER_COLORS, RANK_EMOJIS, RANK_COLORS,
  FIREBASE_CONFIG, injectRoomCSS,
  showToast, showScreen,
  renderWaitingSlots, updateStartButton,
  parseRoomParams, getMyNick, genUserId,
} from '../shared/room-ui.js';
```

## 게임 URL 파라미터 규칙
- 방 만들기: `/games/{id}/?room=XXXX&players=N&host=true`
- 방 입장:   `/games/{id}/?room=XXXX&players=N`

## app.js — 게임별 경로 등록
새 게임 추가 시 `GAME_PATHS` 객체에 추가:
```js
const GAME_PATHS = {
  quoriko: '/games/quoriko/',
  yacht:   '/games/yacht/',
  // 신규 게임 여기에 추가
};
```

## firebase.json — 리라이트 규칙
새 게임 추가 시 rewrites 배열에 추가 (** rewrite보다 앞에 위치):
```json
{ "source": "/games/{id}/**", "destination": "/games/{id}/index.html" }
```

## 배포 명령
```bash
firebase deploy --only hosting
```

## Git 커밋 컨벤션
- `feat:` 새 기능
- `fix:` 버그 수정
- `chore:` 설정/빌드 변경
- `refactor:` 리팩토링
