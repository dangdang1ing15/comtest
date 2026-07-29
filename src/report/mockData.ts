// 반 평균/표준편차/피드백 문구 같은 "벤치마크" 데이터 — 실제 학급 데이터가 없는 지금은 여기 값을
// 참고 기준으로 그대로 쓴다. myScore 계열 값은 실제로는 사용되지 않고(타입을 맞추기 위한 placeholder일
// 뿐), computeReport.ts가 자가진단 응답으로 다시 계산해서 덮어쓴다. 문항→항목/영역/난이도 매핑은
// reportMeta.ts에 있다. 실제 백엔드 연동 시에는 classAverage/stdDeviation/feedback 쪽을 API 응답으로
// 교체하면 된다.

export type StudentInfo = { 
  name: string;
  className: string;
  round: number;
};

export type ScoreSummary = {
  myTotal: number;
  classAverage: number;
  stdDeviation: number;
  maxScore: number;
};

export type DomainScore = {
  key: string;
  label: string;
  myScore: number;
  maxScore: number;
};

export type DifficultyLevel = '하' | '중하' | '중' | '중상' | '상';

export type DifficultyScore = {
  level: DifficultyLevel;
  myScore: number;
  classAverage: number;
};

export type PartScore = {
  id: number;
  title: string;
  questionCount: number;
  myScore: number;
  classAverage: number;
};

export type PartFeedback = {
  id: number;
  comment: string;
  actionPlan: string;
};

export type ReportData = {
  student: StudentInfo;
  summary: ScoreSummary;
  domains: DomainScore[];
  difficulty: DifficultyScore[];
  parts: PartScore[];
  feedback: PartFeedback[];
};

export const mockBasicReport: ReportData = {
  student: {
    name: '이윤재',
    className: '과외반',
    round: 1,
  },

  summary: {
    myTotal: 82,
    classAverage: 75.2,
    stdDeviation: 12.4,
    maxScore: 100,
  },

  domains: [
    { key: 'device-os', label: '기기 및 OS', myScore: 8, maxScore: 10 },
    { key: 'input-edit', label: '입력 및 편집', myScore: 9, maxScore: 10 },
    { key: 'file-manage', label: '파일 관리', myScore: 6, maxScore: 10 },
    { key: 'internet', label: '인터넷 활용', myScore: 7, maxScore: 10 },
    { key: 'security', label: '보안 및 문제 해결', myScore: 4, maxScore: 10 },
  ],

  // classAverage(반 평균 벤치마크)만 의미 있는 값이고, myScore는 computeReport.ts가 실제 응답으로
  // 덮어쓴다. 문항→난이도 매핑은 reportMeta.ts의 DIFFICULTY_QUESTION_IDS 참고.
  difficulty: [
    { level: '하', myScore: 100, classAverage: 92 },
    { level: '중하', myScore: 91, classAverage: 85 },
    { level: '중', myScore: 81, classAverage: 78 },
    { level: '중상', myScore: 69, classAverage: 72 },
    { level: '상', myScore: 40, classAverage: 58 },
  ],

  parts: [
    { id: 1, title: 'Part 1. 하드웨어와 전원', questionCount: 10, myScore: 10, classAverage: 9.2 },
    { id: 2, title: 'Part 2. 화면과 창 다루기', questionCount: 10, myScore: 8, classAverage: 8.5 },
    { id: 3, title: 'Part 3. 키보드와 타자', questionCount: 10, myScore: 9, classAverage: 8.8 },
    { id: 4, title: 'Part 4. 단축키와 편집', questionCount: 10, myScore: 9, classAverage: 7.5 },
    { id: 5, title: 'Part 5. 파일과 폴더 정리', questionCount: 10, myScore: 6, classAverage: 7.8 },
    { id: 6, title: 'Part 6. 인터넷 브라우저', questionCount: 10, myScore: 8, classAverage: 8.1 },
    { id: 7, title: 'Part 7. 정보 검색', questionCount: 10, myScore: 7, classAverage: 7.9 },
    { id: 8, title: 'Part 8. 문서 작성/미디어', questionCount: 10, myScore: 9, classAverage: 8.2 },
    { id: 9, title: 'Part 9. 보안과 계정', questionCount: 10, myScore: 6, classAverage: 8.0 },
    { id: 10, title: 'Part 10. 문제 해결/응용', questionCount: 10, myScore: 4, classAverage: 6.5 },
  ],

  feedback: [
    {
      id: 1,
      comment:
        '아직 노트북의 물리적인 구조와 조금 어색한 사이군요! 전원을 켜고 끄는 올바른 방법과 터치패드 조작법만 한 번 익혀두면 컴퓨터 사용이 훨씬 편해질 거예요.',
      actionPlan: '마우스 없이 터치패드만으로 인터넷 기사 스크롤해 보기',
    },
    {
      id: 2,
      comment:
        '모니터 화면은 내 방 책상과 같아요! 책상을 넓게 쓰려면 열려 있는 창의 크기를 조절하고 숨기는 방법을 알아야 해요. 작업 표시줄과 바탕화면의 역할을 다시 한번 확인해 볼까요?',
      actionPlan: '인터넷 창 2개를 화면 양옆에 나란히 절반씩 띄워보는 연습하기',
    },
    {
      id: 3,
      comment:
        '독수리 타법은 이제 그만! 키보드의 양옆에 있는 Shift 키나 Enter, 스페이스바의 위치를 손가락이 기억하게 만들어주세요. 타자 속도가 곧 과제 속도랍니다.',
      actionPlan: '한컴 타자연습이나 타자 게임으로 양손 타자 10분 연습하기',
    },
    {
      id: 4,
      comment:
        '마우스 오른쪽 버튼을 눌러서 복사를 누르고 있나요? 마법의 단축키 Ctrl+C, Ctrl+V 그리고 실수했을 때 되돌리는 Ctrl+Z만 외워도 수행평가 시간이 절반으로 줄어들 거예요!',
      actionPlan: '마우스 없이 단축키만 써서 좋아하는 노래 가사 복사하고 메모장에 붙여넣기',
    },
    {
      id: 5,
      comment:
        '다운로드 받은 파일이 어디 갔는지 찾느라 고생한 적 있지 않나요? 내 컴퓨터 안에 과목별로 예쁜 폴더(서랍장)를 만들고 파일을 정리하는 습관이 꼭 필요해요.',
      actionPlan: "바탕화면에 '1학년 과제 모음' 폴더 만들고 사진 파일 넣어보기",
    },
    {
      id: 6,
      comment:
        "인터넷의 바다를 더 넓게 항해할 준비가 필요해요. 창을 여러 개 열 때마다 새로 인터넷을 켜지 말고, 브라우저 위쪽의 '새 탭(➕)'을 활용하면 훨씬 깔끔하게 정보를 찾을 수 있어요.",
      actionPlan: "자주 가는 학교 홈페이지나 유튜브를 '즐겨찾기(북마크)'에 추가해 보기",
    },
    {
      id: 7,
      comment:
        '검색창에 질문을 길게 치는 것보다, 핵심 단어(키워드)만 뽑아서 검색하는 연습이 필요해요! 긴 글에서 내가 원하는 단어만 빠르게 찾는 Ctrl+F 기능도 꼭 사용해 보세요.',
      actionPlan: 'Ctrl+F로 인터넷 기사에서 특정 단어가 몇 개 있는지 찾아보기',
    },
    {
      id: 8,
      comment:
        '단순히 글을 읽고 영상을 보는 것을 넘어, 이제 내가 직접 파일을 저장하고 전달해야 할 때입니다! 과제 파일을 만들 때 파일 이름을 깔끔하게 저장하고, 이메일에 첨부하는 방법을 배워보세요.',
      actionPlan: "메모장에 글을 쓰고 '내이름_테스트'로 저장한 뒤, 내 이메일로 첨부 파일 보내보기",
    },
    {
      id: 9,
      comment:
        '🚨 삐빅! 보안 경보 발령! 인터넷은 편리하지만 위험도 숨어있어요. 공공장소에서 로그아웃하는 습관, 이상한 링크를 누르지 않는 주의력이 나의 소중한 개인정보를 지켜줍니다.',
      actionPlan: '내가 쓰는 비밀번호가 너무 단순하지 않은지 확인하고, 2단계 인증 설정해 보기',
    },
    {
      id: 10,
      comment:
        '컴퓨터가 갑자기 멈추면 당황스럽죠? 훌륭한 컴퓨터 사용자는 문제가 생겼을 때 스스로 원인을 검색해 보고 해결책을 시도(트러블슈팅)할 줄 알아야 해요. 작업 관리자를 켜는 법부터 익혀볼까요?',
      actionPlan: '키보드에서 Ctrl + Alt + Delete를 눌러 작업 관리자 화면 구경하고 조심히 닫아보기',
    },
  ],
};

// 심화(크리에이터 단계) 트랙 — 4개 대분류 Part(생산성 도구 / 코딩·컴퓨팅 사고력 / AI·디지털 리터러시 / 하드웨어·OS)를
// 피드백 목적으로는 8개 세부 카테고리로 더 잘게 쪼갠다. src/testData.ts의 advanced 문항에 태그된 소제목(group)과
// 1:1로 대응하며, 실제 문항 id 범위는 reportMeta.ts의 PART_QUESTION_IDS.advanced에 있다 — 괄호 안 숫자는
// 해당 카테고리의 문항 수(총 100문항):
//   1. 한글/워드 문서 작성(7) → 문서 기획력 (한글/워드)
//   2. 파워포인트(PPT) 발표 준비(8) → 시각화 및 발표 (PPT)
//   3. 엑셀/스프레드시트 데이터 다루기(10) → 데이터 처리 (엑셀/스프레드시트)
//   4. 알고리즘과 논리(5) + 블록 코딩(8) → 알고리즘과 블록 코딩 (13)
//   5. 텍스트 코딩 입문: 파이썬 등(12) → 텍스트 코딩 입문 (파이썬 등)
//   6. AI 도구 활용(7) → AI 스마트 활용
//   7. 저작권과 정보 윤리(6) + 디지털 정보 판별 및 보안(12) → 디지털 리터러시와 저작권 (18)
//   8. 하드웨어 스펙 이해(9) + OS 심화 관리(9) + 네트워크와 문제 해결(7) → 하드웨어와 OS 트러블슈팅 (25)
export const mockAdvancedReport: ReportData = {
  student: mockBasicReport.student,

  summary: {
    myTotal: 70,
    classAverage: 74,
    stdDeviation: 15.1,
    maxScore: 100,
  },

  domains: [
    { key: 'productivity', label: '생산성 도구 마스터', myScore: 8, maxScore: 10 },
    { key: 'coding', label: '코딩과 논리적 사고', myScore: 7, maxScore: 10 },
    { key: 'ai-literacy', label: 'AI 및 디지털 리터러시', myScore: 7, maxScore: 10 },
    { key: 'hardware-os', label: '하드웨어와 OS 심화 이해', myScore: 6, maxScore: 10 },
  ],

  // classAverage(반 평균 벤치마크)만 의미 있는 값이고, myScore는 computeReport.ts가 실제 응답으로
  // 덮어쓴다. 문항→난이도 매핑은 reportMeta.ts의 DIFFICULTY_QUESTION_IDS 참고 — '상' 구간에 AI
  // 활용·저작권·하드웨어 트러블슈팅 문항이 몰려 있어 이 두 카테고리가 약점으로 잡히기 쉬운 구조다.
  difficulty: [
    { level: '하', myScore: 95, classAverage: 90 },
    { level: '중하', myScore: 88, classAverage: 84 },
    { level: '중', myScore: 80, classAverage: 76 },
    { level: '중상', myScore: 68, classAverage: 70 },
    { level: '상', myScore: 50, classAverage: 60 },
  ],

  parts: [
    { id: 1, title: '문서 기획력 (한글/워드)', questionCount: 7, myScore: 6, classAverage: 5.8 },
    { id: 2, title: '시각화 및 발표 (PPT)', questionCount: 8, myScore: 7, classAverage: 6.5 },
    { id: 3, title: '데이터 처리 (엑셀/스프레드시트)', questionCount: 10, myScore: 8, classAverage: 7.2 },
    { id: 4, title: '알고리즘과 블록 코딩 (스크래치 등)', questionCount: 13, myScore: 11, classAverage: 9.5 },
    { id: 5, title: '텍스트 코딩 입문 (파이썬 등)', questionCount: 12, myScore: 7, classAverage: 8.0 },
    { id: 6, title: 'AI 스마트 활용', questionCount: 7, myScore: 5, classAverage: 5.5 },
    { id: 7, title: '디지털 리터러시와 저작권', questionCount: 18, myScore: 12, classAverage: 13.5 },
    { id: 8, title: '하드웨어와 OS 트러블슈팅', questionCount: 25, myScore: 14, classAverage: 18.0 },
  ],

  feedback: [
    {
      id: 1,
      comment:
        "글씨만 빼곡한 보고서는 읽기 힘들어요! 줄 간격과 여백을 조절하고, 표를 활용해 내용을 깔끔하게 정리하는 '편집의 기술'을 익히면 수행평가 점수가 훌쩍 뛸 거예요.",
      actionPlan: '인터넷에서 찾은 긴 글을 워드에 붙여넣고, 제목 크기 키우기 & 중요한 단어 굵게 표시해 보기',
    },
    {
      id: 2,
      comment:
        '멋진 아이디어를 사람들에게 보여줄 차례예요. 도형을 깔끔하게 정렬하고, 너무 화려한 애니메이션보다는 시선을 끄는 이미지 위주로 슬라이드를 구성하는 연습이 필요해요.',
      actionPlan: '무료 PPT 템플릿을 다운로드해서, 내 관심사를 주제로 3장짜리 자기소개 슬라이드 만들어보기',
    },
    {
      id: 3,
      comment:
        '계산기를 직접 두드리고 있나요? 엑셀의 함수(SUM, AVERAGE)와 필터 기능만 알아도 수십 명의 데이터를 1초 만에 정리할 수 있어요. 데이터 마법사가 되어보세요!',
      actionPlan: '구글 스프레드시트에 우리 반 친구들 5명의 가상 수학/영어 점수를 적고 평균 함수 써보기',
    },
    {
      id: 4,
      comment:
        "컴퓨터에게 명령을 내리려면 '순서'와 '조건'이 중요해요. 스크래치 같은 블록 코딩을 통해 '만약 ~라면'이라는 논리적인 규칙을 레고 조립하듯 만들어보세요.",
      actionPlan: '스크래치(Scratch) 사이트에 들어가서 고양이가 키보드 방향키대로 움직이게 블록 조립해 보기',
    },
    {
      id: 5,
      comment:
        '진짜 개발자들이 쓰는 언어에 도전할 준비가 되었나요? 에러 메시지가 떠도 당황하지 마세요. 에러는 컴퓨터가 나에게 보내는 힌트랍니다. 영어로 된 명령어를 조금씩 읽어보는 연습을 해봐요.',
      actionPlan: '파이썬 온라인 컴파일러에서 print("Hello World")를 직접 타이핑하고 실행해 보기',
    },
    {
      id: 6,
      comment:
        "인공지능은 똑똑한 비서지만, 가끔 거짓말(환각)도 해요! AI에게 숙제를 다 맡기지 말고, 내 아이디어를 구체화하기 위해 '질문(프롬프트)'을 뾰족하게 다듬는 연습을 해보세요.",
      actionPlan: '챗GPT에게 "중학생이 읽기 좋은 SF 소설 3개만 이유와 함께 추천해 줘"라고 구체적으로 질문해 보기',
    },
    {
      id: 7,
      comment:
        '인터넷에 있는 정보와 사진이 모두 공짜는 아니에요. 올바른 출처를 남기고, 가짜 뉴스에 낚이지 않도록 여러 정보를 비교(교차 검증)하는 날카로운 눈을 길러야 합니다.',
      actionPlan: "과제에 쓸 이미지를 찾을 때 구글 대신 '픽사베이(Pixabay)' 같은 무료 상업용 이미지 사이트 이용해 보기",
    },
    {
      id: 8,
      comment:
        '내 노트북의 주치의는 바로 나! 컴퓨터가 왜 느려졌는지(CPU, RAM 부족), 인터넷이 왜 끊겼는지 작업 관리자와 설정 창을 열어 스스로 진단하는 방법을 배워보세요.',
      actionPlan: 'Ctrl + Shift + Esc를 눌러 작업 관리자를 열고, 지금 내 컴퓨터의 메모리(RAM)를 가장 많이 잡아먹는 프로그램 찾아보기',
    },
  ],
};
