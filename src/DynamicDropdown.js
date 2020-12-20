import DynamicElement from './DynamicElement.js';

/**
* This class represents a dropdown field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicDropdown extends DynamicElement{

    /**
    * Class constructor
    * @param {JSON} config the dropdown configuration
    * @param {JSON} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config, dynamicForm) {
        super(config, dynamicForm);
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
        let options = this.htmlElement.getElementsByTagName('option');
        for (let i = options.length - 1; i >= 0; i--) {
            let value = options[i].value;
            if (value != null && value.trim() != '') { // Leave empty options
                this.htmlElement.options[i] = null;
            }
        }
    }

    /**
    * Method which execute a pipeline of instructions to update select content with dynamic options
    * @param {string} subjectName name of the subject who changed
    * @param {JSON} data data to send with the http request
    *
    * @returns a Promise in fulfilled state when data has been updated
    *
    * @async
    */
    async update(subjectName, data) {
        if (subjectName) {
            // If clearOnParentVoid is true and parent value is empty, this element must be cleared aswell
            var clear = (this.config.behavior.clearOnParentVoid !== undefined) ? (this.config.behavior.clearOnParentVoid) : (DynamicDropdown.defaultConfig.behavior.clearOnParentVoid);
            if (clear === true && !data[subjectName]) {
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

}

export default DynamicDropdown;