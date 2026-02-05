
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';

describe('Confirm Component Localization', () => {
    it('Should implement format function to localize input result', () => {
        const filePath = path.resolve('src/components/prompt/Confirm.js');
        const content = readFileSync(filePath, 'utf8');

        // We look for logic that handles formatting of the result value (yes/no -> так/ні)
        const hasFormatLogic = content.includes('format:');

        assert.ok(hasFormatLogic, 'Confirm.js needs a format function to localize the result (yes/no)');
    });
});
