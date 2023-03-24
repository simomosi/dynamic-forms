import DynamicDropdown from './DynamicDropdown.js';
import DynamicElement from './DynamicElement.js';
import DynamicCheckbox from './DynamicCheckbox.js';
import DynamicRadio from './DynamicRadio.js';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm {
    /** @param {int} id - the form id */
    id;
    
    /** @param {boolean} debug - a flag to enable debug mode */
    debug;
    
    /** @param {object} behavior - object which groups some properties related to form behavior */
    behavior;
    
    /** @param {Map<String, DynamicElement>} fields - a collection of form's DynamicElements instances */
    fields;
    
    /** @param {Object[]} rules - a collection of form's rule objects */
    rules;
    
    /** @param {Object[]} init - a collection of form's init objects */
    init;
    
    /** @param {JSON} config - the original form configuration */
    config;
    
    /** @param {node} htmlElement - the actual html element returned by getElementById */
    htmlElement;
    
    /** @param {boolean} enabled - a flag to enable/disable the Dynamic Form */
    enabled;
    
    /** @param {JSON} elementToClassMapping - Object which maps a field's type attribute with the class to instantiate */
    elementToClassMapping = {
        'default': DynamicElement,
        'checkbox': DynamicCheckbox,
        'radio': DynamicRadio,
        'select-one': DynamicDropdown,
        'select-multiple': DynamicDropdown
    };
    
    /**
    * Class constructor.
    * @param {object} formConfiguration the form configuration in JSON format
    */
    constructor(formConfiguration) {
        let self = this;
        self.id = formConfiguration.id;
        self.config = formConfiguration;
        self.htmlElement = document.forms[formConfiguration.id];
        self.fields = new Map();
        self.rules = formConfiguration.rules ?? [];
        self.init = formConfiguration.init ?? [];
        self.debug = formConfiguration.debug === true;
        self.enabled = true;
        self.behavior = formConfiguration.behavior ?? {};
        
        // Create fields instance
        this.#createFieldsInstances(formConfiguration, self);
        
        // Init fields
        if (formConfiguration.init) {
            if (formConfiguration.behavior.beforeInit) {
                formConfiguration.behavior.beforeInit();
            }
            
            const initPromise = this.#handleFieldInit(self, formConfiguration);
            
            if (formConfiguration.behavior.afterInit) {
                initPromise.then((values) => {
                    formConfiguration.behavior.afterInit();
                });
            }
        }
    }
    
    // TODO: remove formConfiguration dependency
    #createFieldsInstances(formConfiguration, self) {
        formConfiguration.fields.forEach(fieldConfig => {
            let queryResult = self.htmlElement.querySelectorAll(`[name="${fieldConfig.name}"]`);
            let type = null, instance = null;
            
            if (queryResult.length === 0) {
                throw new Error(`Element ${fieldConfig.name} not found`);
            } else if (queryResult.length === 1) {
                type = queryResult[0].type; // Use the type of field
            } else {
                // if (Array.from(queryResult).every(current => current.type === 'radio')) { // Multiple radio only if all fields have the same name
                type = queryResult[0].type;
                // }
            }
            if (type == null || !this.elementToClassMapping[type]) {
                type = 'default';
            }
            instance = new this.elementToClassMapping[type](fieldConfig, self);
            this.fields.set(instance.name, instance);
        });
    }
    
    #handleFieldInit(self) {
        const initialStatus = {}; // new Map(); // TODO: use a map for better performance
        self.init
        .filter(x => x.value !== undefined)
        .forEach(element => initialStatus[element.name] = element.value /*initialStatus.set(element.name, element.value)*/);
        
        // Initialize "init" fields
        if (this.debug) {
            console.log(`==init==> `, self.init.reduce((acc, curr) => acc + `[${curr.name}] `, ''));
            console.log(`Parameters:`, initialStatus);
        }
        const initPromises = self.init
        .filter(x => self.fields.get(x.name) !== undefined)
        .map(field => self.manualUpdate(initialStatus, field.name));
        const setValuesPromise = Promise.all(initPromises).then(result => {
            for(const [name, value] of Object.entries(initialStatus)) { // TODO: fix here for hashmap usage
                const field = self.fields.get(name);
                if (field) {
                    field.set(value);
                }
            }
        });

        // Notifies fields about previous fields initialization
        return setValuesPromise.then(result => {
            const initializedFields = self.init.map(f => f.name);
            const nextUpdatePromises = [];
            self.rules
            .filter(r => initializedFields.includes(r.name))
            .forEach(updateRule => {
                // Update
                let params = this.fetchAllParameters(updateRule);
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
                    let observer = this.getField(observerName);
                    let observerPromise = observer.update(params, updateRule.name);
                    nextUpdatePromises.push(observerPromise);
                    // Clear
                    this.clearCascade(observerName);
                });
            });
            return Promise.all(nextUpdatePromises);
        });
    }
    
    /**
    * Method to notify the change of the subject to all its observers (Observer Design Pattern).
    * @param {string} subjectName the name of the field who changed
    */
    notify(subjectName) {
        if (this.isEnabled() === false) {
            return;
        }
        let subject = this.getField(subjectName);
        let subjectValue = subject.get();
        if (this.debug) {
            console.log(`-\n${new Date()}\n> [${subjectName}] Changed. Notifying observers...\n-`);
        }
        let beforeUpdateResult = null;
        if (this.behavior.beforeUpdate) { // Check if notify must be aborted (only if selected value is defined)
            beforeUpdateResult = this.behavior.beforeUpdate(subjectName);
        }
        
        let updatePromises = [];
        if (beforeUpdateResult !== false) {
            this.rules
            .filter((e) => {
                return e.name === subjectName;
            })
            .forEach(rule => {
                // Update
                let params = this.fetchAllParameters(rule);
                rule.update.forEach(observerName => {
                    if (observerName === subjectName) { // This prevents loops
                        return;
                    }
                    if (this.debug) {
                        console.log(`> > [${subjectName}] ==update==> [${this.getField(observerName).name}]`);
                        console.log(`Parameters:`, params);
                    }
                    let observer = this.getField(observerName);
                    let observerPromise = observer.update(params, subjectName);
                    updatePromises.push(observerPromise);
                    // Clear
                    this.clearCascade(observerName);
                });
            });
        }
        
        if (this.behavior.afterUpdate) {
            Promise.allSettled(updatePromises).then((values) => {
                this.behavior.afterUpdate(subjectName);
            });
        }
    }
    
    /**
    * Method to retrieve all parameter required for a remote call according to a form update rule.
    * @param {JSON} rule a specific form update rule
    * @return an object merging sender data and additional data
    */
    fetchAllParameters(rule) {
        let subjectName = rule.name;
        let subjectValue = this.getField(subjectName).get();
        let params = {};
        params[subjectName] = subjectValue;
        // Fetch additional data from the form
        if (rule.additionalData) {
            rule.additionalData.forEach((additional) => {
                params[additional] = this.getField(additional).get();
            });
        }
        // Fetch external data from a user specified function (outside the form)
        if (rule.externalData) {
            let externalData = rule.externalData(params, subjectName);
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
    async clearCascade(currentSubject, visited = []) {
        visited.push(currentSubject)
        this.rules.filter((e) => {
            return e.name === currentSubject
        }).forEach(rule => {
            rule.update.forEach(observer => {
                if (!visited.includes(observer)) {
                    if (this.debug)
                    console.log(`> > > [${currentSubject}] ==x==> [${this.getField(observer).name}]`);
                    this.getField(observer).clear(this.getField(observer));
                    this.clearCascade(observer, visited);
                }
            })
        })
    }
    
    /**
    * Method to manual trigger the update function of a subject.
    * @param {JSON} data data useful to the element's status change
    * @param {string} subjectName name of the changed subject
    * @returns a Promise in fulfilled state when element status has been updated
    */
    async manualUpdate(data, subjectName) {
        return this.getField(subjectName).update(data, null);
    }
    
    /**
    * Method to fetch a single dynamic field instance
    * @param {string} name name of dynamic field instance to retrieve
    * @returns the DynamicElement instance
    */
    getField(name) {
        return this.fields.get(name);
    }
    
    /**
    * Return form's id
    * @return {string} the form id
    */
    getId() {
        return this.id;
    }
    
    /**
    * Method to enable/disable the form update
    * @param {boolean} enable true to enable the form update, false otherwise
    */
    setEnabled(enable) {
        this.enabled = !!enable;
        if (this.debug) {
            console.log(`Form enabled: ${this.enabled}`);
        }
    }
    
    /**
    * Method to know if the form update is currently enabled-
    * @return {boolean} true if the form is currently enabled, false otherwise
    */
    isEnabled() {
        return !!this.enabled;
    }
    
}

export default DynamicForm;