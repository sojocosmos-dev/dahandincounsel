/**
 * studentAuth.js
 * 학생용 인증 및 세션 관리
 */

class StudentAuth {
    /**
     * API Key를 환경 설정에서 가져옵니다
     */
    static getApiKey() {
        // 서버 환경변수 또는 설정에서 관리
        return CONFIG.STUDENT_API_KEY || 'default-api-key';
    }

    /**
     * 학생 코드를 검증합니다
     */
    static validateStudentCode(code) {
        return /^[A-Za-z0-9]{4,}$/.test(code.trim());
    }

    /**
     * 세션을 종료합니다
     */
    static logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}
