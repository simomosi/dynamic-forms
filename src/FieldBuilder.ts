import DynamicCheckbox from "./DynamicCheckbox";
import DynamicElement from "./DynamicElement";
import DynamicRadio from "./DynamicRadio";
import DynamicSelect from "./DynamicSelect";
import { FieldConfiguration } from "./FieldConfigurationTypes";

export class FieldBuilder {
    /** @param {object} elementToClassMapping - Object which maps a field's type attribute with the class to instantiate */
    private elementToClassMapping = {
        'default': DynamicElement,
        'checkbox': DynamicCheckbox,
        'radio': DynamicRadio,
        'select-one': DynamicSelect,
        'select-multiple': DynamicSelect
    };

    public createFieldsMap(fieldsCollection: FieldConfiguration[], htmlFormElement: HTMLFormElement): Map<string, DynamicElement> {
        const fieldsMap = new Map<string, DynamicElement>();
        const fields = this.createFieldsInstance(fieldsCollection, htmlFormElement);
        fields.forEach((dynamicElement: DynamicElement) => {
            fieldsMap.set(dynamicElement.name, dynamicElement);
        });
        return fieldsMap;
    }

    private createFieldsInstance(fieldsCollection: FieldConfiguration[], htmlFormElement: HTMLFormElement): DynamicElement[] {
        const fieldCollection : DynamicElement[] = [];
        fieldsCollection.forEach((fieldConfig: FieldConfiguration) => {
            const queryResult = htmlFormElement.querySelectorAll(`[name="${fieldConfig.name}"]`);
            let type: string|null = null;
            
            if (queryResult.length === 0) {
                throw new Error(`Element ${fieldConfig.name} not found`);
            }
            type = (queryResult[0] as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement).type;
            if (type == null || !this.elementToClassMapping[type]) {
                type = 'default';
            }
            const classType = this.elementToClassMapping[type];
            const instance: DynamicElement = new classType(fieldConfig, this, queryResult);
            fieldCollection.push(instance);
        });
        return fieldCollection;
    }
}