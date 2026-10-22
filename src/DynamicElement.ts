import { FieldHooks, FieldElement, FieldFetchConfiguration, FieldIoHooks, ResolvedFieldConfiguration, UpdateData } from './FieldConfigurationTypes';

/**
 * This class represents a generic Input in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement {
    /** @param {object} config - the element configuration */
    readonly config: ResolvedFieldConfiguration;

    /** @param {NodeList} htmlElement - the HTML Elements returned by querySelectorAll, which every hook receives */
    readonly htmlElement: NodeListOf<FieldElement>;

    /** @param {string} name - the element name */
    readonly name: string;

    /** @param {FieldIoHooks} io - the field io hooks */
    io: FieldIoHooks;

    /** @param {FieldFetchConfiguration} fetch - object which groups some properties related to remote calls */
    fetch: FieldFetchConfiguration;

    /** @param {FieldHooks} behavior - the field hooks */
    behavior: FieldHooks;

    /** @param {string} event - the event to listen to */
    event: string;

    /** @param {(() => void)|null} stopListening - stops the listening started by attach, called by detach */
    private stopListening: (() => void) | null = null;

    /** @param {number} writing - how many writes of the library to the field are in progress, during which its changes are ignored */
    private writing = 0;

    /**
    * Class constructor
    * @param {ResolvedFieldConfiguration} config the field configuration completed with defaults
    * @param {NodeList} htmlElement the html element(s) returned by querySelectorAll
    * @async
    */
    constructor(config: ResolvedFieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        this.config = config;
        this.io = config.io;
        this.fetch = config.fetch;
        this.behavior = config.behavior;
        this.event = config.io.event;
        this.htmlElement = htmlElement;
        this.name = config.name;
    }

    /**
    * Listens to the field changes, through the io.listen field hook if given
    * @param {() => void} onChange called on each change
    */
    public attach(onChange: () => void): void {
        // A change fired by the library's own write is no change of the user: the library already updates the observers (ADR 0001)
        const onUserChange = () => {
            if (this.writing === 0) {
                onChange();
            }
        };
        const standard = () => this.standardListen(onUserChange);
        this.stopListening = this.io.listen ? this.io.listen(this.htmlElement, onUserChange, standard) : standard();
    }

    /**
    * Stops the listening started by attach
    */
    public detach(): void {
        this.stopListening?.();
        this.stopListening = null;
    }

    /**
    * Standard listening to the field changes, replaced by the io.listen field hook: listens to io.event on the elements
    * @param {() => void} onChange called on each event
    * @returns the function that removes the listeners
    */
    protected standardListen(onChange: () => void): () => void {
        const listener = () => onChange();
        this.htmlElement.forEach(current => current.addEventListener(this.event, listener));
        return () => this.htmlElement.forEach(current => current.removeEventListener(this.event, listener));
    }

    /**
    * Method to get the field value, through the io.get field hook if given
    * @returns {string} the value
    */
    public get(): any {
        return this.io.get ? this.io.get(this.htmlElement, () => this.standardGet()) : this.standardGet();
    }

    /**
    * Method to set the field value, through the io.set field hook if given
    * @param {string} value new value to set
    */
    public set(value: string): void {
        this.whileWriting(() => this.io.set ? this.io.set(this.htmlElement, value, () => this.standardSet(value)) : this.standardSet(value));
    }

    /**
    * Method to clear this element from its content, through the behavior.clear field hook if given
    */
    public clear(): void {
        this.whileWriting(() => this.behavior.clear ? this.behavior.clear(this.htmlElement, () => this.standardClear()) : this.standardClear());
    }

    /**
    * Runs a write of the library to the field, ignoring the field changes it fires
    * @param {() => void} write the write
    */
    protected whileWriting(write: () => void): void {
        this.writing++;
        try {
            write();
        } finally {
            this.writing--;
        }
    }

    /**
    * Standard reading of the field value, replaced by the io.get field hook
    * @returns {string} the value
    */
    protected standardGet(): any {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        return firstElement.value;
    }

    /**
    * Standard writing of the field value, replaced by the io.set field hook
    * @param {string} value new value to set
    */
    protected standardSet(value: string): void {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.value = value;
    }

    /**
    * Standard clear of the field, replaced by the behavior.clear field hook
    */
    protected standardClear(): void {
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.value = "";
    }

    /**
    * Method which updates the element (observer) status after a change on the observed subject
    * @param {UpdateData} data data useful to the element's status change
    * @param {string|null} subjectName name of the changed subject
    * @param {AbortSignal} signal aborted when the form is destroyed
    *
    * @returns a Promise in fulfilled state when element status has been updated
    *
    * @async
    */
    public async update(data: UpdateData, subjectName: string|null, signal: AbortSignal): Promise<void> {
        if (this.canUpdate(data, subjectName) && this.beforeUpdate(data, subjectName) !== false) {
            await this.updateStatus(data, subjectName, signal);
        }
        this.afterUpdate(data, subjectName);
    }

    /**
     * Standard step executed before the beforeUpdate field hook, which no field hook replaces: nothing. If it returns false, the update is aborted.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    protected canUpdate(_data: UpdateData, _subjectName: string|null): boolean {
        return true;
    }

    /**
     * Calls the behavior.beforeUpdate field hook, if given, before the status update. If it returns false, the update is aborted.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    private beforeUpdate(data: UpdateData, subjectName: string|null): boolean {
        return this.behavior.beforeUpdate ? this.behavior.beforeUpdate(this.htmlElement, data, subjectName) : true;
    }

    /**
     * Method to update the field status, through the behavior.updateStatus field hook if given
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @param {AbortSignal} signal aborted when the form is destroyed
     */
    private async updateStatus(data: UpdateData, subjectName: string|null, signal: AbortSignal): Promise<void> {
        const standard = () => this.standardUpdateStatus(data, subjectName, signal);
        return this.behavior.updateStatus ? this.behavior.updateStatus(this.htmlElement, data, subjectName, signal, standard) : standard();
    }

    /**
     * Standard update of the field status, replaced by the behavior.updateStatus field hook: nothing
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @param {AbortSignal} signal aborted when the form is destroyed
     */
    protected async standardUpdateStatus(_data: UpdateData, _subjectName: string|null, _signal: AbortSignal): Promise<void> {
    }

    /**
     * Calls the behavior.afterUpdate field hook, if given, after the status update. It is executed also if the update is aborted.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    private afterUpdate(data: UpdateData, subjectName: string|null): void {
        if (this.behavior.afterUpdate) {
            this.behavior.afterUpdate(this.htmlElement, data, subjectName);
        }
    }
}

export default DynamicElement;