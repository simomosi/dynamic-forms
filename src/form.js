import DynamicDropdown from './dropdown.js';

/**
* This class represents a form with dynamic content, e.g. select with variable options, updating rules and visibility depending on fields' state...
*/
class DynamicForm {

    /** @param {JSON} config the form configuration */
    config;
    /** @param {HTMLElement} htmlElement the actual html element returned by getElementById */
    hmtlElement;
    /** @param {Map<String, DynamicDropdown>} entities a collection of form's dynamic fields */
    entities;
    /** @param {boolean} debug a flag to enable debug mode */
    debug;

    /**
    * Class constructor.
    * @param {JSON} formConfiguration the form configuration in JSON format
    * @async
    */
    constructor(formConfiguration) {
        let self = this;
        new Promise((accept) => {
            self.config = formConfiguration;
            self.hmtlElement = document.getElementById(formConfiguration.id);
            self.entities = new Map();
            self.debug = formConfiguration.debug === true;

            // Repairing config file if parameters are missing (to write code easily)
            self.config.behavior = self.config.behavior ?? {};
            self.config.fields = self.config.fields ?? {};
            self.config.rules = self.config.rules ?? {};
            self.config.init = self.config.init ?? {};

            // Create fields instance
            formConfiguration.fields.forEach(element => {
                self.addDynamicDropdown(element, self);
            });

            // Init fields
            formConfiguration.init.forEach(element => {
                self.manualUpdate(element, {});
            });

            accept();
        });
    }

    /**
    * Method to instantiate the form dynamic content and to save it in a collection.
    * @param {JSON} ddConfig Dynamic Dropdown configuration
    * @param {JSON} dynamicForm Dynamic Form (container) Configuration
    */
    addDynamicDropdown(ddConfig, dynamicForm) {
        let dd = new DynamicDropdown(ddConfig, dynamicForm);
        this.entities.set(dd.name, dd);
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
                rule.update.forEach(element => {
                    // Update
                    let params = {};
                    params[senderName] = senderValue;
                    if (rule.additionalData) {
                        rule.additionalData.forEach((additional) => {
                            params[additional] = this.entities.get(additional).get();
                        });
                    }

                    if (this.debug)
                        console.log(`> > [${senderName}] ==update==> [${this.entities.get(element).name}]`);
                    updatePromises.push(this.entities.get(element).update(senderName, params));
                    // Clear
                    this.clearCascade(element); // DFS
                });
            });
        if (this.config.behavior.afterUpdate) {
            Promise.allSettled(updatePromises).then((values) => {
                this.config.behavior.afterUpdate(this, senderName);
            });
        }
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

}
export default DynamicForm;