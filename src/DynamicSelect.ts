import DynamicElement from './DynamicElement';
import { RemoteCallError } from './RemoteCallError';
import { FieldElement, ResolvedFieldConfiguration, SelectOption, UpdateData } from './FieldConfigurationTypes';

/**
* This class represents a select field with dynamic content (like a standard html-select with dynamic options)
*/
class DynamicSelect extends DynamicElement {

    /** @param {string} method the http request method for the remote call (async update) */
    readonly method: string;

    /** @param {object} select - property with select related properties */
    select: ResolvedFieldConfiguration['select'];

    /**
    * @inheritdoc
    */
    constructor(config: ResolvedFieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        super(config, htmlElement);
        this.method = config.fetch.method;
        this.select = config.select;
    }


    /**
    * Clears the select from all its non-empty options
    * @inheritdoc
    */
    protected standardClear(): void {
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
     * If select.clearOnParentVoid is true and the subject value is empty, clears the select and stops the update, before any field hook.
     * @inheritdoc
     */
    protected canUpdate(data: UpdateData, subjectName: string|null): boolean {
        if (subjectName && !data[subjectName]) { // Clear field on empty subject
            if (this.select.clearOnParentVoid === true) {
                this.clear();
                return false;
            }
        }
        return true;
    }

    /**
    * Standard update of the select status, replaced by the behavior.updateStatus field hook:
    * loads the data with select.loadOptions, or with a remote call, then turns it into Options and saves them
    * @param {UpdateData} data data to send with the http request
    * @param {string|null} subjectName name of the subject who changed
    * @param {AbortSignal} signal aborted when the form is destroyed, which aborts the remote call
    *
    * @returns a Promise in fulfilled state when data has been updated
    */
    protected async standardUpdateStatus(data: UpdateData, subjectName: string|null, signal: AbortSignal): Promise<void> {
        const loaded = this.select.loadOptions
            ? await this.select.loadOptions(this.htmlElement, data, subjectName, signal)
            : await this.remoteCall(data, signal);
        this.saveData(this.postProcessData(loaded));
    }

    /**
    * Makes the remote call of the select, replaced by the select.loadOptions field hook
    * @param {UpdateData} data data to send with the http request
    * @param {AbortSignal} signal aborted when the form is destroyed, which aborts the remote call
    * @returns the response parsed as json
    */
    private async remoteCall(data: UpdateData, signal: AbortSignal): Promise<any> {
        if (!this.fetch.makeUrl) {
            throw new Error("Function fetch.makeUrl not specified");
        }
        const requestUrl = this.fetch.makeUrl(data);
        let fetchConfig: RequestInit = {};
        if (this.fetch.fullFetchConfig) {
            fetchConfig = this.fetch.fullFetchConfig(data);
        } else {
            fetchConfig = {};
            fetchConfig.method = this.method;
            const body = this.fetch.makeBody ? this.fetch.makeBody(data) : null;
            if (body) {
                fetchConfig.body = body;
            }
        }

        // Abort with the form destruction, or with the signal of fullFetchConfig if any
        const fetchSignal = fetchConfig.signal ? AbortSignal.any([fetchConfig.signal, signal]) : signal;
        const response = await fetch(requestUrl, { ...fetchConfig, signal: fetchSignal });
        if (!response.ok) {
            throw new RemoteCallError(requestUrl, response);
        }
        return response.json();
    }

    /**
     * Method to turn the remote call response into Options
     * @param {any} data the remote call response, parsed as json
     */
    protected postProcessData(data: any): SelectOption[] {
        // Custom
        if (this.select.postProcessData) {
            return this.select.postProcessData(this.htmlElement, data);
        }
        // Standard (no operation)
        return data;
    }

    /**
    * Method to save data returned by the remote call and filtered with postProcessData method
    * @param {SelectOption[]} data the Options to save
    *
    * @see postProcessData
    */
    protected saveData(data: SelectOption[]): void {
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
            const emptyOptionInData = data.some(item => item.value == null || String(item.value) === '');
            if (!emptyOptionInHtml && !emptyOptionInData) {
                const newEmptyOption = this.createOption('', '');
                firstElement.add(newEmptyOption);
            }
            // Add other options
            data.forEach(item => {
                if (!item.hasOwnProperty('text') || !item.hasOwnProperty('value')) {
                    console.error("Retrieved data does not have default property 'text' or 'value'", item);
                }
                const option = this.createOption(item.text, item.value);
                firstElement.add(option);
            });
        }
        return;
    }

    private createOption(text: string, value: string | number): HTMLOptionElement {
        const option = document.createElement("option");
        option.text = text;
        option.value = String(value);
        return option;
    }

}

export default DynamicSelect;