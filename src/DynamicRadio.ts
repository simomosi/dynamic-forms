import DynamicElement from './DynamicElement';
import DynamicForm from './DynamicForm';
import { FieldConfiguration } from './FieldConfigurationTypes';

class DynamicRadio extends DynamicElement {

    /** @inheritdoc */
    constructor(config: FieldConfiguration, dynamicForm: DynamicForm) {
        super(config, dynamicForm);
    }

    /** @inheritdoc */
    public get(): any {
        // Custom
        if (this.io.get) {
            return this.io.get(this.htmlElement);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            const element = this.htmlElement[i] as HTMLInputElement;
            if (element.checked === true) {
                return element.value;
            }
        }
        return null; // No value selected
    }

    /** @inheritdoc */
    public set(value: string): void {
        // Custom
        if (this.io.set) {
            return this.io.set(this.htmlElement, value);
        }
        // Standard
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
    public clear(): void {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.htmlElement);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            const element = this.htmlElement[i] as HTMLInputElement;
            element.checked = false;
        }
    }
}

export default DynamicRadio;
