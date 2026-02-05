
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';

describe('Static Analysis of Components', () => {
    it('Multiselect should provide localized instructions', () => {
        const filePath = path.resolve('src/components/prompt/Multiselect.js');
        const content = readFileSync(filePath, 'utf8');

        // We expect custom instructions to be constructed using 't' function if 't' is passed.
        // Currently, it just passes 'p.instructions'.
        // We want to see logic that builds instructions if they are missing.

        // A robust implementation would look like:
        // instructions: p.instructions || (p.t ? buildInstructions(p.t) : undefined)

        const implementsLocalization = content.includes("instructions:") && content.includes("Instruction");

        assert.ok(implementsLocalization, 'Multiselect.js does not appear to implement localized instructions generation');
    });
});
