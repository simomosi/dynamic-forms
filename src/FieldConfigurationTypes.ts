/**
 * Update Data: the values a field hook, makeUrl, makeBody, fullFetchConfig and externalData receive, keyed by field name.
 * Holds the subject value, the additionalData values and the externalData result.
 */
export type UpdateData = Record<string, any>;

/** The html elements a field can be made of. */
export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Field configuration. The field kind comes from the html element, so every field accepts every key:
 * `select` is read only by selects, `checkbox` only by checkboxes.
 * TypeScript cannot see the html, so `E` states the element type the hooks receive
 * and `V` the value type io.get returns and io.set receives.
 */
export interface FieldConfiguration<E extends FieldElement = FieldElement, V = any> {
    name: string,
    io?: FieldIoHooks<E, V>,
    fetch?: FieldFetchConfiguration,
    behavior?: FieldHooks<E>,
    select?: SelectConfiguration<E>,
    checkbox?: CheckboxConfiguration
}

// Every hook receives all the elements sharing the field name, even when there is only one.
// Hooks are declared as methods, so a FieldConfiguration<HTMLSelectElement> is still a FieldConfiguration.
export interface FieldIoHooks<E extends FieldElement = FieldElement, V = any> {
    event?: string,
    get?(htmlElement: NodeListOf<E>): V,
    set?(htmlElement: NodeListOf<E>, value: V): void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: UpdateData) => string,
    makeBody?: (data: UpdateData) => any,
    fullFetchConfig?: (data: UpdateData) => RequestInit
}

export interface FieldHooks<E extends FieldElement = FieldElement> {
    clear?(htmlElement: NodeListOf<E>): void,
    beforeUpdate?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null): boolean,
    /** `signal` is aborted when the form is destroyed: pass it to the remote calls of the hook. */
    updateStatus?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null, signal: AbortSignal): void,
    afterUpdate?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null): void,
}

/** One of the Options a select shows: the default saveData writes it as `<option value="value">text</option>`. */
export interface SelectOption {
    value: string | number,
    text: string
}

export interface SelectConfiguration<E extends FieldElement = FieldElement> {
    /** Receives the remote call response as parsed json, and returns the Options to save. */
    postProcessData?(htmlElement: NodeListOf<E>, data: any): SelectOption[],
    /** Receives the Options returned by postProcessData, or the response itself when there is no postProcessData. */
    saveData?(htmlElement: NodeListOf<E>, data: SelectOption[]): void,
    clearOnParentVoid?: boolean
}

export interface CheckboxConfiguration {
    booleanValue?: boolean
}

/** Field configuration completed with defaults by resolveConfiguration: every key is present. */
export interface ResolvedFieldConfiguration {
    name: string,
    io: FieldIoHooks & { event: string },
    fetch: FieldFetchConfiguration & { method: string },
    behavior: FieldHooks,
    select: SelectConfiguration & { clearOnParentVoid: boolean },
    checkbox: CheckboxConfiguration & { booleanValue: boolean },
}
