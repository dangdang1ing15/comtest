// 모든 클라이언트가 같은 Firestore 문서(sharedState/main)를 구독/기록하는 공유 상태.
// 로그인이 없으므로 "누구든 수정하면 다른 모든 클라이언트에 반영된다"는 요구사항대로,
// 문서 하나를 전원이 함께 쓴다. 답변(answersByLevel)/복습 완료(reviewedByLevel) 둘 다
// 여기서 관리하고, App.tsx가 한 번만 구독해서 SurveyTest/ReportCard/WrongNote에 내려준다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { testData, type Answer, type Level } from '../testData';

const DOC_REF = doc(db, 'sharedState', 'main');

// 과외 학생이 베이직(기본) 100문항 중 실제로 틀린 문항 번호. 문서가 아직 없을 때(첫 배포)
// 이 값으로 시드를 채운다. 나머지는 전부 맞은 것으로 채점한다.
const STUDENT_WRONG_BASIC_IDS = new Set([
  7, 10, 12, 15, 16, 25, 28, 30, 33, 34, 35, 36, 44, 47, 48, 49, 50, 54, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 76,
  80, 81, 86, 88, 91, 92, 93, 94, 95, 96, 97, 98, 100,
]);

// Part 1~7까지는 복습을 마친 상태로 시드한다.
const REVIEWED_THROUGH_PART = 7;

function buildInitialAnswersByLevel(): Record<Level, Map<number, Answer>> {
  const basic = new Map<number, Answer>();
  for (const part of testData.basic) {
    for (const q of part.questions) {
      basic.set(q.id, STUDENT_WRONG_BASIC_IDS.has(q.id) ? 'no' : 'yes');
    }
  }
  return { basic, advanced: new Map() };
}

function buildInitialReviewedByLevel(basicAnswers: Map<number, Answer>): Record<Level, Set<number>> {
  const chapterIds = new Set(
    testData.basic.slice(0, REVIEWED_THROUGH_PART).flatMap((part) => part.questions.map((q) => q.id)),
  );
  const reviewed = new Set<number>();
  basicAnswers.forEach((value, id) => {
    if (value === 'no' && chapterIds.has(id)) reviewed.add(id);
  });
  return { basic: reviewed, advanced: new Set() };
}

type PersistedState = {
  answersByLevel: Record<Level, Record<string, Answer>>;
  reviewedByLevel: Record<Level, number[]>;
};

const mapToObj = (m: Map<number, Answer>): Record<string, Answer> =>
  Object.fromEntries([...m.entries()].map(([id, v]) => [String(id), v]));

const setToArr = (s: Set<number>): number[] => [...s].sort((a, b) => a - b);

const objToMap = (o: Record<string, Answer> | undefined): Map<number, Answer> =>
  new Map(Object.entries(o ?? {}).map(([id, v]) => [Number(id), v]));

const arrToSet = (a: number[] | undefined): Set<number> => new Set(a ?? []);

function toPersisted(
  answersByLevel: Record<Level, Map<number, Answer>>,
  reviewedByLevel: Record<Level, Set<number>>,
): PersistedState {
  return {
    answersByLevel: { basic: mapToObj(answersByLevel.basic), advanced: mapToObj(answersByLevel.advanced) },
    reviewedByLevel: { basic: setToArr(reviewedByLevel.basic), advanced: setToArr(reviewedByLevel.advanced) },
  };
}

function fromPersisted(data: Partial<PersistedState>) {
  return {
    answersByLevel: {
      basic: objToMap(data.answersByLevel?.basic),
      advanced: objToMap(data.answersByLevel?.advanced),
    } as Record<Level, Map<number, Answer>>,
    reviewedByLevel: {
      basic: arrToSet(data.reviewedByLevel?.basic),
      advanced: arrToSet(data.reviewedByLevel?.advanced),
    } as Record<Level, Set<number>>,
  };
}

export function useSharedState() {
  const initial = useRef(buildInitialAnswersByLevel());
  const [answersByLevel, setAnswersByLevel] = useState<Record<Level, Map<number, Answer>>>(initial.current);
  const [reviewedByLevel, setReviewedByLevel] = useState<Record<Level, Set<number>>>(() =>
    buildInitialReviewedByLevel(initial.current.basic),
  );
  const [synced, setSynced] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      DOC_REF,
      (snap) => {
        if (!snap.exists()) {
          if (!seededRef.current) {
            seededRef.current = true;
            const seedAnswers = buildInitialAnswersByLevel();
            const seedReviewed = buildInitialReviewedByLevel(seedAnswers.basic);
            setDoc(DOC_REF, toPersisted(seedAnswers, seedReviewed)).catch((err) =>
              console.error('공유 데이터 초기화 실패', err),
            );
          }
          return;
        }
        const { answersByLevel: a, reviewedByLevel: r } = fromPersisted(snap.data() as Partial<PersistedState>);
        setAnswersByLevel(a);
        setReviewedByLevel(r);
        setSynced(true);
      },
      (err) => console.error('공유 데이터 동기화 실패', err),
    );
    return unsubscribe;
  }, []);

  const updateAnswers = useCallback((level: Level, next: Map<number, Answer>) => {
    setDoc(DOC_REF, { answersByLevel: { [level]: mapToObj(next) } }, { merge: true }).catch((err) =>
      console.error('답변 저장 실패', err),
    );
  }, []);

  const updateReviewed = useCallback((level: Level, next: Set<number>) => {
    setDoc(DOC_REF, { reviewedByLevel: { [level]: setToArr(next) } }, { merge: true }).catch((err) =>
      console.error('복습 상태 저장 실패', err),
    );
  }, []);

  return { answersByLevel, reviewedByLevel, updateAnswers, updateReviewed, synced };
}
