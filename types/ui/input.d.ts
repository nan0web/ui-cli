/**
 * Helper to ask a question
 * @param {string} question
 */
export function ask(question: string): Promise<any>;
export function createInput(stops?: any[]): (question: string, loop?: boolean | Function | undefined, nextQuestion?: false | Function | undefined) => Promise<Input>;
export class Input {
    constructor(input?: {});
    value: string;
    stops: any[];
    get cancelled(): boolean;
    toString(): string;
    #private;
}
export default createInput;
