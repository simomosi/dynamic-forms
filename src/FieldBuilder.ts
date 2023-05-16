import DynamicCheckbox from "./DynamicCheckbox";
import DynamicElement from "./DynamicElement";
import DynamicForm from "./DynamicForm";
import DynamicRadio from "./DynamicRadio";
import DynamicSelect from "./DynamicSelect";
import { FieldConfiguration } from "./FieldConfigurationTypes";

export class FieldBuilder {
    public createFieldsMap(fieldsCollection: FieldConfiguration[], dynamicForm: DynamicForm): Map<string, DynamicElement> {
        const fieldsMap = new Map<string, DynamicElement>();
        fieldsCollection
        .map((fieldConfiguration) => this.factoryField(fieldConfiguration, dynamicForm))
        .forEach((dynamicElement) => fieldsMap.set(dynamicElement.name, dynamicElement));
        return fieldsMap;
    }
    
    private factoryField(fieldConfiguration: FieldConfiguration, dynamicForm: DynamicForm): DynamicElement {
        const queryResult = dynamicForm.htmlElement.querySelectorAll(`[name="${fieldConfiguration.name}"]`);
        let type: string;
        
        if (queryResult.length === 0) {
            throw new Error(`Element ${fieldConfiguration.name} not found`);
        }
        type = (queryResult[0] as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement).type;
        let instance: DynamicElement;
        switch(type) {
            case 'checkbox':
                instance = new DynamicCheckbox(fieldConfiguration, dynamicForm, queryResult);
                break;
            case 'radio':
                instance = new DynamicRadio(fieldConfiguration, dynamicForm, queryResult);
                break;
            case 'select-one':
            case 'select-multiple':
                instance = new DynamicSelect(fieldConfiguration, dynamicForm, queryResult);
                break;
            default:
                instance = new DynamicElement(fieldConfiguration, dynamicForm, queryResult);
        }
        return instance;
    }
}