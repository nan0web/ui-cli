/**
 * Table Component.
 * Can be static (display only) or interactive (filter/select).
 *
 * When `interactive === false`, returns a synchronous View (stringifiable).
 * Otherwise returns an interactive Prompt for CLI usage.
 */
export function Table(props: any): {
    $$typeof: symbol;
    type: string;
    props: any;
};
