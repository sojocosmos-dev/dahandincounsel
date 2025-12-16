/**
 * StudentSubmissionService.js
 * 학생 제출 데이터 저장/로드 서비스
 *
 * Firestore 연동 완료
 */

class StudentSubmissionService {
    static COLLECTION_NAME = 'submissions';
    static STORAGE_KEY = 'studentSubmissions'; // 폴백용 로컬 스토리지 키

    /**
     * 제출 데이터를 저장합니다
     */
    static async saveSubmission(submissionData, apiKey = null) {
        try {
            if (!submissionData.studentCode || !submissionData.counselId) {
                throw new Error('학생 코드와 상담 ID가 필요합니다.');
            }

            const submissionId = submissionData.id || this.generateId();

            // Firestore 사용 가능 시 직접 저장
            if (isFirebaseAvailable()) {
                const db = getFirestore();
                const { collection, query, where, getDocs, doc, setDoc, serverTimestamp } = window.firestoreLib;

                // 기존 제출 데이터 확인
                const submissionsRef = collection(db, this.COLLECTION_NAME);
                const q = query(
                    submissionsRef,
                    where('studentCode', '==', submissionData.studentCode),
                    where('counselId', '==', submissionData.counselId)
                );
                const querySnapshot = await getDocs(q);

                let existingDocId = null;
                if (!querySnapshot.empty) {
                    existingDocId = querySnapshot.docs[0].id;
                }

                const submissionDoc = {
                    studentCode: submissionData.studentCode,
                    counselId: submissionData.counselId,
                    data: submissionData.data,
                    submittedAt: submissionData.submittedAt || serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                // 기존 문서가 있으면 업데이트, 없으면 생성
                const docId = existingDocId || submissionId;
                const docRef = doc(db, this.COLLECTION_NAME, docId);
                await setDoc(docRef, submissionDoc, { merge: true });

                const newSubmission = {
                    id: docId,
                    studentCode: submissionData.studentCode,
                    counselId: submissionData.counselId,
                    data: submissionData.data,
                    submittedAt: submissionData.submittedAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                console.log('✅ Firestore에 제출 데이터 저장 완료:', { id: newSubmission.id });
                return {
                    success: true,
                    submission: newSubmission,
                    message: '제출 데이터가 저장되었습니다.'
                };
            } else {
                // Firestore 사용 불가 시 로컬 스토리지 사용
                console.warn('⚠️ Firestore 사용 불가, 로컬 스토리지로 저장합니다.');
                return await this._saveToLocalStorage(submissionData);
            }
        } catch (error) {
            console.error('제출 저장 오류:', error);
            // 에러 발생 시 로컬 스토리지로 폴백
            try {
                return await this._saveToLocalStorage(submissionData);
            } catch (fallbackError) {
                return {
                    success: false,
                    message: '저장 실패: ' + error.message
                };
            }
        }
    }

    /**
     * 모든 제출 데이터를 불러옵니다
     */
    static async loadAllSubmissions(apiKey = null) {
        try {
            if (isFirebaseAvailable()) {
                const db = getFirestore();
                const { collection, getDocs } = window.firestoreLib;

                const submissionsRef = collection(db, this.COLLECTION_NAME);
                const querySnapshot = await getDocs(submissionsRef);

                const submissions = [];
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    submissions.push({
                        id: docSnap.id,
                        studentCode: data.studentCode,
                        counselId: data.counselId,
                        data: data.data,
                        submittedAt: data.submittedAt?.toDate().toISOString(),
                        updatedAt: data.updatedAt?.toDate().toISOString()
                    });
                });

                console.log('✅ Firestore에서 제출 데이터 로드 완료:', { count: submissions.length });
                return submissions;
            } else {
                console.warn('⚠️ Firestore 사용 불가, 로컬 스토리지에서 로드합니다.');
                const savedData = localStorage.getItem(this.STORAGE_KEY);
                return savedData ? JSON.parse(savedData) : [];
            }
        } catch (error) {
            console.error('제출 데이터 로드 오류:', error);
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : [];
        }
    }

    /**
     * 특정 상담의 제출 데이터를 조회합니다
     */
    static async getSubmissionsByCounselId(counselId, apiKey = null) {
        try {
            if (isFirebaseAvailable()) {
                const db = getFirestore();
                const { collection, query, where, getDocs } = window.firestoreLib;

                const submissionsRef = collection(db, this.COLLECTION_NAME);
                const q = query(submissionsRef, where('counselId', '==', counselId));
                const querySnapshot = await getDocs(q);

                const submissions = [];
                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    submissions.push({
                        id: docSnap.id,
                        studentCode: data.studentCode,
                        counselId: data.counselId,
                        data: data.data,
                        submittedAt: data.submittedAt?.toDate().toISOString(),
                        updatedAt: data.updatedAt?.toDate().toISOString()
                    });
                });

                console.log('✅ Firestore에서 상담별 제출 데이터 조회 완료:', { counselId, count: submissions.length });
                return submissions;
            } else {
                const submissions = await this.loadAllSubmissions(apiKey);
                return submissions.filter(s => s.counselId === counselId);
            }
        } catch (error) {
            console.error('상담별 제출 조회 오류:', error);
            return [];
        }
    }

    /**
     * 특정 학생의 특정 상담 제출 데이터를 조회합니다
     */
    static async getSubmission(studentCode, counselId) {
        try {
            if (isFirebaseAvailable()) {
                const db = getFirestore();
                const { collection, query, where, getDocs } = window.firestoreLib;

                const submissionsRef = collection(db, this.COLLECTION_NAME);
                const q = query(
                    submissionsRef,
                    where('studentCode', '==', studentCode),
                    where('counselId', '==', counselId)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return null;
                }

                const docSnap = querySnapshot.docs[0];
                const data = docSnap.data();

                return {
                    id: docSnap.id,
                    studentCode: data.studentCode,
                    counselId: data.counselId,
                    data: data.data,
                    submittedAt: data.submittedAt?.toDate().toISOString(),
                    updatedAt: data.updatedAt?.toDate().toISOString()
                };
            } else {
                const submissions = await this.loadAllSubmissions();
                return submissions.find(s =>
                    s.studentCode === studentCode && s.counselId === counselId
                ) || null;
            }
        } catch (error) {
            console.error('제출 데이터 조회 오류:', error);
            return null;
        }
    }

    static generateId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    // 폴백: 로컬 스토리지에 저장
    static async _saveToLocalStorage(submissionData) {
        const submissions = await this.loadAllSubmissions();

        const existingIndex = submissions.findIndex(s =>
            s.studentCode === submissionData.studentCode &&
            s.counselId === submissionData.counselId
        );

        const newSubmission = {
            id: submissionData.id || this.generateId(),
            studentCode: submissionData.studentCode,
            counselId: submissionData.counselId,
            data: submissionData.data,
            submittedAt: submissionData.submittedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            submissions[existingIndex] = newSubmission;
        } else {
            submissions.push(newSubmission);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));

        console.log('✅ 로컬 스토리지에 제출 데이터 저장 완료');
        return {
            success: true,
            submission: newSubmission,
            message: '제출 데이터가 로컬에 저장되었습니다.'
        };
    }
}
