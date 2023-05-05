import DynamicDropdown from './DynamicDropdown.js';
import DynamicElement from './DynamicElement.js';
import DynamicCheckbox from './DynamicCheckbox.js';
import DynamicRadio from './DynamicRadio.js';
import { FormConfiguration, FormBehavior, UpdateRule, InitialisationRule } from './FormConfigurationTypes';
import { FieldConfiguration } from './FieldConfigurationTypes';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm {
    /** @param {string} id - the form id */
    id: string;
    
    /** @param {boolean} debug - a flag to enable debug mode */
    debug: boolean;
    
    /** @param {FormBehavior} behavior - object which groups some properties related to form behavior */
    behavior: FormBehavior;
    
    /** @param {Map<String, DynamicElement>} fields - a collection of form's DynamicElements instances */
    fields: Map<string, DynamicElement>;
    
    /** @param {Map<string, UpdateRule[]} fieldUpdateRules - a collection of all update rules of the specified field name */
    fieldUpdateRules: Map<string, UpdateRule[]>;
    
    /** @param {FormConfiguration} config - the original form configuration */
    config: FormConfiguration;
    
    /** @param {HTMLFormElement} HTMLFormElement - the actual html element returned by getElementById */
    htmlElement: HTMLFormElement;
    
    /** @param {boolean} enabled - a flag to enable/disable the Dynamic Form */
    enabled: boolean;
    
    /** @param {JSON} elementToClassMapping - Object which maps a field's type attribute with the class to instantiate */
    elementToClassMapping = {
        'default': DynamicElement,
        'checkbox': DynamicCheckbox,
        'radio': DynamicRadio,
        'select-one': DynamicDropdown,
        'select-multiple': DynamicDropdown
    };

    initPromise: Promise<void>;
    
    /**
    * Class constructor.
    * @param {object} formConfiguration the form configuration in JSON format
    */
    constructor(formConfiguration: FormConfiguration) {
        this.id = formConfiguration.id;
        this.config = formConfiguration;
        this.htmlElement = document.forms[formConfiguration.id];
        this.debug = formConfiguration.debug === true;
        this.enabled = true;
        this.behavior = this.repairFormBehavior(formConfiguration.behavior);
        
        const repairedConfigurationFields = this.repairConfigurationFields(this.htmlElement, formConfiguration.fields ?? []);
        this.fields = this.createFieldsInstancesMap(repairedConfigurationFields, this.htmlElement);
        this.fieldUpdateRules = this.createFieldUpdateRulesMap(repairedConfigurationFields, formConfiguration.rules ?? []);
        
        const self = this;
        const initFields = formConfiguration.init ?? [];
        
        this.initPromise = this.handleInitialisation(this.fields, initFields, this.fieldUpdateRules, this.behavior)
    }
    
    private repairFormBehavior(behaviorConfig: FormBehavior): FormBehavior {
        const behavior = behaviorConfig ?? {};
        behavior.beforeInit = behavior.beforeInit ?? (() => {});
        behavior.afterInit = behavior.afterInit ?? (() => {});
        behavior.beforeUpdate = behavior.beforeUpdate ?? ((subjectName) => true);
        behavior.afterUpdate = behavior.afterUpdate ?? ((subjectName) => {});
        return behavior;
    }

    private repairConfigurationFields(formHtmlElement: HTMLFormElement, configurationFields: FieldConfiguration[]): FieldConfiguration[] {
        const configurationFieldsNames = new Set<string>();
        configurationFields.forEach(v => configurationFieldsNames.add(v.name));

        const formFieldsNames = new Set<string>();
        formHtmlElement
        .querySelectorAll('[name]')
        .forEach((v: HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement) => formFieldsNames.add(v.name));

        formFieldsNames.forEach(v => {
            if (!configurationFieldsNames.has(v)) {
                configurationFields.push({
                    name: v
                });
            }
        });
        return configurationFields;
    }
    
    private createFieldsInstancesMap(fieldsCollection: FieldConfiguration[], htmlFormElement: HTMLFormElement): Map<string, DynamicElement> {
        const fieldsMap = new Map<string, DynamicElement>();
        fieldsCollection.forEach((fieldConfig: FieldConfiguration) => {
            const queryResult = htmlFormElement.querySelectorAll(`[name="${fieldConfig.name}"]`);
            let type: string|null = null;
            
            if (queryResult.length === 0) {
                throw new Error(`Element ${fieldConfig.name} not found`);
            } else {
                type = (queryResult[0] as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement).type;
            }
            if (type == null || !this.elementToClassMapping[type]) {
                type = 'default';
            }
            const instance: DynamicElement = new this.elementToClassMapping[type](fieldConfig, this);
            fieldsMap.set(instance.name, instance);
        });
        return fieldsMap;
    }
    
    private createFieldUpdateRulesMap(fieldsCollection: FieldConfiguration[], rulesCollection: UpdateRule[]): Map<string, UpdateRule[]> {
        const fieldUpdateRules = new Map<string, UpdateRule[]>();
        fieldsCollection.forEach(f => fieldUpdateRules.set(f.name, [])); // All fields, even those for which there is no update rule
        rulesCollection.forEach(rule => {
            const previousRules = fieldUpdateRules.get(rule.name);
            fieldUpdateRules.set(rule.name, previousRules.concat(rule));
        });
        return fieldUpdateRules;
    }
    
    private handleInitialisation(fieldsCollection: Map<string, DynamicElement>, initFields: InitialisationRule[], fieldUpdateRules:Map<string, UpdateRule[]>, behavior: FormBehavior): Promise<void> {
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

        const tmpInitialStatusAsObject = {}; // TODO: Remove this ugly thing
        initialStatus.forEach((key, value) => {
            tmpInitialStatusAsObject[key] = value;
        });
        

        const initPromises: Promise<void>[] = initFields
        .filter(x => fieldsMap.get(x.name) !== undefined)
        .map(field => this.manualUpdate(tmpInitialStatusAsObject, field.name));
        
        await Promise.all(initPromises);
        
        // Set values in initialised fields
        for(const name of initialStatus.keys()) { // TODO: fix here for hashmap usage
            const value = initialStatus.get(name);
            const field = fieldsMap.get(name);
            if (field) {
                field.set(value);
            }
        }
        
        // For each initialised field notifies the next fields to update
        const initializedFields = initFields.map(f => f.name);
        const nextUpdatePromises = [];
        initializedFields
        .filter(fieldName => fieldsMap.get(fieldName) !== undefined)
        .forEach(fieldName => {
            const updateRules = fieldUpdateRules.get(fieldName);
            updateRules.forEach(updateRule => {
                // Update
                const params = this.fetchAllParameters(updateRule);
                updateRule.update.forEach(observerName => {
                    if (observerName === updateRule.name) { // This prevents loops
                        return;
                    }
                    if (initializedFields.includes(observerName)) { // Field already initialized
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
            const updateRules = this.fieldUpdateRules.get(subjectName);
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
        const params = {};
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
        const updateRules = this.fieldUpdateRules.get(currentSubject);
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
    public async manualUpdate(data: object, subjectName: string|null): Promise<void> {
        return this.getField(subjectName).update(data, null);
    }
    
    /**
    * Method to fetch a single dynamic field instance
    * @param {string} name name of dynamic field instance to retrieve
    * @returns the DynamicElement instance
    */
    private getField(name: string): DynamicElement {
        return this.fields.get(name);
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