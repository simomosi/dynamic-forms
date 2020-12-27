import DynamicElement from './DynamicElement.js';

class DynamicRadio extends DynamicElement {

    /** @inheritdoc */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
    }

    /** @inheritdoc */
    get() {
        // Custom
        if (this.config.io.get) {
            return this.config.io.get(this.htmlElement);
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
        if (this.config.io.set) {
            return this.config.io.set(this.htmlElement, value);
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
        if (this.config.behavior.clear) {
            return this.config.behavior.clear(this.htmlElement);
        }
        // Standard
        for (let i = 0; i < this.htmlElement.length; i++) {
            this.htmlElement[i].checked = false;
        }
    }
}

export default DynamicRadio;
