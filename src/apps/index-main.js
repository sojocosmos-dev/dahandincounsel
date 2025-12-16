/**
 * index-main.js
 * 로그인 페이지 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// StudentDataService가 있다면 import (일단 주석 처리)
// import { StudentDataService } from '../services/student-data-service.js';

// ============================================
// StudentAuth 클래스 (구 studentAuth.js에서 통합)
// ============================================
class StudentAuth {
    /**
     * API Key를 환경 설정에서 가져옵니다
     */
    static getApiKey() {
        return CONFIG?.STUDENT_API_KEY || 'default-api-key';
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

// ============================================
// 공통 유틸리티 함수
// ============================================

// Snackbar 표시 함수
window.showSnackbar = function(message, type = 'info') {
    const snackbar = document.getElementById('snackbar');
    if (snackbar) {
        snackbar.textContent = message;
        snackbar.className = 'show ' + type;

        setTimeout(() => {
            snackbar.className = snackbar.className.replace('show', '');
        }, 3000);
    }
}

// 교사 로그인 제출
window.submitTeacherLogin = async function() {
    const apiKey = document.getElementById('teacher-api-key').value.trim();

    // 입력값 검증
    if (!apiKey) {
        showSnackbar('API Key를 입력해주세요.', 'error');
        return;
    }

    // API 호출하여 검증
    try {
        const apiUrl = `https://api.dahandin.com/openapi/v1/get/class/list`;

        console.log('🔑 API Key 검증 시작...');

        // 클래스 목록 조회
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'X-API-Key': apiKey }
        });

        console.log('📡 API 응답 상태:', response.status);

        // HTTP 상태 코드 확인
        if (response.status === 401 || response.status === 403) {
            // 401 Unauthorized 또는 403 Forbidden: API Key가 유효하지 않음
            console.error('❌ 인증 실패: 유효하지 않은 API Key');
            showSnackbar('유효하지 않은 API Key입니다.', 'error');
            return;
        }

        // 응답 본문 파싱
        let responseData;
        try {
            responseData = await response.json();
            console.log('📦 API 응답 데이터:', responseData);
        } catch (parseError) {
            console.error('❌ JSON 파싱 실패:', parseError);
            showSnackbar('서버 응답을 처리할 수 없습니다.', 'error');
            return;
        }

        // API 응답의 result 필드 확인
        // result: true = 성공, result: false = 실패
        if (responseData && responseData.result === true) {
            // API 호출 성공 = API Key 유효
            console.log('✅ 교사 로그인 성공: API Key 유효');
            showSnackbar('로그인 성공!', 'success');

            // teacher-report.html로 이동하며 API Key 전달
            setTimeout(() => {
                const params = new URLSearchParams({
                    apiKey: apiKey
                });
                window.location.href = `teacher-report.html?${params.toString()}`;
            }, 1000);
        } else {
            // result가 false이거나 없는 경우 = API Key 무효 또는 오류
            const errorMessage = responseData?.message || '알 수 없는 오류가 발생했습니다.';
            console.error('❌ API 호출 실패:', errorMessage);
            showSnackbar(`로그인 실패: ${errorMessage}`, 'error');
        }
    } catch (error) {
        console.error('❌ 교사 로그인 오류:', error);
        showSnackbar('네트워크 오류가 발생했습니다.', 'error');
    }
}

window.redirectToTeacherReport = function() {
    window.location.href = 'teacher-report.html';
}

window.redirectToAuth = function() {
    window.location.href = 'index.html';
}

// 학생 로그인 제출
window.submitStudentLogin = function() {
    const studentCode = document.getElementById('student-code').value.trim();

    // 입력값 검증
    if (!studentCode) {
        showSnackbar('개인 코드를 입력해주세요.', 'error');
        return;
    }

    if (!/^[A-Za-z0-9]{4,}$/.test(studentCode)) {
        showSnackbar('개인 코드는 4자 이상의 영숫자여야 합니다.', 'error');
        return;
    }

    // 로그인 성공 메시지 표시
    showSnackbar('로그인 성공!', 'success');

    // 상담 선택 페이지로 이동 (학생 코드 전달, API Key 불필요)
    setTimeout(() => {
        const params = new URLSearchParams({
            studentCode: studentCode
        });
        window.location.href = `student-counsel-select.html?${params.toString()}`;
    }, 1000);
}
