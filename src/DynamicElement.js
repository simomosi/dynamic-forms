/**
 * This class represents a Dynamic Element in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement {
    /** @param {JSON} config the element configuration */
    config;

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
        // Repairing config file if parameters are missing (to write code easily)
        this.config.io = this.config.io ?? {};
        this.config.fetch = this.config.fetch ?? {};
        this.config.behavior = this.config.behavior ?? {};

        this.method = config.fetch.method ?? DynamicElement.defaultConfig.fetch.method;
        let event = config.io.event ?? DynamicElement.defaultConfig.io.event;

        this.htmlElement = dynamicForm.htmlElement.querySelectorAll('[name=' + config.name+']');
        this.name = this.htmlElement[0].name;
        if (this.htmlElement.length === 0) {
            throw new Error('Element ' + config.name+' not found');
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
    * Method which updates the element status after a change on the observed subject
    * @param {string} subjectName name of the subject who changed
    * @param {JSON} data data useful to this element
    *
    * @returns a Promise in fulfilled state when element status has been updated
    *
    * @async
    */
    async update(subjectName, data) {
        // Custom
        // if (this.config.behavior.clear) {
        //     return this.config.behavior.clear();
        // }
        return Promise.resolve(data); // No custom update method
    }
}

export default DynamicElement;