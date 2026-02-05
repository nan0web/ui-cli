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
export function validateDate(value: any, propName: string, componentName: string): void;
/**
 * Validates that a value is a string.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateString(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a function.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateFunction(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a boolean.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateBoolean(value: any, propName: string, componentName: string, required?: boolean): void;
/**
 * Validates that a value is a number.
 * @param {any} value
 * @param {string} propName
 * @param {string} componentName
 * @param {boolean} required
 * @throws {TypeError} if validation fails
 */
export function validateNumber(value: any, propName: string, componentName: string, required?: boolean): void;
