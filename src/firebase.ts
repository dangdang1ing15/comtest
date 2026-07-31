import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 이 apiKey는 Firebase 웹 앱의 공개 식별자이지, 비밀 값이 아니다(문서 참고:
// https://firebase.google.com/docs/projects/api-keys). 실제 접근 제어는
// firestore.rules에서 담당한다.
const firebaseConfig = {
  projectId: 'comtest-quiz',
  appId: '1:827183147440:web:465391d6db2ec882708e75',
  storageBucket: 'comtest-quiz.firebasestorage.app',
  apiKey: 'AIzaSyC-Ru3vb4LttShj03WeQbTKtGS3OKZ7ndQ',
  authDomain: 'comtest-quiz.firebaseapp.com',
  messagingSenderId: '827183147440',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
