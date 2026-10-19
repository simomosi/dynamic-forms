/**
 * Update Data: the values a field hook, makeUrl, makeBody, fullFetchConfig and externalData receive, keyed by field name.
 * Holds the subject value, the additionalData values and the externalData result.
 */
export type UpdateData = Record<string, any>;

/** The html elements a field can be made of. */
export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * What a field hook receives: the field element, or all of them when more elements share the field name
 * (checkbox and radio io hooks and clear always receive them). Narrow with `instanceof NodeList`.
 */
export type FieldHookElement<E extends FieldElement = FieldElement> = E | NodeListOf<E>;

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

// Hooks are declared as methods, so a FieldConfiguration<HTMLSelectElement> is still a FieldConfiguration.
export interface FieldIoHooks<E extends FieldElement = FieldElement, V = any> {
    event?: string,
    get?(htmlElement: FieldHookElement<E>): V,
    set?(htmlElement: FieldHookElement<E>, value: V): void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: UpdateData) => string,
    makeBody?: (data: UpdateData) => any,
    fullFetchConfig?: (data: UpdateData) => RequestInit
}

export interface FieldHooks<E extends FieldElement = FieldElement> {
    clear?(htmlElement: FieldHookElement<E>): void,
    beforeUpdate?(htmlElement: FieldHookElement<E>, data: UpdateData, subjectName: string|null): boolean,
    updateStatus?(htmlElement: FieldHookElement<E>, data: UpdateData, subjectName: string|null): void,
    afterUpdate?(htmlElement: FieldHookElement<E>, data: UpdateData, subjectName: string|null): boolean,
}

/** One of the Options a select shows: the default saveData writes it as `<option value="value">text</option>`. */
export interface SelectOption {
    value: string | number,
    text: string
}

/** Select hooks always receive all the elements sharing the field name. */
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
