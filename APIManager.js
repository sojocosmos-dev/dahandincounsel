/**
 * APIManager.js
 * API 호출 및 데이터 조회 담당
 */

class APIManager {
    /**
     * API에서 학생 데이터를 조회합니다
     * @param {string} studentCode - 학생 코드
     * @param {string} apiKey - API 키
     * @returns {Promise<Object>} 학생 데이터 또는 에러
     */
    static async fetchStudentData(studentCode, apiKey) {
        const endpoint = `${CONFIG.API_BASE_URL}${CONFIG.ROUTE_ENDPOINT}?code=${studentCode}`;

        try {
            if (!apiKey || !studentCode) {
                return { error: "API Key와 학생 코드가 누락되었습니다." };
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers: { "X-API-Key": apiKey }
            });

            if (!response.ok) {
                return { error: `API 호출 실패 (상태 코드: ${response.status})` };
            }

            const json = await response.json();
            return json.result === true
                ? json.data
                : { error: json.message || "알 수 없는 API 응답 오류" };
        } catch (error) {
            return { error: "네트워크 오류 또는 서버 접속 실패" };
        }
    }

    /**
     * 쿠키 사용 비율을 계산합니다
     * @param {number} cookieIncome - 총 획득 쿠키
     * @param {number} cookieUsed - 사용된 쿠키
     * @returns {Object} { usage, saving } 비율 객체
     */
    static calculateCookieRatio(cookieIncome, cookieUsed) {
        if (cookieIncome <= 0) {
            return { usage: 0, saving: 0 };
        }

        const usageRatio = (cookieUsed / cookieIncome) * 100;
        return {
            usage: parseFloat(usageRatio.toFixed(1)),
            saving: parseFloat((100 - usageRatio).toFixed(1)),
        };
    }
}
