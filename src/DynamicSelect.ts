import DynamicElement from './DynamicElement';
import { SelectConfiguration, SelectSelectConfiguration } from './FieldConfigurationTypes';

/**
* This class represents a select field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicSelect extends DynamicElement {

    /** @param {string} method the http request method for the remote call (async update) */
    readonly method: string;

    /** @param {object} dropdown - property with select related properties */
    select: SelectSelectConfiguration;

    /** @param {object} defaultConfig property with default configuration values */
    static defaultConfig = { // Todo: inherit superclass' defaultConfig
        'io': {
            'event': 'change',
        },
        'fetch': {
            'method': 'GET',
        },
        'select': {
            'clearOnParentVoid': true
        },
    }

    /**
    * @inheritdoc
    */
    constructor(config: SelectConfiguration, htmlElement: NodeList) {
        super(config, htmlElement);
        this.method = this.fetch.method ?? DynamicSelect.defaultConfig.fetch.method;
        this.select = config.select ?? {};
    }


    private getHtmlSelectElementOrList(): HTMLSelectElement | NodeList {
        if (this.htmlElement.length === 1) {
            return this.htmlElement[0] as HTMLSelectElement;
        }
        return this.htmlElement as NodeList;
    }

    /**
    * Method to clear the select from all its non-empty options
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
                firstElement.options[i].remove();
            }
        }
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * If select.clearOnParentVoid is true and the subject value is empty, this method calls the clear function and aborts the update.
     *
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    protected beforeUpdate(data: any, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.beforeUpdate) {
            return this.behavior.beforeUpdate(this.getHtmlSelectElementOrList(), data, subjectName);
        }
        // Standard
        if (subjectName && !data[subjectName]) { // Clear field on empty subject
            const clearFieldFlag = (this.select.clearOnParentVoid !== undefined) ? (this.select.clearOnParentVoid) : (DynamicSelect.defaultConfig.select.clearOnParentVoid);
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
    protected async updateStatus(data: object, subjectName: string|null): Promise<void> {
        // Custom
        if (this.behavior.updateStatus) {
            return this.behavior.updateStatus(this.htmlElement, data, subjectName);
        }
        // Standard
        if (!this.fetch.makeUrl) {
            throw new Error("Function fetch.makeUrl not specified");
        }
        const requestUrl = this.fetch.makeUrl(data);
        let fetchConfig: RequestInit = {};
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
        if (this.select.postProcessData) {
            return this.select.postProcessData(this.htmlElement, data);
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
    protected saveData(data: any[]): void {
        // Custom
        if (this.select.saveData) {
            return this.select.saveData(this.htmlElement, data);
        }
        // Standard
        this.clear();
        if (this.htmlElement.length == 1) {
            // Add empty option
            const firstElement = this.htmlElement[0] as HTMLSelectElement;
            const emptyOptionInHtml = firstElement.querySelector('option:not([value]), option[value=""]');
            const emptyOptionInData = data.filter((item: {text: string, value: string}) => !item.value);
            if (!emptyOptionInHtml && !emptyOptionInData) {
                const newEmptyOption = this.createOption('', '');
                firstElement.add(newEmptyOption);
            }
            // Add other options
            data.forEach((item: {text: string, value: string}) => {
                if (!item.hasOwnProperty('text') || !item.hasOwnProperty('value')) {
                    console.error("Retrieved data does not have default property 'text' or 'value'", item);
                }
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

export default DynamicSelect;