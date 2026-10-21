import DynamicElement from './DynamicElement';
import { FieldElement, ResolvedFieldConfiguration } from './FieldConfigurationTypes';

/**
 * This class represents a Checkbox in a form.
 */
class DynamicCheckbox extends DynamicElement {

    /** @param {object} checkbox - property with checkbox related properties */
    checkbox: ResolvedFieldConfiguration['checkbox'];

    /** @inheritdoc */
    constructor(config: ResolvedFieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        super(config, htmlElement);
        this.checkbox = config.checkbox;
    }

    /** @inheritdoc */
    protected standardGet(): any {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        if (this.checkbox.booleanValue === true) {
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