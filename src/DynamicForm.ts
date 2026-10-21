import DynamicElement from './DynamicElement';
import { ResolvedFormConfiguration, FormHooks, UpdateRule, InitialisationRule } from './FormConfigurationTypes';
import { FieldConfiguration, UpdateData } from './FieldConfigurationTypes';
import { Observer, Subject } from './ObserverPatternTypes';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm implements Subject {
    /** @param {string} id - the form id */
    readonly id: string;
    
    /** @param {boolean} debug - a flag to enable debug mode */
    debug: boolean;
    
    /** @param {FormHooks} behavior - the form hooks */
    behavior: FormHooks;
    
    /** @param {Map<String, DynamicElement>} fields - a collection of form's DynamicElements instances */
    fieldsMap: Map<string, DynamicElement>;
    
    /** @param {Map<string, UpdateRule[]} fieldUpdateRules - a collection of all update rules of the specified field name */
    fieldUpdateRulesMap: Map<string, UpdateRule[]>;
    
    /** @param {ResolvedFormConfiguration} config - the form configuration completed with defaults */
    config: ResolvedFormConfiguration;
    
    /** @param {HTMLFormElement} HTMLFormElement - the actual html element returned by getElementById */
    readonly htmlElement: HTMLFormElement;
    
    /** @param {boolean} enabled - a flag to enable/disable the Dynamic Form */
    enabled: boolean;

    /** @param {Promise<void>} initPromise - promise fulfilled when dynamicform initialisation is complete */
    initPromise: Promise<void>;
    
    /**
    * Class constructor.
    * @param {object} formConfiguration the form configuration in JSON format
    */
    constructor(formHtmlElement: HTMLFormElement, formConfiguration: ResolvedFormConfiguration, fieldsMap: Map<string, DynamicElement>) {
        this.id = formConfiguration.id;
        this.config = formConfiguration;
        const form = document.forms.namedItem(formConfiguration.id);
        if (!form) {
            throw new Error(`Form ${formConfiguration.id} not found`);
        }
        this.htmlElement = formHtmlElement;
        this.debug = formConfiguration.debug;
        this.enabled = true;
        this.behavior = formConfiguration.behavior;
        
        this.fieldsMap = fieldsMap;
        this.fieldUpdateRulesMap = this.createFieldUpdateRulesMap(formConfiguration.fields, formConfiguration.rules);
        
        this.fieldsMap.forEach((field) => {
            this.attach(field);
        });
        this.initPromise = this.handleInitialisation(this.fieldsMap, formConfiguration.init, this.behavior)
    }
    
    private createFieldUpdateRulesMap(fieldsCollection: FieldConfiguration[], rulesCollection: UpdateRule[] = []): Map<string, UpdateRule[]> {
        const fieldUpdateRules = new Map<string, UpdateRule[]>();
        fieldsCollection.forEach(f => fieldUpdateRules.set(f.name, [])); // All fields, even those for which there is no update rule
        rulesCollection.forEach(rule => {
            const previousRules = fieldUpdateRules.get(rule.name) ?? [];
            fieldUpdateRules.set(rule.name, previousRules.concat(rule));
        });
        return fieldUpdateRules;
    }
    
    private handleInitialisation(fieldsCollection: Map<string, DynamicElement>, initFields: InitialisationRule[] = [], behavior: FormHooks): Promise<void> {
        if (!initFields) {
            return Promise.resolve();
        }
        return Promise.resolve()
            .then(() => behavior.beforeInit())
            .then(() => this.initialiseFields(fieldsCollection, initFields))
            .then(() => behavior.afterInit());
    }
    
    private async initialiseFields(fieldsMap: Map<string, DynamicElement>, initFields: InitialisationRule[]): Promise<void> {
        // Create an object which holds the form's initial status
        const initialStatus = new Map<string, any>(); // TODO: use a map for better performance
        initFields
        .filter(x => x.value !== undefined)
        .forEach(element => initialStatus.set(element.name, element.value));
        
        // Initialize "init" fields
        if (this.debug) {
            console.log(`==init==> `, initFields.reduce((acc, curr) => acc + `[${curr.name}] `, ''));
            console.log(`Parameters:`, initialStatus);
        }

        const tmpInitialStatusAsObject = Object.fromEntries(initialStatus); // Evaluate if using maps instead of objects makes the module harder to use
        const initPromises: Promise<void>[] = initFields
        .filter(x => fieldsMap.get(x.name) !== undefined)
        .map(field => this.manualUpdate(tmpInitialStatusAsObject, field.name));
        
        await Promise.all(initPromises);
        
        // Set initial values in initialised fields
        for (const [name, value] of initialStatus) {
            const field = fieldsMap.get(name);
            if (field) {
                field.set(value);
            }
        }
        
        // Update the observers of the initialised fields, leaving the initialised fields untouched
        const initialisedFieldsNames = initFields.map(f => f.name).filter(name => fieldsMap.get(name) !== undefined);
        await this.propagate(initialisedFieldsNames, new Set(initialisedFieldsNames));
    }
    /**
     * Method used to understand when the dynamic-form initialisation is completed
     * @returns {Promise<void>} promise resolved when initialisation is completed
     */
    public ready(): Promise<void> {
        return this.initPromise;
    }

    public attach(observer: Observer): void {
        observer.attach(this);
    }
    
    /**
    * Method to notify the change of the subject to all its observers (Observer Design Pattern).
    * @param {string} subjectName the name of the field who changed
    * @returns {Promise<void>} promise resolved when all updates are completed
    */
    public async notify(subjectName: string): Promise<void> {
        if (this.isEnabled() === false) {
            return;
        }
        //const subject = this.getField(subjectName);
        //const subjectValue = subject.get();
        if (this.debug) {
            console.log(`-\n${new Date()}\n> [${subjectName}] Changed. Notifying observers...\n-`);
        }
        
        if (this.behavior.beforeUpdate(subjectName)) {
            await this.propagate([subjectName], new Set());
        }
        this.behavior.afterUpdate(subjectName);
    }

    /**
     * Updates the observers of the given subjects and clears on cascade the fields beyond them.
     * @param {string[]} subjects names of the changed subjects
     * @param {Set<string>} untouched names of the fields neither updated nor cleared
     * @returns {Promise<void>} promise resolved when all updates are completed
     */
    private async propagate(subjects: string[], untouched: Set<string>): Promise<void> {
        // Collect the updates first, so that the update data is read before any field is cleared
        const updates: { observerName: string, params: UpdateData, subjectName: string }[] = [];
        subjects.forEach(subjectName => {
            const updateRules = this.fieldUpdateRulesMap.get(subjectName) ?? [];
            updateRules.forEach(rule => {
                const params = this.fetchAllParameters(rule);
                rule.update.forEach(observerName => {
                    if (!untouched.has(observerName)) {
                        updates.push({ observerName, params, subjectName });
                    }
                });
            });
        });
        // Clear before updating, so that a cascade clear never undoes an update
        const visited = new Set<string>();
        updates.forEach(({ observerName }) => this.clearCascade(observerName, untouched, visited));
        // Update
        await Promise.all(updates.map(({ observerName, params, subjectName }) => {
            if (this.debug) {
                console.log(`> > [${subjectName}] ==update==> [${observerName}]`);
                console.log(`Parameters:`, params);
            }
            return this.getField(observerName).update(params, subjectName);
        }));
    }
    
    /**
    * Method to retrieve all parameter required for a remote call according to a form update rule.
    * @param {UpdateRule} rule a specific form update rule
    * @return an object merging sender data and additional data
    */
    private fetchAllParameters(rule: UpdateRule): UpdateData {
        const subjectName = rule.name;
        const subjectValue = this.getField(subjectName).get();
        const params: {[key: string]:any} = {};
        params[subjectName] = subjectValue;
        // Fetch additional data from the form
        if (rule.additionalData) {
            rule.additionalData.forEach((additional) => {
                params[additional] = this.getField(additional).get();
            });
        }
        // Fetch external data from a user specified function (outside the form)
        if (rule.externalData) {
            const externalData = rule.externalData(params, subjectName);
            Object.assign(params, externalData); // params <- params U externalData
        }
        return params;
    }
    
    /**
    * Method to clear fields on cascade when the subject changes.
    * The fields cleared are the subjects'observers'observers.
    * This implementation uses the DFS algorithm.
    * @param {string} currentSubject node name whom observers will be cleared
    * @param {Set<string>} untouched names of the fields not to clear, whose observers are still cleared
    * @param {Set<string>} visited names of the already visited fields, shared by the cascade clears of one propagation
    */
    private clearCascade(currentSubject: string, untouched: Set<string>, visited: Set<string>): void {
        const updateRules = this.fieldUpdateRulesMap.get(currentSubject) ?? [];
        updateRules.forEach(rule => {
            rule.update.forEach(observer => {
                if (visited.has(observer)) {
                    return;
                }
                visited.add(observer);
                if (!untouched.has(observer)) {
                    if (this.debug){
                        console.log(`> > > [${currentSubject}] ==x==> [${observer}]`);
                    }
                    this.getField(observer).clear();
                }
                this.clearCascade(observer, untouched, visited);
            });
        });
    }
    
    /**
    * Method to manual trigger the update function of a subject.
    * @param {UpdateData} data data useful to the element's status change
    * @param {string} subjectName name of the changed subject
    * @returns a Promise in fulfilled state when element status has been updated
    */
    public async manualUpdate(data: UpdateData, subjectName: string): Promise<void> {
        const field = this.getField(subjectName);
        if (field) {
            return field.update(data, null);
        }
        return;
    }
    
    /**
    * Method to fetch a single dynamic field instance
    * @param {string} name name of dynamic field instance to retrieve
    * @returns the DynamicElement instance
    */
    private getField(name: string): DynamicElement {
        const element = this.fieldsMap.get(name);
        if (!element) {
            throw new Error("Unknown element")
        }
        return element;
    }
    
    /**
    * Return form's id
    * @return {string} the form id
    */
    public getId(): string {
        return this.id;
    }
    
    /**
    * Method to enable/disable the form update
    * @param {boolean} enable true to enable the form update, false otherwise
    */
    public setEnabled(enable: boolean): void {
        this.enabled = !!enable;
        if (this.debug) {
            console.log(`Form enabled: ${this.enabled}`);
        }
    }
    
    /**
    * Method to know if the form update is currently enabled
    * @return {boolean} true if the form is currently enabled, false otherwise
    */
    public isEnabled(): boolean {
        return this.enabled;
    }
    
}

export default DynamicForm;