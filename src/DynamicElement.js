/**
 * This class represents a Dynamic Element in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement {
    /** @param {JSON} config the element configuration */
    config;

    /** @param {node | NodeList} htmlElement the HTML Element returned by querySelectorAll. If more than one exists, the element is a NodeList */
    htmlElement;

    /** @param {string} name the element name */
    name;

    /** @param {JSON} defaultConfig property with default configuration values */
    static defaultConfig = {
        'io': {
            'event': 'change',
        }
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

        let event = config.io.event ?? DynamicElement.defaultConfig.io.event;

        this.htmlElement = dynamicForm.htmlElement.querySelectorAll('[name=' + config.name + ']');
        this.name = this.htmlElement[0].name;
        if (this.htmlElement.length === 0) {
            throw new Error('Element ' + config.name + ' not found');
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
            return this.config.io.get(this.htmlElement);
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
            return this.config.io.set(this.htmlElement, value);
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
            return this.config.behavior.clear(this.htmlElement);
        }
        // Standard
        this.htmlElement.value = "";
    }

    /**
    * Method which updates the element (observer) status after a change on the observed subject
    * @param {JSON} data data useful to the element's status change
    * @param {string} subjectName name of the changed subject
    *
    * @returns a Promise in fulfilled state when element status has been updated
    *
    * @async
    */
    async update(data, subjectName) {
        let beforeUpdateResult = this.beforeUpdate(data, subjectName);
        if (beforeUpdateResult !== false) {
            this.updateStatus(data, subjectName);
        }
        let afterUpdateResult = this.afterUpdate(data, subjectName);
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * @param {JSON} data data useful to the element's status change
     * @param {string} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    beforeUpdate(data, subjectName) {
        // Custom
        if (this.config.behavior.beforeUpdate) {
            return this.config.behavior.beforeUpdate(this.htmlElement, data, subjectName);
        }
        // Standard
        return true; // Does not block field update
    }

    /**
     * Method to update the DynamicElement status.
     * @param {JSON} data data useful to the element's status change
     * @param {string} subjectName name of the changed subject
     */
    updateStatus(data, subjectName) {
        // Custom
        if (this.config.behavior.updateStatus) {
            return this.config.behavior.updateStatus(this.htmlElement, data, subjectName);
        }
    }

    /**
     * Method executed after the status update. It is executed also if the update is aborted.
     * @param {JSON} data data useful to the element's status change
     * @param {string} subjectName name of the changed subject
     */
    afterUpdate(data, subjectName) {
        // Custom
        if (this.config.behavior.afterUpdate) {
            return this.config.behavior.afterUpdate(this.htmlElement, data, subjectName);
        }
    }
}

export default DynamicElement;