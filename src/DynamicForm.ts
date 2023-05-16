import DynamicElement from './DynamicElement';
import { FormConfiguration, FormBehavior, UpdateRule, InitialisationRule } from './FormConfigurationTypes';
import { FieldConfiguration } from './FieldConfigurationTypes';
import { Subject } from './ObserverPatternTypes';
import { FormConfigurationFixer } from './FormConfigurationFixer';
import { FieldConfigurationFixer } from './FieldConfigurationFixer';
import { FieldBuilder } from './FieldBuilder';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm implements Subject {
    /** @param {string} id - the form id */
    readonly id: string;
    
    /** @param {boolean} debug - a flag to enable debug mode */
    debug: boolean;
    
    /** @param {FormBehavior} behavior - object which groups some properties related to form behavior */
    behavior: FormBehavior;
    
    /** @param {Map<String, DynamicElement>} fields - a collection of form's DynamicElements instances */
    fieldsMap: Map<string, DynamicElement>;
    
    /** @param {Map<string, UpdateRule[]} fieldUpdateRules - a collection of all update rules of the specified field name */
    fieldUpdateRulesMap: Map<string, UpdateRule[]>;
    
    /** @param {FormConfiguration} config - the original form configuration */
    config: FormConfiguration;
    
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
    constructor(formConfiguration: FormConfiguration) {
        this.id = formConfiguration.id;
        this.config = formConfiguration;
        const form = document.forms.namedItem(formConfiguration.id);
        if (!form) {
            throw new Error(`Form ${formConfiguration.id} not found`);
        }
        this.htmlElement = form;
        this.debug = formConfiguration.debug === true;
        this.enabled = true;
        this.behavior = (new FormConfigurationFixer()).fixBehavior(formConfiguration.behavior);
        
        const completeConfigurationFields = (new FieldConfigurationFixer()).fix(this.htmlElement, formConfiguration.fields);
        this.fieldsMap = (new FieldBuilder()).createFieldsMap(completeConfigurationFields, this);
        this.fieldUpdateRulesMap = this.createFieldUpdateRulesMap(completeConfigurationFields, formConfiguration.rules);
        
        this.initPromise = this.handleInitialisation(this.fieldsMap, formConfiguration.init, this.fieldUpdateRulesMap, this.behavior)
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
    
    private handleInitialisation(fieldsCollection: Map<string, DynamicElement>, initFields: InitialisationRule[] = [], fieldUpdateRules:Map<string, UpdateRule[]>, behavior: FormBehavior): Promise<void> {
        if (!initFields) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            Promise.resolve()
            .then(() => behavior.beforeInit())
            .then(() => {
                return this.initialiseFields(fieldsCollection, initFields, fieldUpdateRules);
            })
            .then(() => {
                behavior.afterInit();
                resolve();
            });
        });
    }
    
    private async initialiseFields(fieldsMap: Map<string, DynamicElement>, initFields: InitialisationRule[], fieldUpdateRules: Map<string, UpdateRule[]>): Promise<void> {
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
        
        // For each initialised field notifies the next fields to update
        const initializedFieldsNames = initFields.map(f => f.name);
        const nextUpdatePromises: Array<Promise<void>> = [];
        initializedFieldsNames
        .filter(fieldName => fieldsMap.get(fieldName) !== undefined)
        .forEach(fieldName => {
            const updateRules = fieldUpdateRules.get(fieldName) ?? [];
            updateRules.forEach(updateRule => {
                // Update
                const params = this.fetchAllParameters(updateRule);
                updateRule.update.forEach(observerName => {
                    if (observerName === updateRule.name) { // This prevents loops
                        return;
                    }
                    if (initializedFieldsNames.includes(observerName)) { // Field already initialized
                        return;
                    }
                    if (this.debug) {
                        console.log(`> > [${updateRule.name}] ==update==> [${this.getField(observerName).name}]`);
                        console.log(`Parameters:`, params);
                    }
                    const observer = this.getField(observerName);
                    const observerPromise = observer.update(params, updateRule.name);
                    nextUpdatePromises.push(observerPromise);
                    // Clear
                    this.clearCascade(observerName);
                });
            });
        });
        
        await Promise.all(nextUpdatePromises);
    }
    
    /**
     * Method used to understand when the dynamic-form initialisation is completed
     * @returns {Promise<void>} promise resolved when initialisation is completed
     */
    public ready(): Promise<void> {
        return this.initPromise;
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
        const subject = this.getField(subjectName);
        const subjectValue = subject.get();
        if (this.debug) {
            console.log(`-\n${new Date()}\n> [${subjectName}] Changed. Notifying observers...\n-`);
        }
        
        const updatePromises: Promise<void>[] = [];
        const beforeUpdateResult = this.behavior.beforeUpdate(subjectName);
        if (beforeUpdateResult) {
            const updateRules = this.fieldUpdateRulesMap.get(subjectName) ?? [];
            updateRules.forEach(rule => {
                // Update
                const params = this.fetchAllParameters(rule);
                rule.update.forEach(observerName => {
                    if (observerName === subjectName) { // This prevents loops
                        return;
                    }
                    if (this.debug) {
                        console.log(`> > [${subjectName}] ==update==> [${this.getField(observerName).name}]`);
                        console.log(`Parameters:`, params);
                    }
                    const observer = this.getField(observerName);
                    const observerPromise = observer.update(params, subjectName);
                    updatePromises.push(observerPromise);
                    // Clear
                    this.clearCascade(observerName);
                });
            });
        }
        await Promise.all(updatePromises);
        this.behavior.afterUpdate(subjectName);
        return;
    }
    
    /**
    * Method to retrieve all parameter required for a remote call according to a form update rule.
    * @param {UpdateRule} rule a specific form update rule
    * @return an object merging sender data and additional data
    */
    private fetchAllParameters(rule: UpdateRule): object {
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
    * @param {array} visited array of already cleared (visited) nodes
    */
    private async clearCascade(currentSubject: string, visited: string[] = []): Promise<void> {
        visited.push(currentSubject);
        const updateRules = this.fieldUpdateRulesMap.get(currentSubject) ?? [];
        updateRules.forEach(rule => {
            rule.update.forEach(observer => {
                if (!visited.includes(observer)) {
                    if (this.debug){
                        console.log(`> > > [${currentSubject}] ==x==> [${this.getField(observer).name}]`);
                    }
                    this.getField(observer).clear();
                    this.clearCascade(observer, visited);
                }
            })
        })
    }
    
    /**
    * Method to manual trigger the update function of a subject.
    * @param {object} data data useful to the element's status change
    * @param {string} subjectName name of the changed subject
    * @returns a Promise in fulfilled state when element status has been updated
    */
    public async manualUpdate(data: object, subjectName: string): Promise<void> {
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