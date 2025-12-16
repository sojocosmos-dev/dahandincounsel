/**
 * studentApp.js
 * 학생용 애플리케이션 초기화
 */

import { StudentAuth } from '../auth/auth.js';
import { CounselStorageService } from '../services/counsel-storage-service.js';
import { StudentSubmissionService } from '../services/student-submission-service.js';
import { StudentReportService } from '../services/student-report-service.js';

let studentApp;

class StudentApp {
  constructor() {
    this.apiKey = null;
    this.studentCode = null;
    this.counselId = null;
    this.reportData = null; // 원본 보고서 데이터 저장
    this.setupEventListeners();
    this.checkUrlParams();
  }

  setupEventListeners() {
    const queryBtn = document.getElementById("query-report-btn");
    if (queryBtn) {
      queryBtn.addEventListener("click", () => {
        this.handleStudentQuery();
      });

      // Enter 키로도 조회 가능
      const studentCodeInput = document.getElementById("student-code-input");
      if (studentCodeInput) {
        studentCodeInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            this.handleStudentQuery();
          }
        });
      }
    }

    // 제출 버튼 이벤트 리스너
    const submitBtn = document.getElementById("submit-report-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.handleSubmitReport());
    }

    // 뒤로가기 버튼 이벤트 리스너
    const logoutBtn = document.querySelector(".student-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.location.href = 'index.html';
      });
    }
  }

  /**
   * URL 파라미터 확인 및 자동 조회
   */
  async checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const studentCode = params.get("studentCode");
    const counselId = params.get("counselId");

    console.log("🔍 URL 파라미터 확인:", { studentCode, counselId });

    if (studentCode && counselId) {
      console.log("✅ 학생 코드와 상담 ID 발견");

      // 학생 코드와 상담 ID가 URL에 있으면 자동으로 조회
      this.counselId = counselId; // 상담 ID 저장
      this.studentCode = studentCode; // 학생 코드 저장

      const codeInput = document.getElementById("student-code-input");
      if (codeInput) {
        codeInput.value = studentCode;
      }
      // 입력 그룹만 숨기기 (메시지는 표시되어야 함)
      const inputGroup = document.querySelector(".student-input-group");
      if (inputGroup) {
        inputGroup.style.display = "none";
      }

      // 상담에서 API Key 가져오기
      console.log("📋 상담 정보 조회 중... (counselId:", counselId, ")");
      try {
        const counsel = await CounselStorageService.getCounselById(counselId);
        console.log("📥 상담 정보:", counsel);

        if (counsel && counsel.apiKey) {
          this.apiKey = counsel.apiKey;
          console.log(
            "✅ API Key를 상담에서 가져왔습니다:",
            this.apiKey.substring(0, 10) + "..."
          );
        } else {
          console.error("❌ 상담에 API Key가 없습니다!");
          console.log("상담 전체 객체:", counsel);
          this.showMessage(
            "API Key를 찾을 수 없습니다. 교사가 API Key를 저장했는지 확인해주세요.",
            "error"
          );
          return;
        }
      } catch (error) {
        console.error("❌ 상담 조회 실패:", error);
        this.showMessage(
          "상담 정보를 불러오는데 실패했습니다: " + error.message,
          "error"
        );
        return;
      }

      // 자동으로 보고서 생성
      console.log("📊 보고서 생성 시작...");
      await this.handleStudentQuery(this.apiKey, counselId);
    } else {
      console.log("ℹ️ URL 파라미터가 없습니다. 수동 입력 모드");
    }
  }

  /**
   * 학생 보고서 조회 처리
   */
  async handleStudentQuery(providedApiKey = null, providedCounselId = null) {
    console.log("🔍 handleStudentQuery 시작", { providedApiKey: providedApiKey?.substring(0, 10) + "...", providedCounselId });

    const studentCodeInput = document.getElementById("student-code-input");
    if (!studentCodeInput) {
      console.error("❌ student-code-input 요소를 찾을 수 없습니다!");
      return;
    }

    const studentCode = studentCodeInput.value.trim();
    const counselId = providedCounselId || this.counselId || null;
    console.log("📝 학생 코드:", studentCode, "상담 ID:", counselId);

    // 상담 ID가 있으면 상담에 저장된 API Key를 사용
    let apiKey = providedApiKey || this.apiKey;
    if (!apiKey && counselId) {
      console.log("🔑 상담에서 API Key 조회 중...");
      const counsel = await CounselStorageService.getCounselById(counselId);
      if (counsel && counsel.apiKey) {
        apiKey = counsel.apiKey;
        console.log("✅ API Key 발견:", apiKey.substring(0, 10) + "...");
      }
    }

    // 입력값 검증
    if (!studentCode) {
      console.log("⚠️ 학생 코드 없음");
      this.showMessage("개인 코드를 입력해주세요.", "error");
      return;
    }

    console.log("🔍 학생 코드 유효성 검사 중...");
    if (!StudentAuth.validateStudentCode(studentCode)) {
      console.log("❌ 학생 코드 형식 오류");
      this.showMessage("올바른 코드 형식이 아닙니다. (예: A1001)", "error");
      return;
    }

    if (!apiKey) {
      console.log("❌ API Key 없음");
      this.showMessage(
        "API Key를 찾을 수 없습니다. 올바른 URL로 접속해주세요.",
        "error"
      );
      return;
    }

    // 조회 시작
    console.log("📊 보고서 데이터 조회 시작...");
    this.setButtonEnabled(false);
    this.showMessage("성장 기록을 불러오는 중입니다...", "info");

    try {
      console.log("📡 StudentReportService.fetchStudentReport 호출 중...");
      const reportData = await StudentReportService.fetchStudentReport(
        studentCode,
        apiKey,
        counselId
      );
      console.log("📥 보고서 데이터 응답:", reportData);

      if (reportData.error) {
        this.showMessage(reportData.error, "error");
        this.setButtonEnabled(true);
      } else {
        // 학생 정보 및 원본 데이터 저장
        this.studentCode = studentCode;
        this.apiKey = apiKey;
        this.counselId = counselId;
        this.reportData = reportData; // 원본 보고서 데이터 저장

        const html = StudentReportService.generateStudentReportHTML(reportData);
        const reportArea = document.getElementById("student-report-area");
        if (reportArea) {
          reportArea.innerHTML = html;
          reportArea.classList.add("show");
        }
        this.setButtonEnabled(true);
        this.showMessage("성장 기록을 불러왔습니다.", "success");
      }
    } catch (error) {
      this.showMessage("오류가 발생했습니다: " + error.message, "error");
      this.setButtonEnabled(true);
    }
  }

  showMessage(message, type) {
    const messageEl = document.getElementById("message");
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `student-message show ${type}`;

      if (type === "success") {
        setTimeout(() => {
          messageEl.classList.remove("show");
        }, 3000);
      }
    }
  }

  setButtonEnabled(enabled) {
    const btn = document.getElementById("query-report-btn");
    if (btn) {
      btn.disabled = !enabled;
    }
  }

  /**
   * 보고서 제출하기
   */
  async handleSubmitReport() {
    if (!this.studentCode || !this.counselId) {
      showMessage("오류: 학생 정보를 찾을 수 없습니다.", "error");
      return;
    }

    if (!this.reportData) {
      showMessage("오류: 보고서 데이터를 찾을 수 없습니다.", "error");
      return;
    }

    const reportArea = document.getElementById("student-report-area");
    if (!reportArea) {
      showMessage("오류: 보고서를 찾을 수 없습니다.", "error");
      return;
    }

    // 보고서 내의 모든 textarea 수집
    const textareas = reportArea.querySelectorAll("textarea");
    const userInputs = {};

    // 각 textarea의 값을 저장
    textareas.forEach((textarea, index) => {
      const value = textarea.value.trim();
      if (value) {
        // textarea placeholder로 구분
        const placeholder = textarea.placeholder;
        if (placeholder.includes("쿠키 획득")) {
          userInputs.cookieMethod = value;
        } else if (
          placeholder.includes("쿠키") &&
          placeholder.includes("좋았던")
        ) {
          userInputs.cookieGood = value;
        } else if (placeholder.includes("초코칩 획득")) {
          userInputs.chipMethod = value;
        } else if (
          placeholder.includes("초코칩") &&
          placeholder.includes("좋았던")
        ) {
          userInputs.chipGood = value;
        } else if (placeholder.includes("자랑스러운")) {
          userInputs.proudBadge = value;
        } else if (placeholder.includes("받고 싶은")) {
          userInputs.wantBadge = value;
        } else if (placeholder.includes("칭찬") || placeholder.includes("다짐")) {
          userInputs.praiseResolve = value;
        } else if (placeholder.includes("격려")) {
          userInputs.parentComment = value;
        } else {
          userInputs["textarea_" + index] = value;
        }
      }
    });

    // 제출할 데이터: 원본 보고서 데이터 + 학생 입력 내용
    const submissionData = {
      studentCode: this.studentCode,
      studentName: this.reportData?.student, // 보고서에서 학생 이름 가져오기
      counselId: this.counselId,
      data: {
        // 원본 보고서 데이터 (API에서 받아온 쿠키, 초코칩, 뱃지 정보)
        ...this.reportData,
        // studentCode 명시적 추가 (reportData에 없을 수 있음)
        studentCode: this.studentCode,
        // 학생이 입력한 내용
        userInputs: userInputs,
      },
    };

    try {
      // 디버깅: 저장할 데이터 확인
      console.log("📤 제출할 데이터:", submissionData);
      console.log("📊 보고서 데이터:", this.reportData);

      const result = await StudentSubmissionService.saveSubmission(
        submissionData,
        this.apiKey
      );

      if (result.success) {
        console.log("✅ 제출 성공:", result.submission);
        showMessage("✅ 입력 내용이 제출되었습니다!", "success");
      } else {
        showMessage("❌ 제출 실패: " + result.message, "error");
      }
    } catch (error) {
      console.error("❌ 제출 오류:", error);
      showMessage("❌ 오류 발생: " + error.message, "error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  studentApp = new StudentApp();
  window.studentApp = studentApp; // 전역으로 노출 (디버깅용)
});

function showMessage(message, type) {
  const messageEl = document.getElementById("submission-message");
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.display = "block";
    messageEl.className =
      type === "success" ? "message-success" : "message-error";
    messageEl.style.backgroundColor =
      type === "success" ? "#d4edda" : "#f8d7da";
    messageEl.style.color = type === "success" ? "#155724" : "#721c24";
    messageEl.style.border =
      type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";

    if (type === "success") {
      setTimeout(() => {
        messageEl.style.display = "none";
      }, 3000);
    }
  }
}
