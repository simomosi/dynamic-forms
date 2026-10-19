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
    * Method to get the field value
    * @returns {string} the value
    */
    public get(): any {
        // Custom
        if (this.io.get) {
            return this.io.get(this.htmlElement);
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        return firstElement.value;
    }

    /**
    * Method to set the field value
    * @param {string} value new value to set
    */
    public set(value: string): void {
        // Custom
        if (this.io.set) {
            return this.io.set(this.htmlElement, value);
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.value = value;
        return;
    }

    /**
    * Method to clear this element from its content
    */
    public clear(): void {
        // Custom
        if (this.behavior.clear) {
            return this.behavior.clear(this.htmlElement);
        }
        // Standard
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
        const beforeUpdateResult = this.beforeUpdate(data, subjectName);
        if (beforeUpdateResult !== false) {
            await this.updateStatus(data, subjectName);
        }
        this.afterUpdate(data, subjectName);
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    protected beforeUpdate(data: UpdateData, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.beforeUpdate) {
            return this.behavior.beforeUpdate(this.htmlElement, data, subjectName);
        }
        // Standard
        return true; // Does not block field update
    }

    /**
     * Method to update the DynamicElement status.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected async updateStatus(data: UpdateData, subjectName: string|null): Promise<void> {
        // Custom
        if (this.behavior.updateStatus) {
            return this.behavior.updateStatus(this.htmlElement, data, subjectName);
        }
    }

    /**
     * Method executed after the status update. It is executed also if the update is aborted.
     * @param {UpdateData} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected afterUpdate(data: UpdateData, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.afterUpdate) {
            return this.behavior.afterUpdate(this.htmlElement, data, subjectName);
        }
        // Standard
        return true; // Standard behavior: returns positive value
    }
}

export default DynamicElement;