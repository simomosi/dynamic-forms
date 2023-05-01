export interface FieldConfiguration {
    name: string,
    io?: FieldIoConfiguration,
    fetch?: FieldFetchConfiguration,
    behavior?: FieldBehaviorConfiguration
}

export interface FieldIoConfiguration {
    event?: string,
    get?: (htmlElement: HTMLElement | NodeList) => any,
    set?: (htmlElement: HTMLElement | NodeList, value: any) => void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: object) => string,
    makeBody?: (data: object) => any,
    fullFetchConfig?: object
}

export interface FieldBehaviorConfiguration {
    clear?: (htmlElement: HTMLElement | NodeList) => void,
    beforeUpdate?: (htmlElement: HTMLElement | NodeList, data: object, subjectName: string|null) => boolean,
    updateStatus?: (htmlElement: HTMLElement | NodeList, data: object, subjectName: string|null) => void,
    afterUpdate?: (htmlElement: HTMLElement | NodeList, data: object, subjectName: string|null) => boolean,
}



export interface DropdownConfiguration extends FieldConfiguration {
    dropdown?: DropdownDropdownConfiguration
}

export interface DropdownDropdownConfiguration {
    postProcessData?: (htmlElement: Element | NodeList, data: object[]) => object[],
    saveData?: (htmlElement: Element | NodeList, data: object[]) => void,
    clearOnParentVoid?: boolean
}



export interface CheckboxConfiguration extends FieldConfiguration{
    checkbox?: CheckboxCheckboxConfiguration
}

export interface CheckboxCheckboxConfiguration {
    booleanValue?: boolean
}