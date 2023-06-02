import { FieldConfiguration } from "./FieldConfigurationTypes";
import { FormBehavior, FormConfiguration } from "./FormConfigurationTypes";

export class ConfigurationFixer {
    public fix(formHtmlElement: HTMLFormElement, formConfiguration: FormConfiguration): FormConfiguration {
        formConfiguration.behavior = this.fixBehavior(formConfiguration.behavior);
        formConfiguration.fields = this.addMissingFields(formHtmlElement, formConfiguration.fields);
        return formConfiguration;
    }

    private fixBehavior(behavior: FormBehavior|undefined): FormBehavior {
        if (!behavior) {
            behavior = {};
        }
        behavior.beforeInit = behavior.beforeInit ?? (() => {});
        behavior.afterInit = behavior.afterInit ?? (() => {});
        behavior.beforeUpdate = behavior.beforeUpdate ?? ((subjectName) => true);
        behavior.afterUpdate = behavior.afterUpdate ?? ((subjectName) => {});
        return behavior;
    }

    /**
     * Creates a configuration for fields present in the form but not in fields configuration
     * @param formHtmlElement 
     * @param configurationFields 
     * @returns 
     */
    private addMissingFields(formHtmlElement: HTMLFormElement, configurationFields: FieldConfiguration[]): FieldConfiguration[] {
        if (!configurationFields) {
            configurationFields = [];
        }
        const namesInConfigurations = new Set<string>();
        configurationFields.forEach(v => namesInConfigurations.add(v.name));

        const namesInForm = new Set<string>();
        formHtmlElement
        .querySelectorAll('[name]')
        .forEach((v: HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement) => namesInForm.add(v.name));

        namesInForm.forEach(fieldName => {
            if (!namesInConfigurations.has(fieldName)) {
                configurationFields.push({
                    name: fieldName
                });
            }
        });
        return configurationFields;
    }
}