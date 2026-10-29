import DynamicCheckbox from "./DynamicCheckbox";
import DynamicElement from "./DynamicElement";
import DynamicRadio from "./DynamicRadio";
import DynamicSelect from "./DynamicSelect";
import { FieldElement, ResolvedFieldConfiguration } from "./FieldConfigurationTypes";

/**
 * Creates the Fields of a form, each of the kind of its html element
 * @param {ResolvedFieldConfiguration[]} fieldsCollection the Field Configurations completed with defaults
 * @param {HTMLFormElement} htmlForm the html form
 * @returns the Fields by name
 */
export function createFields(fieldsCollection: ResolvedFieldConfiguration[], htmlForm: HTMLFormElement): Map<string, DynamicElement> {
    return new Map(fieldsCollection.map((fieldConfiguration) => [fieldConfiguration.name, createField(fieldConfiguration, htmlForm)]));
}

function createField(fieldConfiguration: ResolvedFieldConfiguration, htmlForm: HTMLFormElement): DynamicElement {
    const queryResult = htmlForm.querySelectorAll<FieldElement>(`[name="${fieldConfiguration.name}"]`);
    const type = queryResult[0].type; // resolveConfiguration checked that the field is in the form
    switch(type) {
        case 'checkbox':
            return new DynamicCheckbox(fieldConfiguration, queryResult);
        case 'radio':
            return new DynamicRadio(fieldConfiguration, queryResult);
        case 'select-one':
        case 'select-multiple':
            return new DynamicSelect(fieldConfiguration, queryResult);
        default:
            return new DynamicElement(fieldConfiguration, queryResult);
    }
}
