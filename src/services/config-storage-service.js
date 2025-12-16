/**
 * ConfigStorageService.js
 * 보고서 설정 저장/로드 서비스
 *
 * Firestore 연동 완료
 */

class ConfigStorageService {
    /**
     * Firestore 컬렉션 이름
     */
    static COLLECTION_NAME = 'reportConfigs';

    /**
     * 교사가 설정한 보고서 config를 저장합니다
     *
     * @param {Object} config - 저장할 보고서 설정
     * @param {string} apiKey - API Key (사용자 식별용)
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async saveConfig(config, apiKey = null) {
        try {
            if (!apiKey) {
                throw new Error('API Key가 필요합니다.');
            }

            const db = await getFirestore();

            const configData = {
                teacherApiKey: apiKey,
                config: config,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // API Key를 문서 ID로 사용 (교사당 하나의 설정)
            const docRef = db.collection(this.COLLECTION_NAME).doc(apiKey);
            await docRef.set(configData, { merge: true });

            console.log('✅ Firestore에 보고서 설정 저장 완료:', {
                apiKey: '***' + apiKey.slice(-4),
                hasGeneralUsage: !!config.generalUsage,
                hasCookie: !!config.cookie,
                hasChip: !!config.chip,
                hasBadge: !!config.badge,
                hasSummary: !!config.summary
            });

            return {
                success: true,
                message: '보고서 항목이 성공적으로 저장되었습니다.'
            };
        } catch (error) {
            console.error('❌ 설정 저장 실패:', error);
            return {
                success: false,
                message: '설정 저장에 실패했습니다: ' + error.message
            };
        }
    }

    /**
     * 저장된 교사 설정을 불러옵니다
     *
     * @param {string} apiKey - API Key (사용자 식별용)
     * @returns {Promise<Object|null>} 저장된 설정 또는 null
     */
    static async loadConfig(apiKey = null) {
        try {
            if (!apiKey) {
                console.warn('⚠️ API Key가 제공되지 않았습니다.');
                return null;
            }

            const db = await getFirestore();

            const docRef = db.collection(this.COLLECTION_NAME).doc(apiKey);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                console.warn('⚠️ 저장된 보고서 설정이 없습니다. 기본값을 사용합니다.');
                return null;
            }

            const data = docSnap.data();

            console.log('✅ Firestore에서 보고서 설정 로드 완료:', {
                apiKey: '***' + apiKey.slice(-4),
                hasGeneralUsage: !!data.config.generalUsage,
                hasCookie: !!data.config.cookie,
                hasChip: !!data.config.chip,
                hasBadge: !!data.config.badge,
                hasSummary: !!data.config.summary
            });

            return data.config;
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 저장된 설정 정보를 조회합니다 (메타데이터 포함)
     *
     * @param {string} apiKey - API Key
     * @returns {Promise<Object|null>}
     */
    static async getConfigMetadata(apiKey = null) {
        try {
            if (!apiKey) {
                return null;
            }

            const db = await getFirestore();

            const docRef = db.collection(this.COLLECTION_NAME).doc(apiKey);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return null;
            }

            const data = docSnap.data();
            return {
                hasSavedConfig: true,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
                apiKey: '***' + apiKey.slice(-4)
            };
        } catch (error) {
            console.warn('설정 메타데이터 조회 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 설정을 삭제합니다
     *
     * @param {string} apiKey - API Key
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async deleteConfig(apiKey = null) {
        try {
            if (!apiKey) {
                throw new Error('API Key가 필요합니다.');
            }

            const db = await getFirestore();

            const docRef = db.collection(this.COLLECTION_NAME).doc(apiKey);
            await docRef.delete();

            console.log('✅ Firestore에서 설정 삭제 완료');
            return {
                success: true,
                message: '저장된 설정이 삭제되었습니다.'
            };
        } catch (error) {
            console.error('설정 삭제 실패:', error);
            return {
                success: false,
                message: '설정 삭제에 실패했습니다: ' + error.message
            };
        }
    }
}

// ES 모듈로 export
export { ConfigStorageService };
