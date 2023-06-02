import { FieldConfiguration } from "./FieldConfigurationTypes";
import { FormBehavior, FormConfiguration } from "./FormConfigurationTypes";

export class ConfigurationFixer {
    public fix(formHtmlElement: HTMLFormElement, formConfiguration: FormConfiguration): Required<FormConfiguration> {
        if (!formConfiguration.id) {
            throw new Error("Required field in form configuration: id");
        }
        if (formConfiguration.debug === undefined) {
            formConfiguration.debug = false;
        }
        formConfiguration.behavior = this.fixBehavior(formConfiguration.behavior);
        formConfiguration.fields = this.addMissingFields(formHtmlElement, formConfiguration.fields);
        if (!formConfiguration.rules) {
            formConfiguration.rules = [];
        }
        if (!formConfiguration.init) {
            formConfiguration.init = [];
        }
        return formConfiguration;
    }

    private fixBehavior(behavior: FormBehavior|undefined): FormBehavior {
        const voidBehavior = {
            beforeInit: () => {},
            afterInit: () => {},
            beforeUpdate: (subjectName) => true,
            afterUpdate: (subjectName) => {},
        }
        if (!behavior) {
            return voidBehavior;
        }
        return {...voidBehavior, ...behavior};
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