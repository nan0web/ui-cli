/**
 * Core Component logic.
 *
 * Defines the contract for View (static) and Prompt (interactive) components.
 */

export const ComponentSymbol = Symbol.for('ui.component');
export const PromptSymbol = Symbol.for('ui.prompt');

/**
 * Creates a Static View Component.
 * These components are synchronous and can be stringified directly.
 *
 * @param {string} displayName - Name of the component (e.g. 'Alert').
 * @param {Object} props - Props passed to the component.
 * @param {Function} formatFn - Pure function (props) => string.
 */
export function createView(displayName, props, formatFn) {
    const component = {
        $$typeof: ComponentSymbol,
        type: displayName,
        props,
    };

    // Magic: toString calls the formatter
    // We also implement nodejs.util.inspect.custom so console.log works directly
    const toString = () => {
        try {
            return formatFn(props);
        } catch (originalError) {
            const e = /** @type {Error} */ (originalError);
            return `[${displayName} Error: ${e.message}]`;
        }
    };

    Object.defineProperty(component, 'toString', {
        value: toString,
        enumerable: false
    });

    Object.defineProperty(component, Symbol.for('nodejs.util.inspect.custom'), {
        value: () => toString(),
        enumerable: false
    });

    return component;
}

/**
 * Creates an Interactive Prompt Component.
 * These components are asynchronous and require `render()` or `await` handling.
 *
 * @param {string} displayName - Name of the component.
 * @param {Object} props - Props.
 * @param {Function} executorFn - Async function (props) => Promise<result>.
 */
export function createPrompt(displayName, props, executorFn) {
    const component = {
        $$typeof: PromptSymbol,
        type: displayName,
        props,
        execute: () => executorFn(props)
    };

    // Prompts cannot be stringified meaningfully
    const toString = () => `[Prompt: ${displayName}]`;

    Object.defineProperty(component, 'toString', {
        value: toString,
        enumerable: false
    });

    Object.defineProperty(component, Symbol.for('nodejs.util.inspect.custom'), {
        value: toString,
        enumerable: false
    });

    return component;
}
