import DynamicElement from './DynamicElement.js';

class DynamicCheckbox extends DynamicElement {

    /** @inheritdoc */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
    }

    /** @inheritdoc */
    get() {
        // Custom
        if (this.config.io.get) {
            return this.config.io.get(this);
        }
        // Standard
        return this.htmlElement.checked;
    }

    /** @inheritdoc */
    set(value) {
        // Custom
        if (this.config.io.set) {
            return this.config.io.set(this, value);
        }
        // Standard
        return this.htmlElement.checked = value;
    }

    /** @inheritdoc */
    clear() {
        // Custom
        if (this.config.behavior.clear) {
            return this.config.behavior.clear();
        }
        // Standard
        this.set(false);
    }
}

export default DynamicCheckbox;