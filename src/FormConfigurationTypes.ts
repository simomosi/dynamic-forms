import { FieldConfiguration, ResolvedFieldConfiguration, UpdateData } from './FieldConfigurationTypes';

/** Form configuration as written by users: only `id` is required, the library completes the rest. */
export interface FormConfiguration {
    id: string,
    debug?: boolean,
    behavior?: Partial<FormHooks>,
    fields?: FieldConfiguration[],
    rules?: UpdateRule[],
    init?: InitialisationRule[]
}

/** Form configuration checked and completed with defaults by resolveConfiguration. */
export interface ResolvedFormConfiguration {
    id: string,
    debug: boolean,
    behavior: FormHooks,
    fields: ResolvedFieldConfiguration[],
    rules: UpdateRule[],
    init: InitialisationRule[]
}

export interface FormHooks {
    beforeUpdate: (subjectName: string) => boolean,
    afterUpdate: (subjectName: string) => void
    beforeInit: () => void,
    afterInit: () => void
}

export interface UpdateRule {
    name: string,
    update: string[],
    additionalData?: string[],
    externalData?: (data: UpdateData, subjectName: string) => UpdateData
}

export interface InitialisationRule {
    name: string,
    value?: unknown
}
