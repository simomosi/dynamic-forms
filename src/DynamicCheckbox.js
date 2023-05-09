import DynamicElement from './DynamicElement.js';

class DynamicCheckbox extends DynamicElement {

    /** @param {object} checkbox - property with checkbox related properties */
    checkbox;

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
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
        this.checkbox = this.config.checkbox ?? {};
    }

    /** @inheritdoc */
    get() {
        // Custom
        if (this.io.get) {
            return this.io.get(this.htmlElement);
        }
        // Standard
        let booleanValueFlag = (this.checkbox.booleanValue !== undefined) ? (this.checkbox.booleanValue) : (DynamicCheckbox.defaultConfig.checkbox.booleanValue);
        if (booleanValueFlag === true) {
            return this.htmlElement.checked;
        }
        return this.htmlElement.value;
    }

    /** @inheritdoc */
    set(value) {
        // Custom
        if (this.io.set) {
            return this.io.set(this.htmlElement, value);
        }
        // Standard
        return this.htmlElement.checked = value;
    }

    /** @inheritdoc */
    clear() {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.htmlElement);
        }
        // Standard
        this.set(false);
    }
}

export default DynamicCheckbox;