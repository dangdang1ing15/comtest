// 실제 자가진단 응답으로부터 성적표를 계산하기 위한 구조적 메타데이터.
// (문항 텍스트 자체는 src/testData.ts가, 벤치마크 점수/피드백 문구는 mockData.ts가 담당한다.)
import { testData, type Level } from '../testData';
import type { DifficultyLevel } from './mockData';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const shift = (ids: number[], by: number) => ids.map((id) => id + by);

// 각 레벨의 "세부 항목(Part)" id(1부터 시작, mockData.ts의 PartScore.id와 대응) → 문항 id 목록.
export const PART_QUESTION_IDS: Record<Level, number[][]> = {
  // 베이직은 testData.basic의 Part 1~10과 1:1로 대응한다.
  basic: testData.basic.map((part) => part.questions.map((q) => q.id)),
  // 어드밴스는 성적표 피드백을 8개 세부 카테고리로 더 잘게 쪼갰기 때문에(테스트 자체는 4개 대분류 Part),
  // testData.advanced에 태그된 group 경계를 기준으로 문항 id 범위를 직접 명시한다.
  advanced: [
    range(101, 107), // 1. 문서 기획력 (한글/워드)
    range(108, 115), // 2. 시각화 및 발표 (PPT)
    range(116, 125), // 3. 데이터 처리 (엑셀/스프레드시트)
    range(126, 138), // 4. 알고리즘과 블록 코딩 (알고리즘과 논리 + 블록 코딩)
    range(139, 150), // 5. 텍스트 코딩 입문 (파이썬 등)
    range(151, 157), // 6. AI 스마트 활용
    range(158, 175), // 7. 디지털 리터러시와 저작권 (저작권과 정보 윤리 + 디지털 정보 판별 및 보안)
    range(176, 200), // 8. 하드웨어와 OS 트러블슈팅 (하드웨어 스펙 + OS 심화 관리 + 네트워크와 문제 해결)
  ],
};

// 영역(도메인) key → 그 영역을 구성하는 Part id 목록.
export const DOMAIN_PART_IDS: Record<Level, Record<string, number[]>> = {
  basic: {
    'device-os': [1, 2],
    'input-edit': [3, 4],
    'file-manage': [5, 8],
    internet: [6, 7],
    security: [9, 10],
  },
  advanced: {
    productivity: [1, 2, 3],
    coding: [4, 5],
    'ai-literacy': [6, 7],
    'hardware-os': [8],
  },
};

// 난이도별 문항 id 목록. 사용자가 제공한 "1~100번(레벨 자체 기준)" 분류표를 그대로 옮긴 것으로,
// 어드밴스는 내부 id 체계(101~200)에 맞춰 +100 시프트한다.
export const DIFFICULTY_QUESTION_IDS: Record<Level, Record<DifficultyLevel, number[]>> = {
  basic: {
    하: [1, 2, 8, 9, 11, 12, 13, 21, 22, 23, 24, 53],
    중하: [3, 4, 6, 7, 10, 14, 15, 18, 19, 20, 25, 28, 44, 51, 52, 54, 55, 61, 63, 71, 75, 76],
    중: [5, 16, 17, 26, 27, 29, 31, 32, 41, 42, 43, 45, 47, 56, 57, 58, 62, 65, 69, 70, 72, 73, 77, 78, 81, 83, 89],
    중상: [
      33, 34, 35, 36, 37, 38, 39, 40, 46, 48, 49, 50, 59, 60, 64, 66, 67, 68, 74, 79, 80, 82, 84, 86, 90, 95, 97, 98,
      99,
    ],
    상: [30, 85, 87, 88, 91, 92, 93, 94, 96, 100],
  },
  advanced: {
    하: shift([1, 8, 16, 26, 31, 33, 40, 51, 56, 58, 64, 76, 77, 78, 81, 85, 94, 97], 100),
    // 원본 분류표에 3번(→id 103, 머리글/바닥글)이 누락되어 있어, 같은 파트의 이웃 문항들과
    // 성격이 비슷한 '중하'(기본 기능 수행 및 규칙 이해)에 포함시켰다.
    중하: shift([2, 4, 12, 13, 17, 18, 27, 32, 34, 42, 52, 55, 59, 65, 79, 80, 82, 86, 95, 99, 3], 100),
    // 마찬가지로 9번(→id 109, 슬라이드 구성 감각)이 누락되어 있어, 응용력이 필요한 '중'
    // (다중 기능 응용 및 원리 파악)에 포함시켰다.
    중: shift([5, 6, 11, 14, 19, 20, 28, 35, 36, 44, 53, 60, 63, 67, 70, 83, 84, 87, 91, 98, 9], 100),
    중상: shift([7, 10, 21, 23, 24, 29, 37, 39, 41, 45, 48, 57, 61, 68, 73, 74, 88, 92, 93, 100], 100),
    상: shift([15, 22, 25, 30, 38, 43, 46, 47, 49, 50, 54, 62, 66, 69, 71, 72, 75, 89, 90, 96], 100),
  },
};
