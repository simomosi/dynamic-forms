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
    /** @param {Map<String, DynamicDropdown>} entities a collection of form's DynamicFields */
    entities;
    /** @param {boolean} debug a flag to enable debug mode */
    debug;

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
            let instance = null;

        const elementToClassMapping = {
            'default': DynamicElement,
            'checkbox': DynamicCheckbox,
            'radio': DynamicRadio,
            'select-one': DynamicDropdown,
            'select-multiple': DynamicDropdown,
        };
            let type = null;
            if (queryResult.length == 0) {
                throw new Error(`Element ${element.name} not found`);
            } else if (queryResult.length == 1) {
                type = queryResult[0].type; // Use the type of field
            } else {
                // if (Array.from(queryResult).every(current => current.type === 'radio')) { // Multiple radio only if all fields have the same name
                    type = queryResult[0].type;
                // }
            }
            if (type == null || !elementToClassMapping[type]) {
                type = 'default';
            }
            instance = new elementToClassMapping[type](element, self);
            this.entities.set(instance.name, instance);
        });

        // Init fields
        formConfiguration.init.forEach(element => {
            self.manualUpdate(element, {});
        });
    }

    /**
     * Method to notify the change of the subject to all its observers (Observer Design Pattern).
     * @param {string} senderName the name of the field who changed
     */
    notify(senderName) {
        let senderValue = this.entities.get(senderName).get();
        if (this.debug) {
            console.log(`> [${senderName}] Changed. Notifying observers...`);
        }
        if (senderValue && this.config.behavior.beforeUpdate) { // Check if notify must be aborted (only if selected value is defined)
            let beforeUpdateResult = this.config.behavior.beforeUpdate(this, senderName);
            if (beforeUpdateResult === false) {
                return;
            }
        }
        let updatePromises = [];
        this.config.rules // Todo: use data structure for best performance
            .filter((e) => { return e.change === senderName; })
            .forEach(rule => {
                // Update
                let params = this.fetchAllParameters(rule);
                rule.update.forEach(element => {
                    if (this.debug)
                        console.log(`> > [${senderName}] ==update==> [${this.entities.get(element).name}]`);
                    updatePromises.push(this.entities.get(element).update(senderName, params));
                    // Clear
                    this.clearCascade(element);
                });
            });
        if (this.config.behavior.afterUpdate) {
            Promise.allSettled(updatePromises).then((values) => {
                this.config.behavior.afterUpdate(this, senderName);
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
        let senderName = rule.change;
        let senderValue = this.entities.get(senderName).get();
        params[senderName] = senderValue;
        if (rule.additionalData) {
            rule.additionalData.forEach((additional) => {
                params[additional] = this.entities.get(additional).get();
            });
        }
        return params;
    }

    /**
     * Method to clear fields on cascade when the subject changes.
     * The fields cleared are the subjects'observers'observers.
     * This implementation uses the DFS algorithm.
     * @param {string} actualNodeName node name whom observers will be cleared
     * @param {array} visited array of already cleared (visited) nodes
     */
    async clearCascade(actualNodeName, visited = []) {
        visited.push(actualNodeName)
        this.config.rules
            .filter((e) => { return e.change === actualNodeName })
            .forEach(rule => {
                rule.update.forEach(target => {
                    if (!visited.includes(target)) {
                        if (this.debug)
                            console.log(`> > > [${actualNodeName}] ==x==> [${this.entities.get(target).name}]`);
                        this.entities.get(target).clear(this.entities.get(target));
                        this.clearCascade(target, visited);
                    }
                })
            })
    }

    /**
     * Method to manual trigger the update function of a subject.
     * @param {string} name name of the subject who changed
     * @param {JSON} data data to pass to the update function
     */
    async manualUpdate(name, data) {
        return this.entities.get(name).update(null, data);
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