/**
 * studentReportService.js
 * 학생용 보고서 생성 서비스 (teacher-report.html과 동일한 형식)
 */

class StudentReportService {
    /**
     * 학생 개인 보고서를 조회합니다
     * @param {string} studentCode - 학생 코드
     * @param {string} apiKey - API Key
     * @param {string} counselId - 상담 ID (선택)
     */
    static async fetchStudentReport(studentCode, apiKey, counselId = null) {
        try {
            let config = null;

            // counselId가 있으면 해당 상담의 설정을 불러옴
            if (counselId) {
                const counsel = await CounselStorageService.getCounselById(counselId, apiKey);
                if (counsel && counsel.config) {
                    config = counsel.config;
                } else {
                    return { error: "선택한 상담을 찾을 수 없습니다." };
                }
            } else {
                // 하위 호환성: counselId가 없으면 기존 방식 사용 (ConfigStorageService)
                config = await ConfigStorageService.loadConfig(apiKey);
            }

            // config가 없으면 기본값 사용
            if (!config) {
                config = {
                    generalUsage: "학생 개인 성장 기록 조회",
                cookie: {
                    usage: "다했니 플랫폼에서 제공하는 쿠키 시스템을 통해 학생의 활동을 추적했습니다.",
                    asset: true,
                    review: true,
                },
                chip: {
                    usage: "초코칩은 특별한 성취를 인정하는 보상 시스템입니다.",
                    asset: true,
                    review: true,
                },
                badge: {
                    usage: "뱃지는 다양한 활동과 성취를 통해 획득할 수 있습니다.",
                    status: true,
                    strength: false,
                },
                summary: {
                    output: true,
                    summary: true,
                    praiseAndResolve: true,
                    parentComment: true,
                }
                };
            }

            const stateManager = new StateManager();
            stateManager.setMode('single');

            const reportData = await ReportDataGenerator.generateStudentReport(
                studentCode,
                apiKey,
                config,
                stateManager
            );

            if (reportData.error) {
                return { error: reportData.error };
            }

            return reportData;
        } catch (error) {
            return { error: "데이터 조회에 실패했습니다: " + error.message };
        }
    }

    /**
     * 학생용 보고서 HTML을 생성합니다 (teacher-report.html과 동일한 형식)
     */
    static generateStudentReportHTML(reportData) {
        if (reportData.error) {
            return `
                <div style="padding: 30px; text-align: center; background-color: #ffebee; border-radius: 12px;">
                    <h2>⚠️ 오류</h2>
                    <p>${reportData.error}</p>
                </div>
            `;
        }

        // ReportGenerator를 사용하여 교사용과 동일한 형식의 HTML 생성
        return ReportGenerator.generateReportHtml(reportData, false);
    }
}
