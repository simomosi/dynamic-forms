import DynamicElement from './DynamicElement';
import DynamicForm from './DynamicForm';
import { CheckboxCheckboxConfiguration, CheckboxConfiguration } from './FieldConfigurationTypes';

class DynamicCheckbox extends DynamicElement {

    /** @param {object} checkbox - property with checkbox related properties */
    checkbox: CheckboxCheckboxConfiguration;

    /** @param {JSON} defaultConfig - property with default configuration values */
    static defaultConfig = { // Todo: inherit superclass' defaultConfig ?
        'io': {
            'event': 'change',
        },
        'checkbox': {
            'booleanValue': true
        },
    }

    /** @inheritdoc */
    constructor(config: CheckboxConfiguration, dynamicForm: DynamicForm) {
        super(config, dynamicForm);
        this.checkbox = config.checkbox ?? {};
    }

    /** @inheritdoc */
    public get(): any {
        // Custom
        if (this.io.get) {
            return this.io.get(this.htmlElement);
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        const booleanValueFlag = (this.checkbox.booleanValue !== undefined) ? (this.checkbox.booleanValue) : (DynamicCheckbox.defaultConfig.checkbox.booleanValue);
        if (booleanValueFlag === true) {
            return firstElement.checked;
        }
        return firstElement.value;
    }

    /** @inheritdoc */
    public set(value: string): void {
        // Custom
        if (this.io.set) {
            return this.io.set(this.htmlElement, value);
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.checked = (value === 'false' ? false : !!value);
        return;
    }

    /** @inheritdoc */
    public clear(): void {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.htmlElement);
        }
        // Standard
        this.set("0");
    }
}

export default DynamicCheckbox;