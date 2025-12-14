/**
 * auth.js
 * 로그인 페이지 네비게이션 및 학생 로그인 처리
 */

function redirectToTeacherReport() {
    window.location.href = 'teacher-report.html';
}

function redirectToAuth() {
    window.location.href = 'index.html';
}

// 학생 로그인 폼 표시
function showStudentLoginForm() {
    document.getElementById('auth-selection').style.display = 'none';
    document.getElementById('student-login-form').style.display = 'block';
}

// 학생 로그인 폼 숨기기
function hideStudentLoginForm() {
    document.getElementById('student-login-form').style.display = 'none';
    document.getElementById('auth-selection').style.display = 'grid';
    document.getElementById('form-message').style.display = 'none';
    document.getElementById('student-api-key').value = '';
    document.getElementById('student-code').value = '';
}

// 학생 로그인 제출
function submitStudentLogin() {
    const apiKey = document.getElementById('student-api-key').value.trim();
    const studentCode = document.getElementById('student-code').value.trim();
    const messageEl = document.getElementById('form-message');

    // 입력값 검증
    if (!apiKey) {
        messageEl.textContent = 'API Key를 입력해주세요.';
        messageEl.className = 'form-message error show';
        messageEl.style.display = 'block';
        return;
    }

    if (!studentCode) {
        messageEl.textContent = '개인 코드를 입력해주세요.';
        messageEl.className = 'form-message error show';
        messageEl.style.display = 'block';
        return;
    }

    if (!/^[A-Za-z0-9]{4,}$/.test(studentCode)) {
        messageEl.textContent = '개인 코드는 4자 이상의 영숫자여야 합니다.';
        messageEl.className = 'form-message error show';
        messageEl.style.display = 'block';
        return;
    }

    // 폼 제출 - student-report.html로 이동하며 파라미터 전달
    const params = new URLSearchParams({
        apiKey: apiKey,
        studentCode: studentCode
    });
    window.location.href = `student-report.html?${params.toString()}`;
}
