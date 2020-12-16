/**
* This class represents a dropdown field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicDropdown {

    /** @param {JSON} config the dropdown configuration */
    config;
    /** @param {string} id the dropdown id */
    id;
    /** @param {string} method the http request method for async update */
    method;
    /** @param {HTMLElement} htmlElement the dropdown HTML Element returned by querySelector */
    htmlElement;
    /** @param {string} name the dropdown name */
    name;
    /** @param {JSON} config property with default configuration values */
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
    * @param {JSON} config the dropdown configuration
    * @param {JSON} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config, dynamicForm) {
        let self = this;
        new Promise((accept) => {
            self.config = config;
            self.id = config.id;
            self.method = config.method ?? DynamicDropdown.defaultConfig.fetch.method;
            let event = config.event ?? DynamicDropdown.defaultConfig.io.event;

            self.htmlElement = dynamicForm.htmlElement.querySelector('#' + config.id);
            self.name = self.htmlElement.name;
            self.htmlElement.addEventListener(event, (e) => { dynamicForm.notify(e.target.name); });
            // Repairing config file if parameters are missing (to write code easily)
            self.config.io = self.config.io ?? {};
            self.config.fetch = self.config.fetch ?? {};
            self.config.behavior = self.config.behavior ?? {};
            accept();
        });
    }

    /**
    * Method to get the field value
    * @returns {string} the value
    */
    get() {
        if (this.config.io.get) {
            return this.config.io.get(this);
        }
        return this.htmlElement.value;
    }

    /**
    * Method to set the field value
    * @param {string} value new value to set
    */
    set(value) {
        if (this.config.io.set) {
            return this.config.io.set(this, value);
        }
        return this.htmlElement.value = value;
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
    async update(senderName, data) {
        if (senderName) {
            // If clearOnParentVoid is true and parent value is empty, this element must be cleared aswell
            var clear = (this.config.behavior.clearOnParentVoid !== undefined) ? (this.config.behavior.clearOnParentVoid) : (DynamicDropdown.defaultConfig.behavior.clearOnParentVoid);
            if (clear === true && !data[senderName]) {
                this.clear();
                return Promise.resolve(data);
            }
        }
        // Async request to fetch data
        if (this.config.behavior.beforeUpdate && this.config.behavior.beforeUpdate(this, data) === false) {
            return Promise.resolve(data);
        }

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
                if (this.config.behavior.postProcessData)
                    return this.config.behavior.postProcessData(this, data);
                return data;
            }).then(data => { // Save options
                if (this.config.behavior.saveData)
                    return this.config.behavior.saveData(this, data);
                // Standard
                this.clear();
                // Add empty option
                if (!this.htmlElement.querySelector('option:not([value]), option[value=""]')) {
                    let emptyOption = document.createElement("option");
                    emptyOption.text = '';
                    emptyOption.value = '';
                    this.htmlElement.add(emptyOption);
                }
                // Add other options
                data.forEach(item => {
                    let option = document.createElement("option");
                    option.text = item.text;
                    option.value = item.value;
                    this.htmlElement.add(option);
                });
                return data;
            }).then(data => { // After update
                if (self.config.behavior.afterUpdate) {
                    self.config.behavior.afterUpdate();
                }
                return data;
            }).catch(error => {
                console.log(error); // tmp
            });
    }

    /**
    * Method to clear this element from its content
    *
    * @async
    */
    async clear() {
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

}

export default DynamicDropdown;