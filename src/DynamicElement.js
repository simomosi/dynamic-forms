/**
 * This class represents a Dynamic Element in a form.
 */
class DynamicElement {
    /** @param {JSON} config the element configuration */
    config;

    /** @param {string} id the element id */
    id;

    /** @param {string} method the http request method for the remote call (async update) */
    method;

    /** @param {HTMLElement} htmlElement the HTML Element returned by querySelector */
    htmlElement;

    /** @param {string} name the element name */
    name;

    /** @param {JSON} defaultConfig property with default configuration values */
    static defaultConfig = {
        'io': {
            'event': 'change',
        },
        'fetch': {
            'method': 'GET',
        },
        'behavior': {
            'clearOnParentVoid': true
        },
    }

    /**
    * Class constructor
    * @param {JSON} config the element configuration
    * @param {JSON} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config, dynamicForm) {
        this.config = config;
        this.id = config.id;
        // Repairing config file if parameters are missing (to write code easily)
        this.config.io = this.config.io ?? {};
        this.config.fetch = this.config.fetch ?? {};
        this.config.behavior = this.config.behavior ?? {};

        this.method = config.fetch.method ?? DynamicElement.defaultConfig.fetch.method;
        let event = config.io.event ?? DynamicElement.defaultConfig.io.event;

        this.htmlElement = dynamicForm.htmlElement.querySelectorAll('[name='+config.id+']');
        this.name = this.htmlElement[0].name;
        if (this.htmlElement.length === 0) {
            throw new Error('Element '+config.id+' not found');
        } else if (this.htmlElement.length === 1) {
            this.htmlElement = this.htmlElement[0];
            this.htmlElement.addEventListener(event, (e) => { dynamicForm.notify(e.target.name); });
        } else {
            this.htmlElement.forEach(current => {
                current.addEventListener(event, (e) => { dynamicForm.notify(e.target.name); });
            });
        }
    }

    /**
    * Method to get the field value
    * @returns {string} the value
    */
    get() {
        // Custom
        if (this.config.io.get) {
            return this.config.io.get(this);
        }
        // Standard
        return this.htmlElement.value;
    }

    /**
    * Method to set the field value
    * @param {string} value new value to set
    */
    set(value) {
        // Custom
        if (this.config.io.set) {
            return this.config.io.set(this, value);
        }
        // Standard
        return this.htmlElement.value = value;
    }

    /**
    * Method to clear this element from its content
    */
    clear() {
        // Custom
        if (this.config.behavior.clear) {
            return this.config.behavior.clear();
        }
        // Standard
        this.htmlElement.value = "";
    }

    /**
    * Method which execute a pipeline of instructions to update this element with dynamic content.
    * @param {string} senderName name of the subject who changed
    * @param {JSON} data data to send with the http request
    *
    * @returns a Promise in fulfilled state when data has been updated
    *
    * @async
    */
    async update() {
        let message = "Operation not yet supported. Use this field in a 'change' or 'additionalData' part of a rule; do NOT use it in a 'update' part.";
        throw new Error(message);
    }
}

export default DynamicElement;