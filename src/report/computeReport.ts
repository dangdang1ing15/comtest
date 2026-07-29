import type { Answer, Level } from '../testData';
import { mockBasicReport, mockAdvancedReport, type ReportData } from './mockData';
import { PART_QUESTION_IDS, DOMAIN_PART_IDS, DIFFICULTY_QUESTION_IDS } from './reportMeta';

const TEMPLATE: Record<Level, ReportData> = {
  basic: mockBasicReport,
  advanced: mockAdvancedReport,
};

function totalQuestions(level: Level): number {
  return PART_QUESTION_IDS[level].reduce((sum, ids) => sum + ids.length, 0);
}

function countYes(ids: number[], answers: Map<number, Answer>): number {
  let n = 0;
  for (const id of ids) {
    if (answers.get(id) === 'yes') n++;
  }
  return n;
}

export function isLevelComplete(level: Level, answers: Map<number, Answer>): boolean {
  const total = totalQuestions(level);
  return total > 0 && answers.size === total;
}

export function answeredCount(level: Level, answers: Map<number, Answer>): { answered: number; total: number } {
  return { answered: answers.size, total: totalQuestions(level) };
}

// mockData.ts의 템플릿(전체 평균/표준편차/피드백 문구 등 벤치마크 값)은 그대로 두고,
// myScore 계열 필드만 실제 응답으로 다시 계산해서 덮어쓴다.
export function computeLiveReport(level: Level, answers: Map<number, Answer>): ReportData {
  const template = TEMPLATE[level];
  const partIdLists = PART_QUESTION_IDS[level];

  const parts = template.parts.map((p, i) => {
    const ids = partIdLists[i] ?? [];
    return { ...p, myScore: countYes(ids, answers) };
  });

  const myTotal = parts.reduce((sum, p) => sum + p.myScore, 0);

  const domains = template.domains.map((d) => {
    const partIds = DOMAIN_PART_IDS[level][d.key] ?? [];
    const ids = partIds.flatMap((partId) => partIdLists[partId - 1] ?? []);
    const myScore = ids.length > 0 ? Math.round((countYes(ids, answers) / ids.length) * d.maxScore) : 0;
    return { ...d, myScore };
  });

  const difficulty = template.difficulty.map((tier) => {
    const ids = DIFFICULTY_QUESTION_IDS[level][tier.level] ?? [];
    const myScore = ids.length > 0 ? Math.round((countYes(ids, answers) / ids.length) * 100) : 0;
    return { ...tier, myScore };
  });

  return {
    ...template,
    summary: { ...template.summary, myTotal },
    domains,
    difficulty,
    parts,
  };
}
