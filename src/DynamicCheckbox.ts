import DynamicElement from './DynamicElement';
import { CheckboxConfiguration, FieldConfiguration, FieldElement } from './FieldConfigurationTypes';

/**
 * This class represents a Checkbox in a form.
 */
class DynamicCheckbox extends DynamicElement {

    /** @param {object} checkbox - property with checkbox related properties */
    checkbox: CheckboxConfiguration;

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
    constructor(config: FieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        super(config, htmlElement);
        this.checkbox = config.checkbox ?? {};
    }

    /** @inheritdoc */
    protected standardGet(): any {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        const booleanValueFlag = (this.checkbox.booleanValue !== undefined) ? (this.checkbox.booleanValue) : (DynamicCheckbox.defaultConfig.checkbox.booleanValue);
        if (booleanValueFlag === true) {
            return firstElement.checked;
        }
        return firstElement.value;
    }

    /** @inheritdoc */
    protected standardSet(value: string): void {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.checked = (value === 'false' ? false : !!value);
        return;
    }

    /** @inheritdoc */
    protected standardClear(): void {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.checked = false;
    }
}

export default DynamicCheckbox;