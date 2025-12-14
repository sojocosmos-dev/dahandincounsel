/**
 * StudentSubmissionService.js
 * 학생 제출 데이터 저장/로드 서비스
 */

class StudentSubmissionService {
    static STORAGE_KEY = 'studentSubmissions';

    /**
     * 제출 데이터를 저장합니다
     */
    static async saveSubmission(submissionData, apiKey = null) {
        try {
            const submissions = await this.loadAllSubmissions(apiKey);

            // 기존 데이터 찾기
            const existingIndex = submissions.findIndex(s =>
                s.studentCode === submissionData.studentCode &&
                s.counselId === submissionData.counselId
            );

            const newSubmission = {
                id: submissionData.id || this.generateId(),
                studentCode: submissionData.studentCode,
                counselId: submissionData.counselId,
                data: submissionData.data,
                submittedAt: submissionData.submittedAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (existingIndex !== -1) {
                submissions[existingIndex] = newSubmission;
            } else {
                submissions.push(newSubmission);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));

            return {
                success: true,
                submission: newSubmission,
                message: '제출 데이터가 저장되었습니다.'
            };
        } catch (error) {
            console.error('제출 저장 오류:', error);
            return {
                success: false,
                message: '저장 실패: ' + error.message
            };
        }
    }

    /**
     * 모든 제출 데이터를 불러옵니다
     */
    static async loadAllSubmissions(apiKey = null) {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : [];
        } catch (error) {
            console.error('제출 데이터 로드 오류:', error);
            return [];
        }
    }

    /**
     * 특정 상담의 제출 데이터를 조회합니다
     */
    static async getSubmissionsByCounselId(counselId, apiKey = null) {
        try {
            const submissions = await this.loadAllSubmissions(apiKey);
            return submissions.filter(s => s.counselId === counselId);
        } catch (error) {
            console.error('상담별 제출 조회 오류:', error);
            return [];
        }
    }

    static generateId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
