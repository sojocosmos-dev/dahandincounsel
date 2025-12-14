/**
 * ConfigStorageService.js
 * 보고서 설정 저장/로드 서비스
 *
 * 현재: 로컬 스토리지 사용
 * 향후: 데이터베이스 연동 예정
 */

class ConfigStorageService {
    /**
     * 저장소 키
     */
    static STORAGE_KEY = 'teacherReportConfig';

    /**
     * 교사가 설정한 보고서 config를 저장합니다
     *
     * @param {Object} config - 저장할 보고서 설정
     * @param {string} apiKey - API Key (향후 DB 연동 시 사용자 식별용)
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async saveConfig(config, apiKey = null) {
        try {
            // TODO: 향후 데이터베이스 연동 시 아래 코드를 API 호출로 교체
            // const response = await fetch('/api/config/save', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ apiKey, config })
            // });
            // return await response.json();

            // 현재: 로컬 스토리지 사용
            const configData = {
                config: config,
                apiKey: apiKey, // 향후 DB 연동을 위해 저장
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configData));

            console.log('✅ 보고서 설정 저장 완료:', {
                savedAt: configData.savedAt,
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
     * @param {string} apiKey - API Key (향후 DB 연동 시 사용자 식별용)
     * @returns {Promise<Object|null>} 저장된 설정 또는 null
     */
    static async loadConfig(apiKey = null) {
        try {
            // TODO: 향후 데이터베이스 연동 시 아래 코드를 API 호출로 교체
            // const response = await fetch(`/api/config/load?apiKey=${apiKey}`);
            // const data = await response.json();
            // return data.config;

            // 현재: 로컬 스토리지 사용
            const savedData = localStorage.getItem(this.STORAGE_KEY);

            if (!savedData) {
                console.warn('⚠️ 저장된 보고서 설정이 없습니다. 기본값을 사용합니다.');
                return null;
            }

            const configData = JSON.parse(savedData);

            console.log('✅ 보고서 설정 로드 완료:', {
                savedAt: configData.savedAt,
                hasGeneralUsage: !!configData.config.generalUsage,
                hasCookie: !!configData.config.cookie,
                hasChip: !!configData.config.chip,
                hasBadge: !!configData.config.badge,
                hasSummary: !!configData.config.summary
            });

            // 향후 DB 연동 시 apiKey로 필터링 가능
            // if (apiKey && configData.apiKey !== apiKey) {
            //     return null;
            // }

            return configData.config;
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 설정 정보를 조회합니다 (메타데이터 포함)
     *
     * @returns {Promise<Object|null>}
     */
    static async getConfigMetadata() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);

            if (!savedData) {
                return null;
            }

            const configData = JSON.parse(savedData);

            return {
                hasSavedConfig: true,
                savedAt: configData.savedAt,
                apiKey: configData.apiKey ? '***' + configData.apiKey.slice(-4) : null
            };
        } catch (error) {
            console.warn('설정 메타데이터 조회 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 설정을 삭제합니다
     *
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async deleteConfig() {
        try {
            // TODO: 향후 데이터베이스 연동 시 API 호출로 교체

            localStorage.removeItem(this.STORAGE_KEY);

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
