import { FieldConfiguration } from "./FieldConfigurationTypes";
import { FormBehavior, FormConfiguration } from "./FormConfigurationTypes";

export class ConfigurationFixer {
    public fix(formHtmlElement: HTMLFormElement | null, formConfiguration: FormConfiguration): Required<FormConfiguration> {
        if (!formConfiguration.id) {
            throw new Error("Required field in form configuration: id");
        }
        if (!formHtmlElement) {
            throw new Error("Form not found for id " + formConfiguration.id);
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

        // Check "name" property in field configuration and update/init rules
        for(let i = 0; i<formConfiguration.fields.length; i++) {
            if (!formConfiguration.fields[i].name) {
                throw new Error("Missing required name in field configuration #"+i);
            }
        }
        for(let i = 0; i<formConfiguration.rules.length; i++) {
            if (!formConfiguration.rules[i].name) {
                throw new Error("Missing required name in update rule #"+i);
            }
        }
        for(let i = 0; i<formConfiguration.init.length; i++) {
            if (!formConfiguration.init[i].name) {
                throw new Error("Missing required name in initialisation rule #"+i);
            }
        }
        return formConfiguration;
    }

    private fixBehavior(behavior: FormBehavior|undefined): FormBehavior {
        const voidBehavior = {
            beforeInit: () => {},
            afterInit: () => {},
            beforeUpdate: () => true,
            afterUpdate: () => {},
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
        .forEach((value: Element) => {
            const fieldWithContext = value as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement;
            namesInForm.add(fieldWithContext.name);
        });

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