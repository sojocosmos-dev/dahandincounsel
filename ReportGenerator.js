/**
 * ReportGenerator.js
 * 전체 보고서 HTML 생성 조율
 */

import { ReportSectionGenerator } from './ReportSectionGenerator.js';

export class ReportGenerator {
    /**
     * 완전한 보고서 HTML을 생성합니다
     */
    static generateReportHtml(report, isBatchMode) {
        const { student, reportDate, config, allAcquiredBadges, totalCookieIncome, totalCookieUsed, currentChocoChips, cookieSavingRatio, cookieUsageRatio } = report;
        const { cookie, chip, badge, summary } = config;

        return (
            ReportSectionGenerator.generateReportHeader(student, config, reportDate, isBatchMode) +
            ReportSectionGenerator.generateCookieSection(cookie, student, totalCookieIncome, totalCookieUsed, cookieSavingRatio, cookieUsageRatio) +
            ReportSectionGenerator.generateChipSection(chip, student, currentChocoChips) +
            ReportSectionGenerator.generateBadgeSection(badge, student, allAcquiredBadges) +
            ReportSectionGenerator.generateSummarySection(summary, report.analysis) +
            ReportSectionGenerator.generateFooter(reportDate)
        );
    }
}
