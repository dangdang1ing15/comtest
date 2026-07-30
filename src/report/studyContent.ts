// 오답노트 학습 콘텐츠. questionId(문제 번호)별로 여러 개의 page를 가질 수 있고,
// 오답노트에서 문항을 클릭하면 이 page들을 옆으로 넘겨가며(캐러셀) 학습한다.
//
// type이 'explanation'이면 content(설명내용) + image(설명 이미지, 선택)를 쓰고,
// type이 'quiz'이면 quizQuestion(문제) + choices(보기) + answer(답, choices 중 하나와 동일한 문자열)를 쓴다.
//
// 실제 콘텐츠는 이 배열에 채워 넣으면 된다 — 특정 questionId에 항목이 없으면
// 오답노트 팝업은 기존처럼 파트 단위 복습 코멘트만 보여준다.
export type StudyPageType = 'explanation' | 'quiz';

export type StudyPage = {
  questionId: number; // 문제 번호
  page: number; // 페이지 번호 (같은 questionId 안에서 1부터)
  type: StudyPageType; // 유형: 설명 | 퀴즈
  content?: string; // 설명내용 (type === 'explanation')
  image?: string; // 설명 이미지 (선택)
  quizQuestion?: string; // 문제 (type === 'quiz')
  choices?: string[]; // 보기 (type === 'quiz')
  answer?: string; // 답 — choices 중 하나와 동일한 문자열 (type === 'quiz')
};

export const studyContent: StudyPage[] = [
  // ==========================================
  // [Question ID: 7] 노트북 절전 모드의 이해
  // ==========================================
  {
    questionId: 7,
    page: 1,
    type: 'explanation',
    content:
      "노트북 덮개를 닫으면 컴퓨터는 '절전 모드(Sleep Mode)'라는 상태에 들어갑니다. 사람이 잠깐 낮잠을 자는 것과 비슷해요! 뇌(CPU)는 쉬고 있지만, 방금까지 하던 작업(열어둔 인터넷 창이나 문서)은 기억하고 있어서 덮개를 다시 열면 1~2초 만에 원래 화면으로 돌아옵니다.",
  },
  {
    questionId: 7,
    page: 2,
    type: 'explanation',
    content:
      "주의할 점도 있어요! 절전 모드는 전원이 완전히 꺼진 게 아니라서 대기하는 동안 배터리가 아주 조금씩 닳습니다. 며칠 동안 노트북을 안 쓸 거라면 덮개만 닫지 말고, 꼭 화면 안에서 '시스템 종료'를 눌러서 전원을 꺼주는 게 배터리 건강에 좋아요.",
  },
  {
    questionId: 7,
    page: 3,
    type: 'quiz',
    quizQuestion: '수업이 끝나고 노트북 덮개를 닫은 채로 가방에 넣었습니다. 이때 노트북의 상태로 가장 알맞은 것은 무엇일까요?',
    choices: [
      '전원이 완전히 꺼져서 작업하던 내용이 다 날아갔다.',
      '화면만 꺼지고 하던 작업을 기억하는 절전 모드가 되었다.',
      '배터리가 전혀 닳지 않는 상태가 되었다.',
      '노트북이 계속 켜져 있어서 화면이 뜨거워진다.',
    ],
    answer: '화면만 꺼지고 하던 작업을 기억하는 절전 모드가 되었다.',
  },

  // ==========================================
  // [Question ID: 10] 터치패드와 제스처 활용
  // ==========================================
  {
    questionId: 10,
    page: 1,
    type: 'explanation',
    content:
      "노트북 키보드 아래에 있는 넓은 판을 '터치패드'라고 부릅니다. 마우스가 없을 때 아주 유용한데요, 이 터치패드에는 손가락 개수에 따라 다르게 반응하는 똑똑한 '제스처' 기능이 숨어있답니다.",
  },
  {
    questionId: 10,
    page: 2,
    type: 'explanation',
    content:
      "가장 많이 쓰는 마법의 제스처 두 가지를 알려드릴게요!\n\n1. 마우스 휠(스크롤): 두 손가락을 살짝 벌려 터치패드에 대고 위아래로 쓸어내려 보세요. 화면이 부드럽게 오르락내리락합니다.\n2. 오른쪽 클릭: 두 손가락으로 터치패드를 동시에 가볍게 '톡' 쳐보세요. 마우스 우클릭을 했을 때처럼 숨겨진 메뉴가 나타납니다.",
  },
  {
    questionId: 10,
    page: 3,
    type: 'quiz',
    quizQuestion: '인터넷 기사를 읽다가 화면을 아래로 내리고 싶습니다. 마우스가 없을 때 터치패드로 스크롤하는 가장 올바른 방법은 무엇인가요?',
    choices: [
      '한 손가락을 꾹 누른 채로 아래로 끌어내린다.',
      '두 손가락을 터치패드에 올리고 위아래로 부드럽게 움직인다.',
      '세 손가락으로 터치패드를 동시에 톡톡 친다.',
      '터치패드의 오른쪽 끝부분을 주먹으로 살짝 쥔다.',
    ],
    answer: '두 손가락을 터치패드에 올리고 위아래로 부드럽게 움직인다.',
  },
];

export function getStudyPages(questionId: number): StudyPage[] {
  return studyContent.filter((p) => p.questionId === questionId).sort((a, b) => a.page - b.page);
}
