/**
 * TextUtility.js
 * 텍스트 처리 유틸리티
 */

export class TextUtility {
    /**
     * 입력 텍스트를 특정 키워드를 기준으로 분리합니다
     * @param {string} inputText - 입력 텍스트
     * @param {string} primaryKeyword - 첫 번째 키워드 (예: '획득')
     * @param {string} secondaryKeyword - 두 번째 키워드 (예: '사용')
     * @returns {Object} { primary, secondary } 분리된 텍스트
     */
    static splitUsageText(inputText, primaryKeyword, secondaryKeyword) {
        const input = inputText || '';
        let primaryContent = '내용 없음';
        let secondaryContent = '내용 없음';

        const primaryRegex = new RegExp(`${primaryKeyword}:(.*?)(?:\\n${secondaryKeyword}:|$)`, 's');
        const secondaryRegex = new RegExp(`${secondaryKeyword}:(.*)`, 's');

        const matchPrimary = input.match(primaryRegex);
        const matchSecondary = input.match(secondaryRegex);

        if (matchPrimary?.at(1)) {
            primaryContent = matchPrimary[1].trim();
        } else if (input.trim().startsWith(`${primaryKeyword}:`)) {
            primaryContent = input.replace(`${primaryKeyword}:`, '').trim();
        }

        if (matchSecondary?.at(1)) {
            secondaryContent = matchSecondary[1].trim();
        }

        return { primary: primaryContent, secondary: secondaryContent };
    }
}
