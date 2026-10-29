import { FieldConfiguration, ResolvedFieldConfiguration } from "./FieldConfigurationTypes";
import { FormHooks, FormConfiguration, InitialisationRule, ResolvedFormConfiguration, UpdateRule } from "./FormConfigurationTypes";

/**
 * Checks the form configuration and returns a copy completed with defaults, Discovered Fields included. The given configuration is not modified.
 * The checks run in steps, each trusting the previous ones: errors of the same step are listed together.
 * @param formHtmlElement the form element, null when no form has the configuration id
 * @param formConfiguration the form configuration as written by users
 * @returns the complete form configuration
 */
export function resolveConfiguration(formHtmlElement: HTMLFormElement | null, formConfiguration: FormConfiguration): ResolvedFormConfiguration {
    const id = formConfiguration.id;
    if (!id) {
        throw new Error("Required field in form configuration: id");
    }
    if (!formHtmlElement) {
        throw new Error("Form not found for id " + id);
    }
    const namesInForm = fieldNames(formHtmlElement);
    const configuredFields = formConfiguration.fields ?? [];
    const fields = configuredFields.concat(discoveredFields(configuredFields, namesInForm));
    const rules = formConfiguration.rules ?? [];
    const init = formConfiguration.init ?? [];

    checkNames(id, fields, rules, init);
    checkKnownNames(id, fields, rules, init, namesInForm);
    checkObserverSelects(id, fields, rules, formHtmlElement);
    checkNoCycles(rules);

    return {
        id,
        debug: formConfiguration.debug ?? false,
        behavior: resolveFormHooks(formConfiguration.behavior),
        fields: fields.map(resolveField),
        rules,
        init,
    };
}

/** Returns the names of the fields in the form */
function fieldNames(formHtmlElement: HTMLFormElement): Set<string> {
    const names = new Set<string>();
    formHtmlElement
    .querySelectorAll('[name]')
    .forEach((value: Element) => names.add((value as HTMLInputElement).name));
    return names;
}

/** Returns a configuration with the standard behaviour for each field in the form but not in the field configurations */
function discoveredFields(configuredFields: FieldConfiguration[], namesInForm: Set<string>): FieldConfiguration[] {
    const configuredNames = new Set(configuredFields.map(field => field.name));
    return [...namesInForm]
        .filter(name => !configuredNames.has(name))
        .map(name => ({ name }));
}

/** Throws when field configurations, update rules or initialisation rules have no name, listing every such one */
function checkNames(formId: string, fields: FieldConfiguration[], rules: UpdateRule[], init: InitialisationRule[]): void {
    const errors: string[] = [];
    const check = (kind: string, items: { name: string }[]) => items.forEach((item, i) => {
        if (!item.name) {
            errors.push(`${kind} #${i}: missing name`);
        }
    });
    check('field configuration', fields);
    check('update rule', rules);
    check('initialisation rule', init);
    throwIfAny(formId, errors);
}

/** Throws when the field configurations or the rules mention a name which is not a field of the form, listing every such name */
function checkKnownNames(formId: string, fields: FieldConfiguration[], rules: UpdateRule[], init: InitialisationRule[], namesInForm: Set<string>): void {
    const errors: string[] = [];
    fields.filter(field => !namesInForm.has(field.name))
        .forEach(field => errors.push(`field configuration "${field.name}": unknown field`));
    rules.forEach(rule => {
        if (!namesInForm.has(rule.name)) {
            errors.push(`update rule "${rule.name}": unknown subject`);
        }
        rule.update.filter(name => !namesInForm.has(name))
            .forEach(name => errors.push(`update rule "${rule.name}": unknown field "${name}" in update`));
        (rule.additionalData ?? []).filter(name => !namesInForm.has(name))
            .forEach(name => errors.push(`update rule "${rule.name}": unknown field "${name}" in additionalData`));
    });
    init.filter(rule => !namesInForm.has(rule.name))
        .forEach(rule => errors.push(`initialisation rule "${rule.name}": unknown field`));
    throwIfAny(formId, errors);
}

/** Throws when an Observer select has nowhere to load its Options from, listing every such select */
function checkObserverSelects(formId: string, fields: FieldConfiguration[], rules: UpdateRule[], formHtmlElement: HTMLFormElement): void {
    const observers = new Set(rules.flatMap(rule => rule.update));
    const errors = fields
        .filter(field => observers.has(field.name) && isSelect(formHtmlElement, field.name))
        .filter(field => !field.fetch?.makeUrl && !field.select?.loadOptions && !field.behavior?.updateStatus)
        .map(field => `field "${field.name}": an Observer select needs fetch.makeUrl, select.loadOptions or behavior.updateStatus to load its Options`);
    throwIfAny(formId, errors);
}

/** Whether the field with the given name is a select, as FieldBuilder decides it from its first element */
function isSelect(formHtmlElement: HTMLFormElement, name: string): boolean {
    const type = formHtmlElement.querySelector<HTMLSelectElement>(`[name="${name}"]`)?.type;
    return type === 'select-one' || type === 'select-multiple';
}

/** Throws one error listing all the given errors, if any */
function throwIfAny(formId: string, errors: string[]): void {
    if (errors.length > 0) {
        throw new Error(`Invalid form configuration "${formId}":\n` + errors.map(e => `- ${e}`).join('\n'));
    }
}

/** Throws when the update rules form a cycle (a field observing itself, directly or through other fields), naming its path */
function checkNoCycles(rules: UpdateRule[]): void {
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
function resolveFormHooks(hooks: Partial<FormHooks> = {}): FormHooks {
    return {
        beforeInit: hooks.beforeInit ?? (() => {}),
        afterInit: hooks.afterInit ?? (() => {}),
        beforeUpdate: hooks.beforeUpdate ?? (() => true),
        afterUpdate: hooks.afterUpdate ?? (() => {}),
    };
}

/** Completes a field configuration with the defaults of every field kind: each kind reads only its own keys */
function resolveField(field: FieldConfiguration): ResolvedFieldConfiguration {
    return {
        name: field.name,
        io: { ...field.io, event: field.io?.event ?? 'change' },
        fetch: { ...field.fetch, method: field.fetch?.method ?? 'GET' },
        behavior: { ...field.behavior },
        select: { ...field.select, clearOnParentVoid: field.select?.clearOnParentVoid ?? true },
        checkbox: { ...field.checkbox, booleanValue: field.checkbox?.booleanValue ?? true },
    };
}
