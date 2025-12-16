/**
 * firebase-config.js
 * Firebase 초기화 및 설정 (NPM 모듈 방식)
 *
 * 사용 전 Firebase 프로젝트 설정 필요:
 * 1. Firebase Console (https://console.firebase.google.com/)에서 프로젝트 생성
 * 2. 프로젝트 설정 > 일반 > 웹 앱 추가
 * 3. Firebase SDK 구성 객체를 아래 firebaseConfig에 복사
 * 4. Firestore Database 활성화 (테스트 모드로 시작)
 */

// Firebase NPM 모듈 import
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

// Firebase 구성 객체 (Firebase Console에서 복사)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase 초기화 완료');
console.log('✅ Firestore 연결 완료');

/**
 * Firestore 인스턴스를 반환합니다
 */
function getFirestoreInstance() {
    return db;
}

/**
 * Firebase 사용 가능 여부를 확인합니다
 */
function isFirebaseAvailable() {
    return db !== null;
}

// Firestore 함수들 export
export {
    db,
    getFirestoreInstance,
    isFirebaseAvailable,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
};

// 전역 객체로도 내보내기 (기존 코드 호환성)
if (typeof window !== 'undefined') {
    window.getFirestore = getFirestoreInstance;
    window.isFirebaseAvailable = isFirebaseAvailable;

    // Firestore 함수들을 전역으로 내보내기
    window.firestoreLib = {
        collection: (db, collectionName) => collection(db, collectionName),
        doc: (db, collectionName, docId) => doc(db, collectionName, docId),
        getDoc: (docRef) => getDoc(docRef),
        getDocs: (queryOrCollection) => getDocs(queryOrCollection),
        setDoc: (docRef, data) => setDoc(docRef, data),
        updateDoc: (docRef, data) => updateDoc(docRef, data),
        deleteDoc: (docRef) => deleteDoc(docRef),
        query: (collectionRef, ...queryConstraints) => query(collectionRef, ...queryConstraints),
        where: (field, operator, value) => where(field, operator, value),
        orderBy: (field, direction = 'asc') => orderBy(field, direction),
        serverTimestamp: () => serverTimestamp()
    };
}
