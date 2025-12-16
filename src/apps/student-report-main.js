/**
 * student-report-main.js
 * 학생용 보고서 페이지 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// 필요한 모듈 import
import { CONFIG } from '../core/config.js';
import { ConfigStorageService } from '../services/config-storage-service.js';
import { CounselStorageService } from '../services/counsel-storage-service.js';
import { StudentSubmissionService } from '../services/student-submission-service.js';
import { TextUtility } from '../utils/text-utility.js';
import { APIManager } from '../core/api-manager.js';
import { StateManager } from '../core/state-manager.js';
import { ReportDataGenerator } from '../services/report-data-generator.js';
import { ReportSectionGenerator } from '../services/report-section-generator.js';
import { ReportGenerator } from '../services/report-generator.js';
import { UIController } from '../ui/ui-controller.js';
import { ReportService } from '../services/report-service.js';
import { StudentReportService } from '../services/student-report-service.js';
import { StudentAuth } from '../auth/auth.js';

// 전역으로 노출
window.CONFIG = CONFIG;
window.ConfigStorageService = ConfigStorageService;
window.CounselStorageService = CounselStorageService;
window.StudentSubmissionService = StudentSubmissionService;
window.TextUtility = TextUtility;
window.APIManager = APIManager;
window.StateManager = StateManager;
window.ReportDataGenerator = ReportDataGenerator;
window.ReportSectionGenerator = ReportSectionGenerator;
window.ReportGenerator = ReportGenerator;
window.UIController = UIController;
window.ReportService = ReportService;
window.StudentReportService = StudentReportService;
window.StudentAuth = StudentAuth;

// student-app.js 코드 import
import '../apps/student-app.js';
