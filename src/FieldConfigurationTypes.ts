/**
 * Update Data: the values a field hook, makeUrl, makeBody, fullFetchConfig and externalData receive, keyed by field name.
 * Holds the subject value, the additionalData values and the externalData result.
 */
export type UpdateData = Record<string, any>;

/** The html elements hooks receive by default. A field made of another element, such as a form-associated custom element, states its type in FieldConfiguration. */
export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Field configuration. The field kind comes from the html element, so every field accepts every key:
 * `select` is read only by selects, `checkbox` only by checkboxes.
 * TypeScript cannot see the html, so `E` states the element type the hooks receive
 * and `V` the value type io.get returns and io.set receives.
 */
export interface FieldConfiguration<E extends HTMLElement = FieldElement, V = any> {
    name: string,
    io?: FieldIoHooks<E, V>,
    fetch?: FieldFetchConfiguration,
    behavior?: FieldHooks<E>,
    select?: SelectConfiguration<E>,
    checkbox?: CheckboxConfiguration
}

// Every hook receives all the elements sharing the field name, even when there is only one.
// Hooks are declared as methods, so a FieldConfiguration<HTMLSelectElement> is still a FieldConfiguration.
export interface FieldIoHooks<E extends HTMLElement = FieldElement, V = any> {
    event?: string,
    /**
     * Subscribes to the field changes, calling `onChange` on each one, and returns the function that unsubscribes, called when the form is destroyed.
     * `standard` listens to io.event on the elements and returns its own unsubscribe function.
     */
    listen?(htmlElement: NodeListOf<E>, onChange: () => void, standard: () => () => void): () => void,
    /** `standard` reads the value the way the library does for this kind of field. */
    get?(htmlElement: NodeListOf<E>, standard: () => V): V,
    /** `standard` writes `value` the way the library does for this kind of field. */
    set?(htmlElement: NodeListOf<E>, value: V, standard: () => void): void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: UpdateData) => string,
    makeBody?: (data: UpdateData) => any,
    fullFetchConfig?: (data: UpdateData) => RequestInit
}

export interface FieldHooks<E extends HTMLElement = FieldElement> {
    /** `standard` clears the field the way the library does for this kind of field. */
    clear?(htmlElement: NodeListOf<E>, standard: () => void): void,
    beforeUpdate?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null): boolean,
    /**
     * `signal` is aborted when the form is destroyed or a newer Update of the field replaces this one: pass it to the remote calls of the hook,
     * and check it before writing the field after waiting for anything else.
     * `standard` updates the status the way the library does: nothing, or for a select loading and saving its Options.
     */
    updateStatus?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null, signal: AbortSignal, standard: () => Promise<void>): void,
    afterUpdate?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null): void,
}

/** One of the Options a select shows: the default saveData writes it as `<option value="value">text</option>`. */
export interface SelectOption {
    value: string | number,
    text: string
}

export interface SelectConfiguration<E extends HTMLElement = FieldElement> {
    /**
     * Replaces the remote call: returns the data to turn into Options, which postProcessData receives.
     * Receives the parameters of updateStatus; `signal` is aborted when the form is destroyed or a newer Update of the field replaces this one,
     * and the data loaded then is discarded.
     * `standard` makes the remote call and resolves with the response parsed as json.
     */
    loadOptions?(htmlElement: NodeListOf<E>, data: UpdateData, subjectName: string|null, signal: AbortSignal, standard: () => Promise<any>): any,
    /** Receives the remote call response as parsed json, and returns the Options to save. `standard` returns the response as it is. */
    postProcessData?(htmlElement: NodeListOf<E>, data: any, standard: () => any): SelectOption[],
    /**
     * Receives the Options returned by postProcessData, or the response itself when there is no postProcessData.
     * `standard` clears the select and writes an `<option>` for each Option, plus an empty one when needed.
     */
    saveData?(htmlElement: NodeListOf<E>, data: SelectOption[], standard: () => void): void,
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
