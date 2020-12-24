import DynamicDropdown from './DynamicDropdown.js';
import DynamicElement from './DynamicElement.js';
import DynamicCheckbox from './DynamicCheckbox.js';
import DynamicRadio from './DynamicRadio.js';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm {

    /** @param {JSON} config the form configuration */
    config;

    /** @param {HTMLElement} htmlElement the actual html element returned by getElementById */
    htmlElement;

    /** @param {Map<String, DynamicElement>} entities a collection of form's DynamicElements */
    entities;

    /** @param {boolean} debug a flag to enable debug mode */
    debug;

    /** @param {JSON} elementToClassMapping Object which maps a field's type attribute with the class to instantiate */
    elementToClassMapping = {
        'default': DynamicElement,
        'checkbox': DynamicCheckbox,
        'radio': DynamicRadio,
        'select-one': DynamicDropdown,
        'select-multiple': DynamicDropdown,
    };

    /**
    * Class constructor.
    * @param {JSON} formConfiguration the form configuration in JSON format
    */
    constructor(formConfiguration) {
        let self = this;
        self.config = formConfiguration;
        self.htmlElement = document.getElementById(formConfiguration.id);
        self.entities = new Map();
        self.debug = formConfiguration.debug === true;

        // Repairing config file if parameters are missing (to write code easily)
        self.config.behavior = self.config.behavior ?? {};
        self.config.fields = self.config.fields ?? {};
        self.config.rules = self.config.rules ?? {};
        self.config.init = self.config.init ?? {};


        // Create fields instance
        formConfiguration.fields.forEach(element => {
            let queryResult = self.htmlElement.querySelectorAll(`[name=${element.name}]`);
            let type = null, instance = null;

            if (queryResult.length == 0) {
                throw new Error(`Element ${element.name} not found`);
            } else if (queryResult.length == 1) {
                type = queryResult[0].type; // Use the type of field
            } else {
                // if (Array.from(queryResult).every(current => current.type === 'radio')) { // Multiple radio only if all fields have the same name
                type = queryResult[0].type;
                // }
            }
            if (type == null || !this.elementToClassMapping[type]) {
                type = 'default';
            }
            instance = new this.elementToClassMapping[type](element, self);
            this.entities.set(instance.name, instance);
        });

        // Init fields
        formConfiguration.init.forEach(initRule => {
            let field = initRule.name;
            let data = initRule.data;
            self.manualUpdate(data, field);
        });
    }

    /**
     * Method to notify the change of the subject to all its observers (Observer Design Pattern).
     * @param {string} subjectName the name of the field who changed
     */
    notify(subjectName) {
        let subject = this.getField(subjectName);
        let subjectValue = subject.get();
        if (this.debug) {
            console.log(`> [${subjectName}] Changed. Notifying observers...`);
        }
        if (subjectValue && this.config.behavior.beforeUpdate) { // Check if notify must be aborted (only if selected value is defined)
            let beforeUpdateResult = this.config.behavior.beforeUpdate(this, subjectName);
            if (beforeUpdateResult === false) {
                return;
            }
        }
        let updatePromises = [];
        this.config.rules // Todo: use data structure for best performance
            .filter((e) => { return e.change === subjectName; })
            .forEach(rule => {
                // Update
                let params = this.fetchAllParameters(rule);
                rule.update.forEach(observerName => {
                    if (observerName === subjectName) { // This prevents loop
                        return;
                    }
                    if (this.debug)
                        console.log(`> > [${subjectName}] ==update==> [${this.getField(observerName).name}]`);
                    let observer = this.getField(observerName);
                    let observerPromise = observer.update(params, subjectName);
                    updatePromises.push(observerPromise);
                    // Clear
                    this.clearCascade(observerName);
                });
            });
        if (this.config.behavior.afterUpdate) {
            Promise.allSettled(updatePromises).then((values) => {
                this.config.behavior.afterUpdate(this, subjectName);
            });
        }
    }

    /**
     * Method to retrieve all parameter required for a remote call according to a form update rule.
     * @param {JSON} rule a specific form update rule
     * @return an object merging sender data and additional data
     */
    fetchAllParameters(rule) {
        let params = {};
        let subjectName = rule.change;
        let subjectValue = this.getField(subjectName).get();
        params[subjectName] = subjectValue;
        // Fetch additional data from the form
        if (rule.additionalData) {
            rule.additionalData.forEach((additional) => {
                params[additional] = this.getField(additional).get();
            });
        }
        // Fetch external data from a user specified function (outside the form)
        if (rule.externalData) {
            let externalData = rule.externalData();
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
        this.config.rules
            .filter((e) => { return e.change === currentSubject })
            .forEach(rule => {
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
        return this.entities.get(name);
    }

    /**
     * Return form's id
     * @return {string} the form id
     */
    getId() {
        return this.htmlElement.id;
    }

}
export default DynamicForm;