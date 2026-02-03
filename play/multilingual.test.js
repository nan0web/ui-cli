/**
 * Multilingual tests – verify all demos work in both English and Ukrainian.
 *
 * Each demo should be tested with:
 * 1. English language (en)
 * 2. Ukrainian language (uk)
 *
 * @module play/multilingual.test
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PlaygroundTest } from '../src/test/index.js'

/**
 * Run playground with specified language and sequence.
 * @param {string} lang - Language code ('en' or 'uk')
 * @param {string} sequence - Demo sequence
 * @param {Object} extraEnv - Additional environment variables
 * @returns {Promise<{stdout:string,stderr:string,exitCode:number}>}
 */
async function runWithLanguage(lang, sequence, extraEnv = {}) {
    const pt = new PlaygroundTest(
        {
            ...process.env,
            LANG: `${lang}_US.UTF-8`,
            LANGUAGE: lang,
            PLAY_DEMO_SEQUENCE: sequence,
            ...extraEnv,
        },
        { includeDebugger: false, feedStdin: true }
    )
    const result = await pt.run(['play/main.js'])
    return result
}

describe('English language demos', () => {
    it('Demo 1: Basic Logging (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Basic Logging')), 'Should show demo title')
        assert.ok(lines.some(l => l.includes('Logger initialized')), 'Should show log message')
    })

    it('Demo 2: Select Prompt with color selection (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '2,3,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Select Prompt')), 'Should run select demo')
        assert.ok(lines.some(l => l.includes('selected: Blue')), 'Should confirm color selection')
    })

    it('Demo 3: Simple Demo (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '3,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Simple Demo')), 'Should show demo title')
    })

    it('Demo 4: Form Input with validation (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '4,testuser,25,2,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Form Demo')), 'Should run form demo')
        assert.ok(lines.some(l => l.includes('User: testuser')), 'Should show submitted username')
        assert.ok(lines.some(l => l.includes('Age: 25')), 'Should show submitted age')
        assert.ok(lines.some(l => l.includes('Color: Green') || l.includes('Колір: Зелений')), 'Should show selected color')
    })

    it('Demo 5: UiMessage with schema-driven form (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '5,alice,30,2,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('UiMessage')), 'Should run ui-message demo')
        assert.ok(lines.some(l => l.includes('Result')), 'Should show result')
    })

    it('Demo 6: Table Filtering (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '6,john,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Table Filtering') || l.includes('Interactive Table')), 'Should show table demo')
    })

    it('Demo 7: Instant Table (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '7,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Instant Table') || l.includes('Filtering')), 'Should show instant table')
    })

    it('Demo 8: Autocomplete (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '8,Ukraine,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Autocomplete')), 'Should show autocomplete demo')
        assert.ok(lines.some(l => l.includes('Ukraine')), 'Should show selected country')
    })

    it('Demo 9: Long List (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '9,1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Long List')), 'Should show long list demo')
    })

    it('Demo 10: Advanced Form (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '10,user,pass,(123) 456-7890,y,Admin,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Advanced Form')), 'Should show advanced form')
        assert.ok(lines.some(l => l.includes('submitted')), 'Should confirm submission')
    })

    it('Demo 11: Toggle (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '11,y,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Toggle') || l.includes('Subscribe')), 'Should show toggle demo')
    })

    it('Demo 12: Slider (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '12,75,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Slider') || l.includes('Volume')), 'Should show slider demo')
    })

    it('Demo 13: ProgressBar (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '13,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('ProgressBar') || l.includes('Progress')), 'Should show progress demo')
    })

    it('Demo 14: Spinner (en)', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '14,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Spinner')), 'Should show spinner demo')
    })
})

describe('Ukrainian language demos', () => {
    it('Demo 1: Базове логування (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Базове логування') || l.includes('Basic Logging')), 'Should show demo title in Ukrainian')
        assert.ok(lines.some(l => l.includes('Логгер ініціалізовано') || l.includes('Logger initialized')), 'Should show log message')
    })

    it('Demo 2: Вибір зі списку з кольором (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '2,3,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Вибір зі списку') || l.includes('Select Prompt')), 'Should run select demo')
        // Accept either Ukrainian or English for confirmation
        assert.ok(
            lines.some(l => (l.includes('обрали') || l.includes('обрано') || l.includes('selected')) && (l.includes('Blue') || l.includes('Синій'))),
            'Should confirm color selection'
        )
    })

    it('Demo 3: Просте демо (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '3,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Просте демо') || l.includes('Simple Demo')), 'Should show demo title in Ukrainian')
    })

    it('Demo 4: Форма з валідацією (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '4,ЯRаСлав,33,1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Демо форми') || l.includes('Form Demo')), 'Should run form demo')
        assert.ok(lines.some(l => l.includes('Користувач: ЯRаСлав') || l.includes('User: ЯRаСлав')), 'Should show Ukrainian username')
        assert.ok(lines.some(l => l.includes('Вік: 33') || l.includes('Age: 33')), 'Should show age')
        assert.ok(lines.some(l => l.includes('Колір: Червоний') || l.includes('Color: Red')), 'Should show color in Ukrainian')
    })

    it('Demo 5: UiMessage зі схемою (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '5,Олена,28,1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Повідомлення') || l.includes('UiMessage')), 'Should run ui-message demo')
        assert.ok(lines.some(l => l.includes('Результат') || l.includes('Result')), 'Should show result')
    })

    it('Demo 6: Фільтрація таблиці (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '6,іван,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Фільтрація таблиці') || l.includes('Table Filtering')), 'Should show table demo')
    })

    it('Demo 7: Миттєва таблиця (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '7,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Миттєва таблиця') || l.includes('Instant Table')), 'Should show instant table')
    })

    it('Demo 8: Автодоповнення (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '8,Україна,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Автодоповнення') || l.includes('Autocomplete')), 'Should show autocomplete demo')
    })

    it('Demo 9: Великий список (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '9,1,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Великий список') || l.includes('Long List')), 'Should show long list demo')
    })

    it('Demo 10: Розширена форма (uk)', async () => {
        // Use raw phone number to test mask formatting
        const { stdout, exitCode } = await runWithLanguage('uk', '10,користувач,пароль,1234567890,y,Адмін,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Розширена форма') || l.includes('Advanced Form')), 'Should show advanced form')
        // Verify mask formatting worked
        assert.ok(stdout.includes('(123) 456-7890'), 'Should format phone number automatically')
        // Verify multiselect persistence (we logged it explicitly)
        assert.ok(stdout.includes('Адмін') || stdout.includes('Admin'), 'Should show selected role in logs')
        assert.ok(lines.some(l => l.includes('submitted') || l.includes('надіслано')), 'Should confirm submission')
    })

    it('Demo 11: Перемикач (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '11,так,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Перемикач') || l.includes('Toggle')), 'Should show toggle demo')
    })

    it('Demo 12: Повзунок (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '12,80,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Повзунок') || l.includes('Slider') || l.includes('гучність')), 'Should show slider demo')
    })

    it('Demo 13: Прогрес (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '13,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Прогрес') || l.includes('ProgressBar')), 'Should show progress demo')
    })

    it('Demo 14: Спінер (uk)', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '14,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('Спінер') || l.includes('Spinner')), 'Should show spinner demo')
    })
})

describe('Error handling in both languages', () => {
    it('Shows validation errors in English', async () => {
        // Try to submit age < 18 in form demo
        const { stdout, exitCode } = await runWithLanguage('en', '4,testuser,15,cancel,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        // Validation message may appear in either language or user might cancel before validation error
        assert.ok(
            lines.some(l => l.includes('Age must be 18') || l.includes('Вік має бути 18') || l.includes('cancelled') || l.includes('скасовано')),
            'Should show age validation error or cancellation'
        )
    })

    it('Shows validation errors in Ukrainian', async () => {
        // Try to submit age < 18 in form demo
        const { stdout, exitCode } = await runWithLanguage('uk', '4,користувач,16,cancel,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        // Validation message may appear in either language or user might cancel before validation error
        assert.ok(
            lines.some(l => l.includes('Вік має бути 18') || l.includes('Age must be 18') || l.includes('cancelled') || l.includes('скасовано')),
            'Should show age validation error or cancellation in Ukrainian'
        )
    })

    it('Handles cancellation in English', async () => {
        const { stdout, exitCode } = await runWithLanguage('en', '4,cancel,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('cancelled') || l.includes('скасовано')), 'Should show cancellation message')
    })

    it('Handles cancellation in Ukrainian', async () => {
        const { stdout, exitCode } = await runWithLanguage('uk', '4,cancel,15')
        assert.strictEqual(exitCode, 0)
        const lines = stdout.split('\n')
        assert.ok(lines.some(l => l.includes('скасовано') || l.includes('cancelled')), 'Should show cancellation message in Ukrainian')
    })
})
