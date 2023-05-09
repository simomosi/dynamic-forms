import { FieldConfiguration } from './FieldConfigurationTypes';

export interface FormConfiguration {
    id: string,
    debug?: boolean,
    behavior?: FormBehavior,
    fields?: FieldConfiguration[],
    rules?: UpdateRule[],
    init?: InitialisationRule[]
}

export interface FormBehavior {
    beforeUpdate?: (subjectName: string) => boolean,
    afterUpdate?: (subjectName: string) => void
    beforeInit?: () => void,
    afterInit?: () => void
}

export interface UpdateRule {
    name: string,
    update: string[],
    additionalData?: string[],
    externalData?: (data: object, subjectName: string|null) => object
}

export interface InitialisationRule {
    name: string,
    value?: any
}