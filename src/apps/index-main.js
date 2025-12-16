/**
 * index-main.js
 * 로그인 페이지 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// Auth 함수들 import
import { submitTeacherLogin, submitStudentLogin } from '../auth/auth.js';

// ============================================
// 이벤트 리스너 설정
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 로그인 페이지 초기화');

    // 교사 로그인 버튼
    const teacherLoginBtn = document.querySelector('.btn-teacher');
    if (teacherLoginBtn) {
        teacherLoginBtn.addEventListener('click', submitTeacherLogin);
    }

    // 학생 로그인 버튼
    const studentLoginBtn = document.querySelector('.btn-student');
    if (studentLoginBtn) {
        studentLoginBtn.addEventListener('click', submitStudentLogin);
    }

    // Enter 키로 로그인
    const teacherApiKeyInput = document.getElementById('teacher-api-key');
    if (teacherApiKeyInput) {
        teacherApiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitTeacherLogin();
            }
        });
    }

    const studentCodeInput = document.getElementById('student-code');
    if (studentCodeInput) {
        studentCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitStudentLogin();
            }
        });
    }
});
