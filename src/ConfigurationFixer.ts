import { FieldConfiguration } from "./FieldConfigurationTypes";
import { FormHooks, FormConfiguration, ResolvedFormConfiguration, UpdateRule } from "./FormConfigurationTypes";

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
            behavior: this.fixHooks(formConfiguration.behavior),
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
        this.checkNoCycles(resolved.rules);
        return resolved;
    }

    /**
     * Throws when the update rules form a cycle (a field observing itself, directly or through other fields), naming its path
     * @param rules the update rules
     */
    private checkNoCycles(rules: UpdateRule[]): void {
        const observers = new Map<string, string[]>();
        rules.forEach(rule => observers.set(rule.name, (observers.get(rule.name) ?? []).concat(rule.update)));

        const acyclic = new Set<string>(); // Fields from which no cycle starts
        const visit = (name: string, path: string[]): void => {
            if (path.includes(name)) {
                const cycle = path.slice(path.indexOf(name)).concat(name);
                throw new Error("Update rules form a cycle: " + cycle.join(' → '));
            }
            if (acyclic.has(name)) {
                return;
            }
            (observers.get(name) ?? []).forEach(observer => visit(observer, path.concat(name)));
            acyclic.add(name);
        };
        observers.forEach((_, name) => visit(name, []));
    }

    /** Completes the form hooks with no-op defaults, also replacing hooks explicitly set to undefined */
    private fixHooks(hooks: Partial<FormHooks> = {}): FormHooks {
        return {
            beforeInit: hooks.beforeInit ?? (() => {}),
            afterInit: hooks.afterInit ?? (() => {}),
            beforeUpdate: hooks.beforeUpdate ?? (() => true),
            afterUpdate: hooks.afterUpdate ?? (() => {}),
        };
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
