import DynamicForm from './form.js';

/** Module to easly manage dynamic forms */
let dynamicForms = (function () {
    'use strict';

    /** @param {Map<String, DynamicForm>} formCollection a collection of DynamicForms instances */
    formCollection;

    /**
     * Method to instantiate a single Dynamic Form
     * @param {JSON} formConfiguration the form configuration in JSON format
     * @returns Instance of a Dynamic Form
     */
    function _makeForm(formConfiguration) {
        formCollection = formCollection ?? new Map();
        let form = new DynamicForm(formConfiguration);
        formCollection.set(form.getId(), form);
        return form;
    }

    /**
     * Method to instantiate multiple Dynamic Forms
     * @param {JSON} formsConfigCollection a JSON containing an array of forms configurations
     * @returns A collection of instances of Dynamic Forms
     */
    function _makeMultipleForms(formsConfigCollection) {
        let formsCollection = [];
        formsConfigCollection.forEach(config => {
            formsCollection.push(_makeForm(config));
        });
        return formsCollection;
    }

    /**
     * Credits the author of Dynamic Forms
     */
    function _author() {
        console.info('DynamicForms! Developed with \u2764 by simomosi - Ping me @ https://github.com/simomosi');
    }

    _author();

    return {
        makeForm: _makeForm,
        makeMultipleForms: _makeMultipleForms,
        author: _author
    }
})();

// export default dynamicForms;
window.dynamicForms = dynamicForms; // Easier to use, makes this library available everywhere!