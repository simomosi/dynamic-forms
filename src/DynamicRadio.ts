import DynamicElement from './DynamicElement';
import { FieldConfiguration, FieldElement } from './FieldConfigurationTypes';

/**
 * This class represents a Radio button group in a form.
 */
class DynamicRadio extends DynamicElement {

    /** @inheritdoc */
    constructor(config: FieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        super(config, htmlElement);
    }

    /** @inheritdoc */
    protected standardGet(): any {
        for (let i = 0; i < this.htmlElement.length; i++) {
            const element = this.htmlElement[i] as HTMLInputElement;
            if (element.checked === true) {
                return element.value;
            }
        }
        return null; // No value selected
    }

    /** @inheritdoc */
    protected standardSet(value: string): void {
        for (let i = 0; i < this.htmlElement.length; i++) {
            let element = this.htmlElement[i] as HTMLInputElement;
            if (element.value === value) {
                element.checked = true;
                return;
            }
            element.checked = false; // Uncheck any checked elements
        }
    }

    /** @inheritdoc */
    protected standardClear(): void {
        for (let i = 0; i < this.htmlElement.length; i++) {
            const element = this.htmlElement[i] as HTMLInputElement;
            element.checked = false;
        }
    }
}

export default DynamicRadio;
