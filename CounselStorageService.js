/**
 * CounselStorageService.js
 * 상담 목록 저장/로드 서비스
 *
 * 현재: 로컬 스토리지 사용
 * 향후: 데이터베이스 연동 예정
 */

class CounselStorageService {
    /**
     * 저장소 키
     */
    static STORAGE_KEY = 'counselList';

    /**
     * 상담 목록을 불러옵니다
     *
     * @param {string} apiKey - API Key (향후 DB 연동 시 사용자 식별용)
     * @returns {Promise<Array>} 상담 목록
     */
    static async loadCounselList(apiKey = null) {
        try {
            // TODO: 향후 데이터베이스 연동 시 API 호출로 교체
            // const response = await fetch(`/api/counsel/list?apiKey=${apiKey}`);
            // const data = await response.json();
            // return data.counselList;

            // 현재: 로컬 스토리지 사용
            const savedData = localStorage.getItem(this.STORAGE_KEY);

            if (!savedData) {
                console.log('📋 저장된 상담 목록이 없습니다. 빈 배열을 반환합니다.');
                return [];
            }

            const counselList = JSON.parse(savedData);

            console.log('✅ 상담 목록 로드 완료:', {
                count: counselList.length,
                counsels: counselList.map(c => ({ id: c.id, title: c.title }))
            });

            return counselList;
        } catch (error) {
            console.error('❌ 상담 목록 로드 실패:', error);
            return [];
        }
    }

    /**
     * 상담 목록을 저장합니다
     *
     * @param {Array} counselList - 저장할 상담 목록
     * @param {string} apiKey - API Key (향후 DB 연동 시 사용자 식별용)
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async saveCounselList(counselList, apiKey = null) {
        try {
            // TODO: 향후 데이터베이스 연동 시 API 호출로 교체
            // const response = await fetch('/api/counsel/save', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ apiKey, counselList })
            // });
            // return await response.json();

            // 현재: 로컬 스토리지 사용
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(counselList));

            console.log('✅ 상담 목록 저장 완료:', {
                count: counselList.length
            });

            return {
                success: true,
                message: '상담 목록이 성공적으로 저장되었습니다.'
            };
        } catch (error) {
            console.error('❌ 상담 목록 저장 실패:', error);
            return {
                success: false,
                message: '상담 목록 저장에 실패했습니다: ' + error.message
            };
        }
    }

    /**
     * 특정 상담을 ID로 조회합니다
     *
     * @param {string} counselId - 상담 ID
     * @param {string} apiKey - API Key
     * @returns {Promise<Object|null>} 상담 객체 또는 null
     */
    static async getCounselById(counselId, apiKey = null) {
        try {
            const counselList = await this.loadCounselList(apiKey);
            const counsel = counselList.find(c => c.id === counselId);

            if (!counsel) {
                console.warn(`⚠️ 상담 ID ${counselId}를 찾을 수 없습니다.`);
                return null;
            }

            console.log('✅ 상담 조회 완료:', { id: counsel.id, title: counsel.title });
            return counsel;
        } catch (error) {
            console.error('❌ 상담 조회 실패:', error);
            return null;
        }
    }

    /**
     * 새 상담을 생성합니다
     *
     * @param {Object} counselData - 상담 데이터 { title, config }
     * @param {string} apiKey - API Key
     * @returns {Promise<{success: boolean, counsel?: Object, message: string}>}
     */
    static async createCounsel(counselData, apiKey = null) {
        try {
            const counselList = await this.loadCounselList(apiKey);

            const newCounsel = {
                id: this.generateCounselId(),
                title: counselData.title || `상담 ${counselList.length + 1}`,
                config: counselData.config,
                apiKey: apiKey, // API Key 저장
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            counselList.push(newCounsel);

            const result = await this.saveCounselList(counselList, apiKey);

            if (result.success) {
                console.log('✅ 상담 생성 완료:', { id: newCounsel.id, title: newCounsel.title });
                return {
                    success: true,
                    counsel: newCounsel,
                    message: '상담이 생성되었습니다.'
                };
            } else {
                return result;
            }
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
     * @param {string} apiKey - API Key
     * @returns {Promise<{success: boolean, counsel?: Object, message: string}>}
     */
    static async updateCounsel(counselId, updates, apiKey = null) {
        try {
            const counselList = await this.loadCounselList(apiKey);
            const counselIndex = counselList.findIndex(c => c.id === counselId);

            if (counselIndex === -1) {
                return {
                    success: false,
                    message: '상담을 찾을 수 없습니다.'
                };
            }

            const updatedCounsel = {
                ...counselList[counselIndex],
                ...updates,
                apiKey: apiKey || counselList[counselIndex].apiKey, // API Key 유지 또는 업데이트
                updatedAt: new Date().toISOString()
            };

            counselList[counselIndex] = updatedCounsel;

            const result = await this.saveCounselList(counselList, apiKey);

            if (result.success) {
                console.log('✅ 상담 수정 완료:', { id: updatedCounsel.id, title: updatedCounsel.title });
                return {
                    success: true,
                    counsel: updatedCounsel,
                    message: '상담이 수정되었습니다.'
                };
            } else {
                return result;
            }
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
     * @param {string} apiKey - API Key
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async deleteCounsel(counselId, apiKey = null) {
        try {
            const counselList = await this.loadCounselList(apiKey);
            const filteredList = counselList.filter(c => c.id !== counselId);

            if (filteredList.length === counselList.length) {
                return {
                    success: false,
                    message: '삭제할 상담을 찾을 수 없습니다.'
                };
            }

            const result = await this.saveCounselList(filteredList, apiKey);

            if (result.success) {
                console.log('✅ 상담 삭제 완료:', { id: counselId });
                return {
                    success: true,
                    message: '상담이 삭제되었습니다.'
                };
            } else {
                return result;
            }
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
        return 'counsel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
