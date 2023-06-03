import { FieldBehaviorConfiguration, FieldConfiguration, FieldFetchConfiguration, FieldIoConfiguration } from './FieldConfigurationTypes';
import { Observer, Subject } from './ObserverPatternTypes';

/**
 * This class represents a generic Input in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement implements Observer {
    /** @param {object} config - the element configuration */
    readonly config: FieldConfiguration;

    /** @param {NodeList} htmlElement - the HTML Element returned by querySelectorAll. If more than one exists, the element is a NodeList */
    readonly htmlElement: NodeList;

    /** @param {string} name - the element name */
    readonly name: string;

    /** @param {FieldIoConfiguration} io - object which groups some properties related to field input/output */
    io: FieldIoConfiguration;

    /** @param {FieldFetchConfiguration} fetch - object which groups some properties related to remote calls */
    fetch: FieldFetchConfiguration;

    /** @param {FieldBehaviorConfiguration} behavior - object which groups some properties related to field behavior */
    behavior: FieldBehaviorConfiguration;

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
    constructor(config: FieldConfiguration, subject: Subject, htmlElement: NodeList) {
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

    private getHtmlInputElementOrList(): HTMLInputElement | NodeList {
        if (this.htmlElement.length === 1) {
            return this.htmlElement[0] as HTMLInputElement;
        }
        return this.htmlElement;
    }

    public attach(subject: Subject): void {
        this.htmlElement.forEach(current => {
            current.addEventListener(this.event, (e) => { subject.notify((e.target as HTMLInputElement).name); });
        });
    }

    /**
    * Method to get the field value
    * @returns {string} the value
    */
    public get(): any {
        // Custom
        if (this.io.get) {
            return this.io.get(this.getHtmlInputElementOrList());
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
            return this.io.set(this.getHtmlInputElementOrList(), value);
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
            return this.behavior.clear(this.getHtmlInputElementOrList());
        }
        // Standard
        const firstElement = this.htmlElement[0] as HTMLInputElement;
        firstElement.value = "";
    }

    /**
    * Method which updates the element (observer) status after a change on the observed subject
    * @param {object} data data useful to the element's status change
    * @param {string|null} subjectName name of the changed subject
    *
    * @returns a Promise in fulfilled state when element status has been updated
    *
    * @async
    */
    public async update(data: object, subjectName: string|null): Promise<void> {
        const beforeUpdateResult = this.beforeUpdate(data, subjectName);
        if (beforeUpdateResult !== false) {
            await this.updateStatus(data, subjectName);
        }
        this.afterUpdate(data, subjectName);
    }

    /**
     * Method executed before the status update. If it returns false, the update is aborted.
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     * @returns false to abort the update, true otherwise
     */
    protected beforeUpdate(data: object, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.beforeUpdate) {
            return this.behavior.beforeUpdate(this.getHtmlInputElementOrList(), data, subjectName);
        }
        // Standard
        return true; // Does not block field update
    }

    /**
     * Method to update the DynamicElement status.
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected async updateStatus(data: object, subjectName: string|null): Promise<void> {
        // Custom
        if (this.behavior.updateStatus) {
            return this.behavior.updateStatus(this.getHtmlInputElementOrList(), data, subjectName);
        }
    }

    /**
     * Method executed after the status update. It is executed also if the update is aborted.
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected afterUpdate(data: object, subjectName: string|null): boolean {
        // Custom
        if (this.behavior.afterUpdate) {
            return this.behavior.afterUpdate(this.getHtmlInputElementOrList(), data, subjectName);
        }
        // Standard
        return true; // Standard behavior: returns positive value
    }
}

export default DynamicElement;