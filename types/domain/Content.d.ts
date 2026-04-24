/**
 * @typedef {Object} OLMUIElements
 * @property {string|any} [h1] Heading 1
 * @property {string|any} [h2] Heading 2
 * @property {string|any} [h3] Heading 3
 * @property {string|any} [p] Paragraph
 * @property {string|any} [text] Text Node
 * @property {Array<any>|any} [ul] Unordered List
 * @property {Array<any>|any} [ol] Ordered List
 * @property {boolean|any} [hr] Horizontal Rule
 * @property {boolean|any} [br] Line Break
 * @property {any} [div] Div Container
 * @property {any} [span] Span Container
 * @property {any} [a] Link / Anchor
 * @property {any} [img] Image
 * @property {any} [form] OLMUI Form component
 * @property {any} [alert] OLMUI Alert component
 * @property {any} [badge] OLMUI Badge component
 * @property {any} [table] OLMUI Table component
 * @property {any} [breadcrumbs] OLMUI Breadcrumbs component
 * @property {any} [tabs] OLMUI Tabs component
 * @property {any} [steps] OLMUI Steps component
 * @property {any} [toast] OLMUI Toast component
 * @property {any} [select] OLMUI Select prompt
 * @property {any} [input] OLMUI Input prompt
 * @property {any} [password] OLMUI Password prompt
 * @property {any} [confirm] OLMUI Confirm prompt
 * @property {any} [multiselect] OLMUI Multiselect prompt
 * @property {any} [mask] OLMUI Mask prompt
 * @property {any} [autocomplete] OLMUI Autocomplete prompt
 * @property {any} [slider] OLMUI Slider prompt
 * @property {any} [toggle] OLMUI Toggle prompt
 * @property {any} [datetime] OLMUI DateTime prompt
 * @property {any} [next] OLMUI Next prompt
 * @property {any} [pause] OLMUI Pause prompt
 * @property {any} [tree] OLMUI Tree prompt
 * @property {any} [spinner] OLMUI Spinner component
 * @property {any} [progress] OLMUI Progress component
 * @property {any} [sortable] OLMUI Sortable component
 * @property {any} [markdown] OLMUI Markdown component
 */
/**
 * @typedef {Partial<Content & OLMUIElements> & Record<string, any>} ContentData
 */
export class Content extends Model {
    static content: {
        type: string;
        help: string;
    };
    static children: {
        type: string;
        model: typeof Content;
        help: string;
    };
    /**
     * @param {ContentData | string} [data={}]
     * @param {import('@nan0web/types').ModelOptions} [options={}]
     */
    constructor(data?: ContentData | string, options?: import("@nan0web/types").ModelOptions);
    /** @type {string|undefined} Content */ content: string | undefined;
    /** @type {Array<Content>|undefined} Children */ children: Array<Content> | undefined;
    /** @type {string|any} Heading 1 */ h1: string | any;
    /** @type {string|any} Heading 2 */ h2: string | any;
    /** @type {string|any} Heading 3 */ h3: string | any;
    /** @type {string|any} Paragraph */ p: string | any;
    /** @type {string|any} Text Node */ text: string | any;
    /** @type {Array<any>|any} Unordered List */ ul: Array<any> | any;
    /** @type {Array<any>|any} Ordered List */ ol: Array<any> | any;
    /** @type {boolean|any} Horizontal Rule */ hr: boolean | any;
    /** @type {boolean|any} Line Break */ br: boolean | any;
    /** @type {any} Div Container */ div: any;
    /** @type {any} Span Container */ span: any;
    /** @type {any} Link / Anchor */ a: any;
    /** @type {any} Image */ img: any;
    /** @type {any} OLMUI Form component */ form: any;
    /** @type {any} OLMUI Alert component */ alert: any;
    /** @type {any} OLMUI Badge component */ badge: any;
    /** @type {any} OLMUI Table component */ table: any;
    /** @type {any} OLMUI Breadcrumbs component */ breadcrumbs: any;
    /** @type {any} OLMUI Tabs component */ tabs: any;
    /** @type {any} OLMUI Steps component */ steps: any;
    /** @type {any} OLMUI Toast component */ toast: any;
    /** @type {any} OLMUI Select prompt */ select: any;
    /** @type {any} OLMUI Input prompt */ input: any;
    /** @type {any} OLMUI Password prompt */ password: any;
    /** @type {any} OLMUI Confirm prompt */ confirm: any;
    /** @type {any} OLMUI Multiselect prompt */ multiselect: any;
    /** @type {any} OLMUI Mask prompt */ mask: any;
    /** @type {any} OLMUI Autocomplete prompt */ autocomplete: any;
    /** @type {any} OLMUI Slider prompt */ slider: any;
    /** @type {any} OLMUI Toggle prompt */ toggle: any;
    /** @type {any} OLMUI DateTime prompt */ datetime: any;
    /** @type {any} OLMUI Next prompt */ next: any;
    /** @type {any} OLMUI Pause prompt */ pause: any;
    /** @type {any} OLMUI Tree prompt */ tree: any;
    /** @type {any} OLMUI Spinner component */ spinner: any;
    /** @type {any} OLMUI Progress component */ progress: any;
    /** @type {any} OLMUI Sortable component */ sortable: any;
    /** @type {any} OLMUI Markdown component */ markdown: any;
}
export type OLMUIElements = {
    /**
     * Heading 1
     */
    h1?: string | any;
    /**
     * Heading 2
     */
    h2?: string | any;
    /**
     * Heading 3
     */
    h3?: string | any;
    /**
     * Paragraph
     */
    p?: string | any;
    /**
     * Text Node
     */
    text?: string | any;
    /**
     * Unordered List
     */
    ul?: Array<any> | any;
    /**
     * Ordered List
     */
    ol?: Array<any> | any;
    /**
     * Horizontal Rule
     */
    hr?: boolean | any;
    /**
     * Line Break
     */
    br?: boolean | any;
    /**
     * Div Container
     */
    div?: any;
    /**
     * Span Container
     */
    span?: any;
    /**
     * Link / Anchor
     */
    a?: any;
    /**
     * Image
     */
    img?: any;
    /**
     * OLMUI Form component
     */
    form?: any;
    /**
     * OLMUI Alert component
     */
    alert?: any;
    /**
     * OLMUI Badge component
     */
    badge?: any;
    /**
     * OLMUI Table component
     */
    table?: any;
    /**
     * OLMUI Breadcrumbs component
     */
    breadcrumbs?: any;
    /**
     * OLMUI Tabs component
     */
    tabs?: any;
    /**
     * OLMUI Steps component
     */
    steps?: any;
    /**
     * OLMUI Toast component
     */
    toast?: any;
    /**
     * OLMUI Select prompt
     */
    select?: any;
    /**
     * OLMUI Input prompt
     */
    input?: any;
    /**
     * OLMUI Password prompt
     */
    password?: any;
    /**
     * OLMUI Confirm prompt
     */
    confirm?: any;
    /**
     * OLMUI Multiselect prompt
     */
    multiselect?: any;
    /**
     * OLMUI Mask prompt
     */
    mask?: any;
    /**
     * OLMUI Autocomplete prompt
     */
    autocomplete?: any;
    /**
     * OLMUI Slider prompt
     */
    slider?: any;
    /**
     * OLMUI Toggle prompt
     */
    toggle?: any;
    /**
     * OLMUI DateTime prompt
     */
    datetime?: any;
    /**
     * OLMUI Next prompt
     */
    next?: any;
    /**
     * OLMUI Pause prompt
     */
    pause?: any;
    /**
     * OLMUI Tree prompt
     */
    tree?: any;
    /**
     * OLMUI Spinner component
     */
    spinner?: any;
    /**
     * OLMUI Progress component
     */
    progress?: any;
    /**
     * OLMUI Sortable component
     */
    sortable?: any;
    /**
     * OLMUI Markdown component
     */
    markdown?: any;
};
export type ContentData = Partial<Content & OLMUIElements> & Record<string, any>;
import { Model } from '@nan0web/types';
