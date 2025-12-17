/**
 * CounselStorageService.js
 * 상담 목록 저장/로드 서비스
 *
 * Firestore 연동 완료
 */

import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from '../firebase/firebase-config.js';

class CounselStorageService {
    /**
     * Firestore 컬렉션 이름
     */
    static COLLECTION_NAME = 'counsels';

    /**
     * 상담 목록을 불러옵니다
     *
     * @param {string} apiKey - API Key (사용자 식별용, null이면 모든 상담 로드)
     * @returns {Promise<Array>} 상담 목록
     */
    static async loadCounselList(apiKey = null) {
        try {
            const collectionRef = collection(db, this.COLLECTION_NAME);

            // API Key가 제공된 경우 필터링, 없으면 전체 조회
            let q;
            if (apiKey) {
                q = query(collectionRef, where('teacherApiKey', '==', apiKey), orderBy('createdAt', 'desc'));
            } else {
                q = query(collectionRef, orderBy('createdAt', 'desc'));
            }

            const querySnapshot = await getDocs(q);

            const counselList = [];
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                counselList.push({
                    id: docSnap.id,
                    title: data.title,
                    config: data.config,
                    apiKey: data.teacherApiKey,
                    createdAt: data.createdAt?.toDate().toISOString(),
                    updatedAt: data.updatedAt?.toDate().toISOString()
                });
            });

            console.log('✅ Firestore에서 상담 목록 로드 완료:', {
                count: counselList.length,
                apiKeyFilter: apiKey ? 'filtered' : 'all',
                counsels: counselList.map(c => ({ id: c.id, title: c.title }))
            });

            return counselList;
        } catch (error) {
            console.error('❌ 상담 목록 로드 실패:', error);
            throw error;
        }
    }

    /**
     * Firestore에서 모든 고유한 API Key 목록을 가져옵니다
     * @returns {Promise<Array<string>>} API Key 배열
     */
    static async getAllUniqueApiKeys() {
        try {
            const counselsRef = collection(db, this.COLLECTION_NAME);
            const querySnapshot = await getDocs(counselsRef);

            const apiKeys = new Set();
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.teacherApiKey) {
                    apiKeys.add(data.teacherApiKey);
                }
            });

            const apiKeyArray = Array.from(apiKeys);
            console.log('✅ 고유 API Key 목록 조회 완료:', {
                count: apiKeyArray.length
            });

            return apiKeyArray;
        } catch (error) {
            console.error('❌ API Key 목록 조회 실패:', error);
            throw error;
        }
    }


    /**
     * 특정 상담을 ID로 조회합니다
     *
     * @param {string} counselId - 상담 ID
     * @returns {Promise<Object|null>} 상담 객체 또는 null
     */
    static async getCounselById(counselId) {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, counselId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.warn(`⚠️ 상담 ID ${counselId}를 찾을 수 없습니다.`);
                return null;
            }

            const data = docSnap.data();
            const counsel = {
                id: docSnap.id,
                title: data.title,
                config: data.config,
                apiKey: data.teacherApiKey,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString()
            };

            console.log('✅ Firestore에서 상담 조회 완료:', { id: counsel.id, title: counsel.title });
            return counsel;
        } catch (error) {
            console.error('❌ 상담 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 새 상담을 생성합니다
     *
     * @param {Object} counselData - 상담 데이터 { title, config }
     * @param {string} apiKey - API Key (선택적)
     * @returns {Promise<{success: boolean, counsel?: Object, message: string}>}
     */
    static async createCounsel(counselData, apiKey = null) {
        try {
            const newCounselId = this.generateCounselId();

            const newCounselData = {
                title: counselData.title || `상담 ${Date.now()}`,
                config: counselData.config,
                teacherApiKey: apiKey || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = doc(db, this.COLLECTION_NAME, newCounselId);
            await setDoc(docRef, newCounselData);

            const newCounsel = {
                id: newCounselId,
                title: newCounselData.title,
                config: newCounselData.config,
                apiKey: apiKey,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('✅ Firestore에 상담 생성 완료:', { id: newCounsel.id, title: newCounsel.title });
            return {
                success: true,
                counsel: newCounsel,
                message: '상담이 생성되었습니다.'
            };
        } catch (error) {
            console.error('❌ 상담 생성 실패:', error);
            return {
                success: false,
                message: '상담 생성에 실패했습니다: ' + error.message
            };
        }
    }

    /**
     * 상담을 수정합니다
     *
     * @param {string} counselId - 상담 ID
     * @param {Object} updates - 수정할 데이터 { title?, config? }
     * @param {string} apiKey - API Key (선택적)
     * @returns {Promise<{success: boolean, counsel?: Object, message: string}>}
     */
    static async updateCounsel(counselId, updates, apiKey = null) {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, counselId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return {
                    success: false,
                    message: '상담을 찾을 수 없습니다.'
                };
            }

            // API Key가 제공된 경우 권한 확인
            if (apiKey) {
                const data = docSnap.data();
                if (data.teacherApiKey && data.teacherApiKey !== apiKey) {
                    return {
                        success: false,
                        message: '이 상담을 수정할 권한이 없습니다.'
                    };
                }
            }

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(docRef, updateData);

            const data = docSnap.data();
            const updatedCounsel = {
                id: counselId,
                title: updates.title || data.title,
                config: updates.config || data.config,
                apiKey: apiKey,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('✅ Firestore에서 상담 수정 완료:', { id: updatedCounsel.id, title: updatedCounsel.title });
            return {
                success: true,
                counsel: updatedCounsel,
                message: '상담이 수정되었습니다.'
            };
        } catch (error) {
            console.error('❌ 상담 수정 실패:', error);
            return {
                success: false,
                message: '상담 수정에 실패했습니다: ' + error.message
            };
        }
    }

    /**
     * 상담을 삭제합니다
     *
     * @param {string} counselId - 상담 ID
     * @param {string} apiKey - API Key (선택적)
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async deleteCounsel(counselId, apiKey = null) {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, counselId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return {
                    success: false,
                    message: '삭제할 상담을 찾을 수 없습니다.'
                };
            }

            // API Key가 제공된 경우 권한 확인
            if (apiKey) {
                const data = docSnap.data();
                if (data.teacherApiKey && data.teacherApiKey !== apiKey) {
                    return {
                        success: false,
                        message: '이 상담을 삭제할 권한이 없습니다.'
                    };
                }
            }

            await deleteDoc(docRef);

            console.log('✅ Firestore에서 상담 삭제 완료:', { id: counselId });
            return {
                success: true,
                message: '상담이 삭제되었습니다.'
            };
        } catch (error) {
            console.error('❌ 상담 삭제 실패:', error);
            return {
                success: false,
                message: '상담 삭제에 실패했습니다: ' + error.message
            };
        }
    }

    /**
     * 고유한 상담 ID를 생성합니다
     */
    static generateCounselId() {
        return 'counsel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }
}

// ES 모듈로 export
export { CounselStorageService };
