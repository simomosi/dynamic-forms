import DynamicElement from './DynamicElement.js';

/**
* This class represents a dropdown field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicDropdown extends DynamicElement {

    /** @param {string} method the http request method for the remote call (async update) */
    method;

    /** @param {JSON} defaultConfig property with default configuration values */
    static defaultConfig = { // Todo: inherit superclass' defaultConfig
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
    * @param {JSON} config the dropdown configuration
    * @param {JSON} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
        this.method = config.fetch.method ?? DynamicDropdown.defaultConfig.fetch.method;
    }

    /**
    * Method to clear the dropdown from all its non-empty options
    */
    clear() {
        // Custom
        if (this.config.behavior.clear) {
            return this.config.behavior.clear();
        }
        // Standard
        let options = this.htmlElement.getElementsByTagName('option');
        for (let i = options.length - 1; i >= 0; i--) {
            let value = options[i].value;
            if (value != null && value.trim() != '') { // Leave empty options
                this.htmlElement.options[i] = null;
            }
        }
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * If the behavior.clearOnParentVoid is true and the subject value is empty, this method calls the clear function and aborts the update.
     *
     * @param {JSON} data data useful to the element's status change
     * @param {string} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    beforeUpdate(data, subjectName) {
        // Custom
        if (this.config.behavior.beforeUpdate) {
            return this.config.behavior.beforeUpdate(this, data, subjectName);
        }
        // Standard
        if (subjectName && !data[subjectName]) { // Clear field on empty subject
            let clearFieldFlag = (this.config.behavior.clearOnParentVoid !== undefined) ? (this.config.behavior.clearOnParentVoid) : (DynamicDropdown.defaultConfig.behavior.clearOnParentVoid);
            if (clearFieldFlag === true) {
                this.clear();
                return false;
            }
        }
        return true;
    }

    /**
    * Method which execute a pipeline of instructions to update the select content with dynamic options
    * @param {string} subjectName name of the subject who changed
    * @param {JSON} data data to send with the http request
    *
    * @returns a Promise in fulfilled state when data has been updated
    */
    updateStatus(data, subjectName) {
        // Custom
        if (this.config.behavior.beforeUpdate) {
            return this.config.behavior.beforeUpdate(this, data, subjectName);
        }
        // Standard
        let requestUrl = this.config.fetch.makeUrl(data);
        let fetchConfig = null;
        if (this.config.fetch.fullFetchConfig) {
            fetchConfig = this.config.fetch.fullFetchConfig;
        } else {
            fetchConfig = {};
            fetchConfig.method = this.method;
            let body = this.config.fetch.makeBody ? this.config.fetch.makeBody(data) : null;
            if (body) {
                fetchConfig.body = body;
            }
        }

        let self = this;
        return fetch(requestUrl, fetchConfig)
            .then(response => { // Json
                if (response.ok)
                    return response.json();
            }).then(data => { // Postprocess data
                if (self.config.behavior.postProcessData)
                    return self.config.behavior.postProcessData(self, data);
                return data;
            }).then(data => { // Save options
                if (self.config.behavior.saveData)
                    return self.config.behavior.saveData(self, data);
                // Standard
                self.clear();
                // Add empty option
                if (!self.htmlElement.querySelector('option:not([value]), option[value=""]')) {
                    let emptyOption = document.createElement("option");
                    emptyOption.text = '';
                    emptyOption.value = '';
                    self.htmlElement.add(emptyOption);
                }
                // Add other options
                data.forEach(item => {
                    let option = document.createElement("option");
                    option.text = item.text;
                    option.value = item.value;
                    self.htmlElement.add(option);
                });
                return data;
            }).catch(error => {
                console.error(error); // tmp
            });
    }

}

export default DynamicDropdown;