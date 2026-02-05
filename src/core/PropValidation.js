/**
 * Prop validation utilities for UI components.
 * @module core/PropValidation
 */

/**
 * Validates that a value is a valid Date object or a parseable date string.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @throws {TypeError} if validation fails
 */
export function validateDate(value, propName, componentName) {
    if (value === undefined || value === null) {
        return // Optional prop
    }

    if (value instanceof Date) {
        if (isNaN(value.getTime())) {
            throw new TypeError(
                `[${componentName}] Invalid Date object for prop "${propName}". Date is invalid.`
            )
        }
        return
    }

    if (typeof value === 'string') {
        const parsed = new Date(value)
        if (isNaN(parsed.getTime())) {
            throw new TypeError(
                `[${componentName}] Invalid date string for prop "${propName}": "${value}". ` +
                `Expected a valid ISO date string (e.g., "2026-02-05" or "2026-02-05T10:30:00").`
            )
        }
        return
    }

    throw new TypeError(
        `[${componentName}] Invalid type for prop "${propName}". ` +
        `Expected Date object or date string, got ${typeof value}.`
    )
}

/**
 * Validates that a value is a string.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateString(value, propName, componentName, required = false) {
    if (value === undefined || value === null) {
        if (required) {
            throw new TypeError(
                `[${componentName}] Required prop "${propName}" is missing.`
            )
        }
        return
    }

    if (typeof value !== 'string') {
        throw new TypeError(
            `[${componentName}] Invalid type for prop "${propName}". ` +
            `Expected string, got ${typeof value}.`
        )
    }
}

/**
 * Validates that a value is a function.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateFunction(value, propName, componentName, required = false) {
    if (value === undefined || value === null) {
        if (required) {
            throw new TypeError(
                `[${componentName}] Required prop "${propName}" is missing.`
            )
        }
        return
    }

    if (typeof value !== 'function') {
        throw new TypeError(
            `[${componentName}] Invalid type for prop "${propName}". ` +
            `Expected function, got ${typeof value}.`
        )
    }
}

/**
 * Validates that a value is a boolean.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateBoolean(value, propName, componentName, required = false) {
    if (value === undefined || value === null) {
        if (required) {
            throw new TypeError(
                `[${componentName}] Required prop "${propName}" is missing.`
            )
        }
        return
    }

    if (typeof value !== 'boolean') {
        throw new TypeError(
            `[${componentName}] Invalid type for prop "${propName}". ` +
            `Expected boolean, got ${typeof value}.`
        )
    }
}

/**
 * Validates that a value is a number.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateNumber(value, propName, componentName, required = false) {
    if (value === undefined || value === null) {
        if (required) {
            throw new TypeError(
                `[${componentName}] Required prop "${propName}" is missing.`
            )
        }
        return
    }

    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(
            `[${componentName}] Invalid type for prop "${propName}". ` +
            `Expected number, got ${typeof value}.`
        )
    }
}
