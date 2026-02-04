/**
 * Creates a Static View Component.
 * These components are synchronous and can be stringified directly.
 *
 * @param {string} displayName - Name of the component (e.g. 'Alert').
 * @param {Object} props - Props passed to the component.
 * @param {Function} formatFn - Pure function (props) => string.
 */
export function createView(displayName: string, props: any, formatFn: Function): {
    $$typeof: symbol;
    type: string;
    props: any;
};
/**
 * Creates an Interactive Prompt Component.
 * These components are asynchronous and require `render()` or `await` handling.
 *
 * @param {string} displayName - Name of the component.
 * @param {Object} props - Props.
 * @param {Function} executorFn - Async function (props) => Promise<result>.
 */
export function createPrompt(displayName: string, props: any, executorFn: Function): {
    $$typeof: symbol;
    type: string;
    props: any;
    execute: () => any;
};
/**
 * Core Component logic.
 *
 * Defines the contract for View (static) and Prompt (interactive) components.
 */
export const ComponentSymbol: unique symbol;
export const PromptSymbol: unique symbol;
