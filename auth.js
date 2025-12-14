/**
 * auth.js
 * 로그인 페이지 네비게이션 및 학생 로그인 처리
 */

// 교사 로그인 제출
function submitTeacherLogin() {
    const apiKey = document.getElementById('teacher-api-key').value.trim();

    // 입력값 검증
    if (!apiKey) {
        alert('API Key를 입력해주세요.');
        return;
    }

    // teacher-report.html로 이동하며 API Key 전달
    const params = new URLSearchParams({
        apiKey: apiKey
    });
    window.location.href = `teacher-report.html?${params.toString()}`;
}

function redirectToTeacherReport() {
    window.location.href = 'teacher-report.html';
}

function redirectToAuth() {
    window.location.href = 'index.html';
}

// 학생 로그인 제출
function submitStudentLogin() {
    const apiKey = document.getElementById('student-api-key').value.trim();
    const studentCode = document.getElementById('student-code').value.trim();

    // 입력값 검증
    if (!apiKey) {
        alert('API Key를 입력해주세요.');
        return;
    }

    if (!studentCode) {
        alert('개인 코드를 입력해주세요.');
        return;
    }

    if (!/^[A-Za-z0-9]{4,}$/.test(studentCode)) {
        alert('개인 코드는 4자 이상의 영숫자여야 합니다.');
        return;
    }

    // student-counsel-select.html로 이동하여 상담 선택
    const params = new URLSearchParams({
        apiKey: apiKey,
        studentCode: studentCode
    });
    window.location.href = `student-counsel-select.html?${params.toString()}`;
}
