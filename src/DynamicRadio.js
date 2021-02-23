import DynamicElement from './DynamicElement.js';

class DynamicRadio extends DynamicElement {

    /** @inheritdoc */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
    }

    /** @inheritdoc */
    get() {
        // Custom
        if (this.io.get) {
            return this.io.get(this.htmlElement);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            let element = this.htmlElement[i];
            if (element.checked === true) {
                return element.value;
            }
        }
        return null; // No value selected
    }

    /** @inheritdoc */
    set(value) {
        // Custom
        if (this.io.set) {
            return this.io.set(this.htmlElement, value);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            let element = this.htmlElement[i];
            if (element.value === value) {
                element.checked = true;
                return;
            }
            element.checked = false; // Uncheck any checked elements
        }
    }

    /** @inheritdoc */
    clear() {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.htmlElement);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            this.htmlElement[i].checked = false;
        }
    }
}

export default DynamicRadio;
