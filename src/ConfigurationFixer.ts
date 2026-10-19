import { FieldConfiguration } from "./FieldConfigurationTypes";
import { FormHooks, FormConfiguration, ResolvedFormConfiguration } from "./FormConfigurationTypes";

export class ConfigurationFixer {
    /**
     * Validates the form configuration and returns a copy completed with defaults. The given configuration is not modified.
     */
    public fix(formHtmlElement: HTMLFormElement | null, formConfiguration: FormConfiguration): ResolvedFormConfiguration {
        if (!formConfiguration.id) {
            throw new Error("Required field in form configuration: id");
        }
        if (!formHtmlElement) {
            throw new Error("Form not found for id " + formConfiguration.id);
        }
        const resolved: ResolvedFormConfiguration = {
            id: formConfiguration.id,
            debug: formConfiguration.debug ?? false,
            behavior: this.fixBehavior(formConfiguration.behavior),
            fields: this.addMissingFields(formHtmlElement, formConfiguration.fields),
            rules: formConfiguration.rules ?? [],
            init: formConfiguration.init ?? [],
        };

        // Check "name" property in field configuration and update/init rules
        for(let i = 0; i<resolved.fields.length; i++) {
            if (!resolved.fields[i].name) {
                throw new Error("Missing required name in field configuration #"+i);
            }
        }
        for(let i = 0; i<resolved.rules.length; i++) {
            if (!resolved.rules[i].name) {
                throw new Error("Missing required name in update rule #"+i);
            }
        }
        for(let i = 0; i<resolved.init.length; i++) {
            if (!resolved.init[i].name) {
                throw new Error("Missing required name in initialisation rule #"+i);
            }
        }
        return resolved;
    }

    private fixBehavior(behavior: Partial<FormHooks>|undefined): FormHooks {
        const voidBehavior: FormHooks = {
            beforeInit: () => {},
            afterInit: () => {},
            beforeUpdate: () => true,
            afterUpdate: () => {},
        }
        return {...voidBehavior, ...behavior};
    }

    /**
     * Returns the field configurations completed with the fields present in the form but not in fields configuration
     * @param formHtmlElement
     * @param configurationFields
     * @returns
     */
    private addMissingFields(formHtmlElement: HTMLFormElement, configurationFields: FieldConfiguration[] = []): FieldConfiguration[] {
        const fields = [...configurationFields];
        const namesInConfigurations = new Set<string>();
        fields.forEach(v => namesInConfigurations.add(v.name));

        const namesInForm = new Set<string>();
        formHtmlElement
        .querySelectorAll('[name]')
        .forEach((value: Element) => {
            const fieldWithContext = value as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement;
            namesInForm.add(fieldWithContext.name);
        });

        namesInForm.forEach(fieldName => {
            if (!namesInConfigurations.has(fieldName)) {
                fields.push({
                    name: fieldName
                });
            }
        });
        return fields;
    }
}
