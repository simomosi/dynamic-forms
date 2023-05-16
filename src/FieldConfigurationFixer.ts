import { FieldConfiguration } from "./FieldConfigurationTypes";

export class FieldConfigurationFixer {

    public fix(formHtmlElement: HTMLFormElement, configurationFields: FieldConfiguration[] = []): FieldConfiguration[] {
        return this.addMissingFields(formHtmlElement, configurationFields);
    }

    /**
     * Creates a configuration for fields present in the form but not in fields configuration
     * @param formHtmlElement 
     * @param configurationFields 
     * @returns 
     */
    private addMissingFields(formHtmlElement: HTMLFormElement, configurationFields: FieldConfiguration[] = []): FieldConfiguration[] {
        const configurationFieldsNames = new Set<string>();
        configurationFields.forEach(v => configurationFieldsNames.add(v.name));

        const formFieldsNames = new Set<string>();
        formHtmlElement
        .querySelectorAll('[name]')
        .forEach((v: HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement) => formFieldsNames.add(v.name));

        formFieldsNames.forEach(fieldName => {
            if (!configurationFieldsNames.has(fieldName)) {
                configurationFields.push({
                    name: fieldName
                });
            }
        });
        return configurationFields;
    }
}