import DynamicCheckbox from "./DynamicCheckbox";
import DynamicElement from "./DynamicElement";
import DynamicRadio from "./DynamicRadio";
import DynamicSelect from "./DynamicSelect";
import { FieldElement, ResolvedFieldConfiguration } from "./FieldConfigurationTypes";

export class FieldBuilder {
    public createFieldsMap(fieldsCollection: ResolvedFieldConfiguration[], htmlForm: HTMLFormElement): Map<string, DynamicElement> {
        const fieldsMap = new Map<string, DynamicElement>();
        fieldsCollection
        .map((fieldConfiguration) => this.factoryField(fieldConfiguration, htmlForm))
        .forEach((dynamicElement) => fieldsMap.set(dynamicElement.name, dynamicElement));
        return fieldsMap;
    }
    
    private factoryField(fieldConfiguration: ResolvedFieldConfiguration, htmlForm: HTMLFormElement): DynamicElement {
        const queryResult = htmlForm.querySelectorAll<FieldElement>(`[name="${fieldConfiguration.name}"]`);
        const type = queryResult[0].type; // resolveConfiguration checked that the field is in the form
        let instance: DynamicElement;
        switch(type) {
            case 'checkbox':
                instance = new DynamicCheckbox(fieldConfiguration, queryResult);
                break;
            case 'radio':
                instance = new DynamicRadio(fieldConfiguration, queryResult);
                break;
            case 'select-one':
            case 'select-multiple':
                instance = new DynamicSelect(fieldConfiguration, queryResult);
                break;
            default:
                instance = new DynamicElement(fieldConfiguration, queryResult);
        }
        return instance;
    }
}