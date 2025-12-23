/**
 * ReportSectionGenerator.js
 * 보고서 섹션별 HTML 생성
 */

import { TextUtility } from '../utils/text-utility.js';

// 색상 팔레트 정의
const COLOR_PALETTE = {
    SAVE: '#2ecc71',   // 저축 (녹색)
    USE: '#e74c3c'     // 사용 (빨간색)
};

class ReportSectionGenerator {
    /**
     * 보고서 헤더를 생성합니다
     */
    static generateReportHeader(student, config, reportDate, isBatchMode) {
        return `
            <div class="report-page" style="page-break-after: ${isBatchMode ? 'always' : 'auto'}; position: relative;">
                <div class="report-date-header" style="position: absolute; top: 0; right: 0; font-size: 0.9em; color: #666; padding: 5px 10px;">
                    조회 일시: ${reportDate}
                </div>
                <h1 style="font-size: 2.3em; font-weight: 800; text-align: center; margin: 25px 0; padding: 15px; letter-spacing: -1px;">
                    <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">✨</span>
                    <span style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb923c 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"> ${student} 학생의 성장 기록 </span>
                    <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">✨</span>
                </h1>
                <div class="usage-section">
                    <h2><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">📌</span> 우리 학급의 다했니 다했어요 활용 방안</h2>
                    <div class="usage-text">${config.generalUsage}</div>
                </div>
        `;
    }

    /**
     * 쿠키 섹션을 생성합니다
     */
    static generateCookieSection(cookie, student, totalCookieIncome, totalCookieUsed, cookieSavingRatio, cookieUsageRatio, userInputs = {}) {
        if (!cookie) return '';

        const { primary: acquisition, secondary: use } = TextUtility.splitUsageText(cookie.usage, '획득', '사용');
        const cookieBalance = totalCookieIncome - totalCookieUsed;

        let section = `
            <div class="asset-section-container">
                <h2 class="activity-title">
                    <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍪</span>
                    <span style="background: linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"> ${student} 학생의 쿠키 활동</span>
                </h2>
                <div class="dynamic-column-layout">
        `;

        if (cookie.usage) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍪</span> 우리 학급 쿠키 획득 및 사용</div>
                    <div class="usage-content-block" style="border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; line-height: 1.4;">
                        <p style="font-weight: bold; color: #2ecc71; margin-bottom: 5px; font-size: 1em;">획득</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${acquisition}</p>
                    </div>
                    <div class="usage-content-block" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0; line-height: 1.4;">
                        <p style="font-weight: bold; color: #e74c3c; margin-bottom: 5px; font-size: 1em;">사용</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${use}</p>
                    </div>
                </div>
            `;
        }

        if (cookie.asset) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">💰</span> 쿠키 자산 현황</div>
                    <div class="center-asset-content">
                        <div class="graph-container">
                            <div class="pie-chart" style="${this.generatePieChartStyle(cookieSavingRatio, cookieUsageRatio)}">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.1em; font-weight: bold; color: #333;">
                                    ${cookieSavingRatio}%
                                    <div style="font-size: 0.7em; font-weight: normal; color: #777;">(저축)</div>
                                </div>
                            </div>
                        </div>
                        <div class="cookie-asset-info">
                            <div class="cookie-asset-item"><span>총 획득 (수입)</span> <span>${totalCookieIncome}개</span></div>
                            <div class="cookie-asset-item"><span>총 사용 (지출)</span> <span>${totalCookieUsed}개</span></div>
                            <div class="cookie-asset-item"><span>남은 쿠키 (잔여)</span> <span>${cookieBalance}개</span></div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (cookie.review) {
            section += `
                <div style="flex: 1 1 40%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍪</span> 나의 쿠키 활동 돌아보기</div>
                    <div class="student-review-area">
                        <label>1. 쿠키 획득 비법:</label>
                        <textarea placeholder="쿠키 획득 비법을 적어주세요">${userInputs.cookieMethod || ''}</textarea>
                        <label>2. 좋았던 점:</label>
                        <textarea placeholder="쿠키 활동에서 좋았던 점을 적어주세요">${userInputs.cookieGood || ''}</textarea>
                    </div>
                </div>
            `;
        }

        section += '</div></div>';
        return section;
    }

    /**
     * 초코칩 섹션을 생성합니다
     */
    static generateChipSection(chip, student, currentChocoChips, userInputs = {}) {
        if (!chip) return '';

        const { primary: acquisition, secondary: use } = TextUtility.splitUsageText(chip.usage, '획득', '사용');

        let section = `
            <div class="asset-section-container chip-section">
                <h2 class="activity-title">
                    <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍫</span>
                    <span style="background: linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"> ${student} 학생의 초코칩 활동</span>
                </h2>
                <div class="dynamic-column-layout">
        `;

        if (chip.usage) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍫</span> 우리 학급 초코칩 획득 및 사용</div>
                    <div class="usage-content-block" style="border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; line-height: 1.4;">
                        <p style="font-weight: bold; color: #2ecc71; margin-bottom: 5px; font-size: 1em;">획득</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${acquisition}</p>
                    </div>
                    <div class="usage-content-block" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0; line-height: 1.4;">
                        <p style="font-weight: bold; color: #e74c3c; margin-bottom: 5px; font-size: 1em;">사용</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${use}</p>
                    </div>
                </div>
            `;
        }

        if (chip.asset) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍫</span> 초코칩 자산 현황 (잔액)</div>
                    <div class="center-asset-content">
                        <div style="background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); padding: 25px 20px; border-radius: 20px; margin: 15px 0; border: 3px solid #fdba74; box-shadow: 0 6px 16px rgba(253, 186, 116, 0.25);">
                            <h3 style="color: #ea580c; font-size: 2.8em; margin: 0; font-weight: 800; text-shadow: 2px 2px 4px rgba(234, 88, 12, 0.1);">${currentChocoChips}개</h3>
                        </div>
                    </div>
                </div>
            `;
        }

        if (chip.review) {
            section += `
                <div style="flex: 1 1 40%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🍫</span> 나의 초코칩 활동 돌아보기</div>
                    <div class="student-review-area">
                        <label>1. 초코칩 획득 비법:</label>
                        <textarea placeholder="초코칩 획득 비법을 적어주세요">${userInputs.chipMethod || ''}</textarea>
                        <label>2. 좋았던 점:</label>
                        <textarea placeholder="초코칩 활동에서 좋았던 점을 적어주세요">${userInputs.chipGood || ''}</textarea>
                    </div>
                </div>
            `;
        }

        section += '</div></div>';
        return section;
    }

    /**
     * 뱃지 섹션을 생성합니다
     */
    static generateBadgeSection(badge, student, allAcquiredBadges, userInputs = {}) {
        if (!badge) return '';

        const { primary: introduction, secondary: acquisition } = TextUtility.splitUsageText(badge.usage, '소개', '획득');
        const badgesHtml = allAcquiredBadges.length > 0
            ? allAcquiredBadges.map(b => `
                <div class="badge-item-display acquired">
                    <img src="${b.imgUrl}" alt="${b.title} 뱃지">
                    <span>${b.title}</span>
                </div>
            `).join('')
            : '<p style="text-align: center; font-size: 0.9em; color: #777; width: 100%; margin: 10px 0;">아직 획득한 뱃지가 없습니다.</p>';

        let section = `
            <div class="asset-section-container badge-section" data-page-break-after="true">
                <h2 class="activity-title">
                    <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🏅</span>
                    <span style="background: linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"> ${student} 학생의 뱃지 활동</span>
                </h2>
                <div class="dynamic-column-layout">
        `;

        if (badge.usage) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🏅</span> 우리 학급 뱃지 소개 및 획득</div>
                    <div class="usage-content-block" style="border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; line-height: 1.4;">
                        <p style="font-weight: bold; color: #1e88e5; margin-bottom: 5px; font-size: 1em;">소개</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${introduction}</p>
                    </div>
                    <div class="usage-content-block" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0; line-height: 1.4;">
                        <p style="font-weight: bold; color: #2ecc71; margin-bottom: 5px; font-size: 1em;">획득</p>
                        <p style="white-space: pre-wrap; font-size: 0.9em;">${acquisition}</p>
                    </div>
                </div>
            `;
        }

        if (badge.status) {
            section += `
                <div style="flex: 1 1 30%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🏅</span> 학생의 뱃지 획득 현황</div>
                    <div class="all-badges-container">${badgesHtml}</div>
                </div>
                <div style="flex: 1 1 40%;">
                    <div class="column-title"><span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">🏅</span> 나의 뱃지 활동 돌아보기</div>
                    <div class="student-review-area">
                        <label>1. 가장 자랑스러운 뱃지와 그 이유:</label>
                        <textarea placeholder="가장 자랑스러운 뱃지와 그 이유를 적어주세요">${userInputs.proudBadge || ''}</textarea>
                        <label>2. 내가 받고 싶은 뱃지 추천:</label>
                        <textarea placeholder="받고 싶은 뱃지를 추천해주세요">${userInputs.wantBadge || ''}</textarea>
                    </div>
                </div>
            `;
        }

        section += '</div></div>';
        return section;
    }

    /**
     * 총평 섹션을 생성합니다
     */
    static generateSummarySection(summary, analysis) {
        if (!summary) return '';

        let section = '<div class="summary-section"><h2><span style="font-family: \'Segoe UI Emoji\', \'Apple Color Emoji\', \'Noto Color Emoji\', sans-serif;">📊</span> 총평</h2>';

        if (summary.summary) {
            section += `
                <h3>1. 활동 요약</h3>
                <div class="auto-summary-area">${analysis.autoSummary}</div>
            `;
        }

        if (summary.praiseAndResolve) {
            const currentValue = (analysis.praiseAndResolve || '').trim();

            section += `
                <h3>2. 칭찬과 다짐</h3>
                <textarea class="summary-textarea" rows="4"
                    placeholder="학생 입력 : 스스로 잘한 부분을 칭찬하고 앞으로의 다짐을 적어봅시다.">${currentValue}</textarea>
            `;
        }

        if (summary.parentComment) {
            section += `
                <h3>3. 격려의 한 마디</h3>
                <textarea class="summary-textarea" rows="4" placeholder="학부모 입력 : 자녀를 위한 격려의 한 마디를 남겨주세요.">${analysis.parentComment || ''}</textarea>
            `;
        }

        section += '</div>';
        return section;
    }

    /**
     * 보고서 푸터를 생성합니다
     */
    static generateFooter(reportDate) {
        return `
            </div>
        `;
    }

    /**
     * 파이 차트 스타일을 생성합니다
     */
    static generatePieChartStyle(savingRatio, usageRatio) {
        return `background: conic-gradient(${COLOR_PALETTE.SAVE} 0% ${savingRatio}%, ${COLOR_PALETTE.USE} ${savingRatio}% 100%);`;
    }
}

// ES 모듈로 export
export { ReportSectionGenerator };
