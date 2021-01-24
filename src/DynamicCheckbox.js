import DynamicElement from './DynamicElement.js';

class DynamicCheckbox extends DynamicElement {

    /** @param {JSON} defaultConfig property with default configuration values */
    static defaultConfig = { // Todo: inherit superclass' defaultConfig
        'io': {
            'event': 'change',
        },
        'checkbox': {
            'booleanValue': true
        },
    }

    /** @inheritdoc */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
        this.config.checkbox = this.config.checkbox ?? {};
    }

    /** @inheritdoc */
    get() {
        // Custom
        if (this.config.io.get) {
            return this.config.io.get(this.htmlElement);
        }
        // Standard
        let booleanValueFlag = (this.config.checkbox.booleanValue !== undefined) ? (this.config.checkbox.booleanValue) : (DynamicCheckbox.defaultConfig.checkbox.booleanValue);
        if (booleanValueFlag === true) {
            return this.htmlElement.checked;
        }
        return this.htmlElement.value;
    }

    /** @inheritdoc */
    set(value) {
        // Custom
        if (this.config.io.set) {
            return this.config.io.set(this.htmlElement, value);
        }
        // Standard
        return this.htmlElement.checked = value;
    }

    /** @inheritdoc */
    clear() {
        // Custom
        if (this.config.behavior.clear) {
            return this.config.behavior.clear(this.htmlElement);
        }
        // Standard
        this.set(false);
    }
}

export default DynamicCheckbox;