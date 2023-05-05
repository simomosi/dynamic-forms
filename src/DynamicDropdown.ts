import DynamicElement from './DynamicElement';
import DynamicForm from './DynamicForm';
import { DropdownConfiguration, DropdownDropdownConfiguration } from './FieldConfigurationTypes';

/**
* This class represents a dropdown field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicDropdown extends DynamicElement {

    /** @param {string} method the http request method for the remote call (async update) */
    method: string;

    /** @param {object} dropdown - property with dropdown related properties */
    dropdown: DropdownDropdownConfiguration;

    /** @param {object} defaultConfig property with default configuration values */
    static defaultConfig = { // Todo: inherit superclass' defaultConfig
        'io': {
            'event': 'change',
        },
        'fetch': {
            'method': 'GET',
        },
        'dropdown': {
            'clearOnParentVoid': true
        },
    }

    /**
    * Class constructor
    * @param {object} config the dropdown configuration
    * @param {object} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config: DropdownConfiguration, dynamicForm: DynamicForm) {
        super(config, dynamicForm);
        this.method = this.fetch.method ?? DynamicDropdown.defaultConfig.fetch.method;
        this.dropdown = config.dropdown ?? {};
    }


    private getHtmlSelectElementOrList(): HTMLSelectElement | NodeList {
        if (this.htmlElement.length === 1) {
            return this.htmlElement[0] as HTMLSelectElement;
        }
        return this.htmlElement as NodeList;
    }

    /**
    * Method to clear the dropdown from all its non-empty options
    */
    public clear(): void {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.getHtmlSelectElementOrList());
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLSelectElement;
        const options = firstElement.options;
        for (let i = options.length - 1; i >= 0; i--) {
            const value = options[i].value;
            if (value != null && value.trim() != '') { // Leave empty options
                firstElement.options[i] = null;
            }
        }
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * If dropdown.clearOnParentVoid is true and the subject value is empty, this method calls the clear function and aborts the update.
     *
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    protected beforeUpdate(data: object, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.beforeUpdate) {
            return this.behavior.beforeUpdate(this.getHtmlSelectElementOrList(), data, subjectName);
        }
        // Standard
        if (subjectName && !data[subjectName]) { // Clear field on empty subject
            const clearFieldFlag = (this.dropdown.clearOnParentVoid !== undefined) ? (this.dropdown.clearOnParentVoid) : (DynamicDropdown.defaultConfig.dropdown.clearOnParentVoid);
            if (clearFieldFlag === true) {
                this.clear();
                return false;
            }
        }
        return true;
    }

    /**
    * Method which execute a pipeline of instructions to update the select content with dynamic options
    * @param {object} data data to send with the http request
    * @param {string|null} subjectName name of the subject who changed
    *
    * @returns a Promise in fulfilled state when data has been updated
    */
    protected updateStatus(data: object, subjectName: string|null) {
        // Custom
        if (this.behavior.updateStatus) {
            return this.behavior.updateStatus(this.htmlElement, data, subjectName);
        }
        // Standard
        const requestUrl = this.fetch.makeUrl(data);
        let fetchConfig = null;
        if (this.fetch.fullFetchConfig) {
            fetchConfig = this.fetch.fullFetchConfig;
        } else {
            fetchConfig = {};
            fetchConfig.method = this.method;
            const body = this.fetch.makeBody ? this.fetch.makeBody(data) : null;
            if (body) {
                fetchConfig.body = body;
            }
        }

        return fetch(requestUrl, fetchConfig)
            .then(response => { // Json
                if (response.ok)
                    return response.json();
                throw response;
            }).then(data => { // Postprocess data
                return this.postProcessData(data);
            }).then(data => { // Save options
                return this.saveData(data);
            }).catch(error => {
                console.error(error); // tmp
            });
    }

    /**
     * Method to filter data returned by the remote call
     * @param {object} data data to send with the http request
     */
    protected postProcessData(data: object[]): object[] {
        // Custom
        if (this.dropdown.postProcessData) {
            return this.dropdown.postProcessData(this.htmlElement, data);
        }
        // Standard (no operation)
        return data;
    }

    /**
    * Method to save data returned by the remote call and filtered with postProcessData method
    * @param {object} data data to send with the http request
    *
    * @see postProcessData
    */
    protected saveData(data: object[]): void {
        // Custom
        if (this.dropdown.saveData) {
            return this.dropdown.saveData(this.htmlElement, data);
        }
        // Standard
        this.clear();
        if (this.htmlElement.length == 1) {
            // Add empty option
            const firstElement = this.htmlElement[0] as HTMLSelectElement;
            const emptyOption = firstElement.querySelector('option:not([value]), option[value=""]');
            if (!emptyOption) {
                const newEmptyOption = this.createOption('', '');
                firstElement.add(newEmptyOption);
            }
            // Add other options
            data.forEach((item: {text: string, value: string}) => {
                const option = this.createOption(item.text, item.value);
                firstElement.add(option);
            });
        }
        return;
    }

    private createOption(text: string, value: string): HTMLOptionElement {
        const option = document.createElement("option");
        option.text = text;
        option.value = value;
        return option;
    }

}

export default DynamicDropdown;