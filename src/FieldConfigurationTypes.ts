/**
 * Update Data: the values a field hook, makeUrl, makeBody, fullFetchConfig and externalData receive, keyed by field name.
 * Holds the subject value, the additionalData values and the externalData result.
 */
export type UpdateData = Record<string, any>;

/**
 * Field configuration. The field kind comes from the html element, so every field accepts every key:
 * `select` is read only by selects, `checkbox` only by checkboxes.
 */
export interface FieldConfiguration {
    name: string,
    io?: FieldIoHooks,
    fetch?: FieldFetchConfiguration,
    behavior?: FieldHooks,
    select?: SelectConfiguration,
    checkbox?: CheckboxConfiguration
}

export interface FieldIoHooks {
    event?: string,
    get?: (htmlElement: HTMLElement | NodeList) => any,
    set?: (htmlElement: HTMLElement | NodeList, value: any) => void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: UpdateData) => string,
    makeBody?: (data: UpdateData) => any,
    fullFetchConfig?: (data: UpdateData) => RequestInit
}

export interface FieldHooks {
    clear?: (htmlElement: HTMLElement | NodeList) => void,
    beforeUpdate?: (htmlElement: HTMLElement | NodeList, data: UpdateData, subjectName: string|null) => boolean,
    updateStatus?: (htmlElement: HTMLElement | NodeList, data: UpdateData, subjectName: string|null) => void,
    afterUpdate?: (htmlElement: HTMLElement | NodeList, data: UpdateData, subjectName: string|null) => boolean,
}

export interface SelectConfiguration {
    postProcessData?: (htmlElement: Element | NodeList, data: object[]) => object[],
    saveData?: (htmlElement: Element | NodeList, data: object[]) => void,
    clearOnParentVoid?: boolean
}

export interface CheckboxConfiguration {
    booleanValue?: boolean
}
