export interface FieldConfiguration {
    name: string,
    io?: FieldIoConfiguration,
    fetch?: FieldFetchConfiguration,
    behavior?: FieldBehaviorConfiguration
}

export interface FieldIoConfiguration {
    event?: string,
    get?: (htmlElement: Element | NodeList) => any,
    set?: (htmlElement: Element | NodeList, value: any) => void,
}

export interface FieldFetchConfiguration {
    method?: string,
    makeUrl?: (data: object) => string,
    makeBody?: (data: object) => any,
    fullFetchConfig?: object
}

export interface FieldBehaviorConfiguration {
    clear?: (htmlElement: Element | NodeList) => void,
    beforeUpdate?: (htmlElement: Element | NodeList, data: object, subjectName: string|null) => boolean,
    updateStatus?: (htmlElement: Element | NodeList, data: object, subjectName: string|null) => void,
    afterUpdate?: (htmlElement: Element | NodeList, data: object, subjectName: string|null) => boolean,
}



export interface DropdownConfiguration extends FieldConfiguration {
    dropdown?: DropdownDropdownConfiguration
}

export interface DropdownDropdownConfiguration {
    postProcessData: (htmlElement: Element | NodeList, data: object[]) => object[],
    saveData: (htmlElement: Element | NodeList, data: object[]) => void,
    clearOnParentVoid: boolean
}



export interface CheckboxConfiguration extends FieldConfiguration{
    checkbox?: CheckboxCheckboxConfiguration
}

export interface CheckboxCheckboxConfiguration {
    booleanValue: boolean
}