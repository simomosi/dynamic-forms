import { FieldHooks, FieldConfiguration, FieldElement, FieldFetchConfiguration, FieldIoHooks, UpdateData } from './FieldConfigurationTypes';
import { Observer, Subject } from './ObserverPatternTypes';

/**
 * This class represents a generic Input in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement implements Observer {
    /** @param {object} config - the element configuration */
    readonly config: FieldConfiguration;

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

    /** @param {object} defaultConfig - property with default configuration values */
    static defaultConfig = {
        'io': {
            'event': 'change',
        }
    }

    /**
    * Class constructor
    * @param {FieldConfiguration} config the element configuration
    * @param {Subject} subject the subject to notify when changes occour (according to Observer pattern)
    * @param {NodeList} htmlElement the html element(s) returned by querySelectorAll
    * @async
    */
    constructor(config: FieldConfiguration, htmlElement: NodeListOf<FieldElement>) {
        this.config = config;
        // Repairing config file if parameters are missing (to write code easily)
        this.io = config.io ?? {};
        this.fetch = config.fetch ?? {};
        this.behavior = config.behavior ?? {};
        this.event = this.io.event ?? DynamicElement.defaultConfig.io.event;

        this.htmlElement = htmlElement;
        this.name = config.name;
        if (this.htmlElement.length === 0) {
            throw new Error(`Element ${config.name} not found`);
        }
    }

    public attach(subject: Subject): void {
        this.htmlElement.forEach(current => {
            current.addEventListener(this.event, (e) => { subject.notify((e.target as HTMLInputElement).name).catch(console.error); });
        });
    }

    /**
    * Method to get the field value, through the io.get field hook if given
    * @returns {string} the value
    */
    public get(): any {
        return this.io.get ? this.io.get(this.htmlElement) : this.standardGet();
    }

    /**
    * Method to set the field value, through the io.set field hook if given
    * @param {string} value new value to set
    */
    public set(value: string): void {
        return this.io.set ? this.io.set(this.htmlElement, value) : this.standardSet(value);
    }

    /**
    * Method to clear this element from its content, through the behavior.clear field hook if given
    */
    public clear(): void {
        return this.behavior.clear ? this.behavior.clear(this.htmlElement) : this.standardClear();
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
    *
    * @returns a Promise in fulfilled state when element status has been updated
    *
    * @async
    */
    public async update(data: UpdateData, subjectName: string|null): Promise<void> {
        if (this.canUpdate(data, subjectName) && this.beforeUpdate(data, subjectName) !== false) {
            await this.updateStatus(data, subjectName);
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
     */
    private async updateStatus(data: UpdateData, subjectName: string|null): Promise<void> {
        return this.behavior.updateStatus ? this.behavior.updateStatus(this.htmlElement, data, subjectName) : this.standardUpdateStatus(data, subjectName);
    }

    /**
     * Standard update of the field status, replaced by the behavior.updateStatus field hook: nothing
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected async standardUpdateStatus(_data: UpdateData, _subjectName: string|null): Promise<void> {
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