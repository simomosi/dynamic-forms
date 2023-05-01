import DynamicForm from './DynamicForm';
import { FieldBehaviorConfiguration, FieldConfiguration, FieldFetchConfiguration, FieldIoConfiguration } from './FieldConfigurationTypes';

/**
 * This class represents a Dynamic Element in a form.
 * In particular it is a generic input element, whose behavior is based on element.value property
 */
class DynamicElement {
    /** @param {object} config - the element configuration */
    config: FieldConfiguration;

    /** @param {NodeList} htmlElement - the HTML Element returned by querySelectorAll. If more than one exists, the element is a NodeList */
    htmlElement: NodeList;

    /** @param {string} name - the element name */
    name: string;

    /** @param {object} io - object which groups some properties related to field input/output */
    io: FieldIoConfiguration;

    /** @param {object} fetch - object which groups some properties related to remote calls */
    fetch: FieldFetchConfiguration; // todo maybe we can move this property to DynamicDropdown ?

    /** @param {object} behavior - object which groups some properties related to field behavior */
    behavior: FieldBehaviorConfiguration;

    /** @param {object} defaultConfig - property with default configuration values */
    static defaultConfig = {
        'io': {
            'event': 'change',
        }
    }

    /**
    * Class constructor
    * @param {FieldConfiguration} config the element configuration
    * @param {DynamicForm} dynamicForm the DynamicForm instance
    * @async
    */
    constructor(config: FieldConfiguration, dynamicForm: DynamicForm) {
        this.config = config;
        // Repairing config file if parameters are missing (to write code easily)
        this.io = config.io ?? {};
        this.fetch = config.fetch ?? {}; // todo remove
        this.behavior = config.behavior ?? {};

        let event = this.io.event ?? DynamicElement.defaultConfig.io.event;

        this.htmlElement = dynamicForm.htmlElement.querySelectorAll(`[name="${config.name}"]`); // TODO: make the query only in DynamicForm
        // this.name = this.htmlElement[0].name;
        this.name = config.name;
        if (this.htmlElement.length === 0) {
            throw new Error(`Element ${config.name} not found`);
        } else {
            this.htmlElement.forEach(current => {
                current.addEventListener(event, (e) => { dynamicForm.notify((e.target as HTMLInputElement).name); });
            });
        }
    }

    private getElement(): HTMLInputElement | NodeList {
        if (this.htmlElement.length === 1) {
            return this.htmlElement[0] as HTMLInputElement;
        }
        return this.htmlElement;
    }

    /**
    * Method to get the field value
    * @returns {string} the value
    */
    public get(): any {
        // Custom
        if (this.io.get) {
            return this.io.get(this.getElement());
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
            return this.io.set(this.getElement(), value);
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
            return this.behavior.clear(this.getElement());
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
            this.updateStatus(data, subjectName);
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
            return this.behavior.beforeUpdate(this.getElement(), data, subjectName);
        }
        // Standard
        return true; // Does not block field update
    }

    /**
     * Method to update the DynamicElement status.
     * @param {object} data data useful to the element's status change
     * @param {string|null} subjectName name of the changed subject
     */
    protected updateStatus(data: object, subjectName: string|null): void {
        // Custom
        if (this.behavior.updateStatus) {
            return this.behavior.updateStatus(this.getElement(), data, subjectName);
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
            return this.behavior.afterUpdate(this.getElement(), data, subjectName);
        }
        // Standard
        return true; // Standard behavior: returns positive value
    }
}

export default DynamicElement;