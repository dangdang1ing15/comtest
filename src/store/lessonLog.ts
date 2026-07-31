// 과외 수업별 "수업현황" 로그. lessonLogs 컬렉션에 세션 1건 = 문서 1개로 저장하고,
// 실시간 구독(onSnapshot)해서 누가 어디서 기록하든 모든 클라이언트에 즉시 반영한다.
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export type HomeworkCheck = {
  done: boolean;
  note: string;
};

export type LessonLogInput = {
  date: string; // YYYY-MM-DD
  homework1: HomeworkCheck;
  homework2: HomeworkCheck;
  typingSpeed: number | null; // 타/분
  typingMinutes: number | null; // 소요 시간(분)
  reviewContent: string; // 복습했던 내용
  todayContent: string; // 오늘 나갔던 내용
  nextContent: string; // 숙제 / 다음 시간에 나갈 것
};

export type LessonLog = LessonLogInput & {
  id: string;
  createdAt: Timestamp | null;
};

const COLLECTION_REF = collection(db, 'lessonLogs');

export function useLessonLogs() {
  const [logs, setLogs] = useState<LessonLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      COLLECTION_REF,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as LessonLogInput & { createdAt: Timestamp | null }) }));
        next.sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? 1 : -1;
          const at = a.createdAt?.toMillis() ?? 0;
          const bt = b.createdAt?.toMillis() ?? 0;
          return bt - at;
        });
        setLogs(next);
        setLoaded(true);
      },
      (err) => console.error('수업현황 동기화 실패', err),
    );
    return unsubscribe;
  }, []);

  const addLog = (input: LessonLogInput) => addDoc(COLLECTION_REF, { ...input, createdAt: serverTimestamp() });

  const updateLog = (id: string, input: LessonLogInput) => updateDoc(doc(db, 'lessonLogs', id), { ...input });

  const deleteLog = (id: string) => deleteDoc(doc(db, 'lessonLogs', id));

  return { logs, loaded, addLog, updateLog, deleteLog };
}

export function emptyLessonInput(): LessonLogInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    homework1: { done: false, note: '' },
    homework2: { done: false, note: '' },
    typingSpeed: null,
    typingMinutes: null,
    reviewContent: '',
    todayContent: '',
    nextContent: '',
  };
}
