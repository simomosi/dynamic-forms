import DynamicForm from './DynamicForm.js';

/** Module to easly manage dynamic forms */
let dynamicForms = (function () {
    'use strict';

    /** @param {Map<String, DynamicForm>} formCollection a collection of DynamicForms instances */
    let formCollection = new Map();

    /**
     * Method to instantiate a single Dynamic Form
     * @param {object} formConfiguration the form configuration
     * @returns Instance of a Dynamic Form
     */
    function _makeForm(formConfiguration) {
        let form = new DynamicForm(formConfiguration);
        formCollection.set(form.getId(), form);
        return form;
    }

    /**
     * Method to instantiate multiple Dynamic Forms
     * @param {object[]} formsConfigCollection an array of objects representing forms configurations
     * @returns A collection of instances of Dynamic Forms
     */
    function _makeMultipleForms(formsConfigCollection) {
        formsConfigCollection.forEach(config => {
            _makeForm(config);
        });
        return formCollection;
    }

    /**
     * Method to retrieve a Dynamic Form instance.
     * @param {int} id the form id
     */
    function _getForm(id) {
        return formCollection.get(id);
    }

    /**
     * Method to retrieve a Dynamic Element instance in a Dynamic Form
     * @param {int} formId the form id
     * @param {string} fieldName the field name
     */
    function _getField(formId, fieldName) {
        let form = _getField(formId);
        if (form) {
            return form.getField(fieldName);
        }
        return null;
    }

    /**
     * Credits the author of Dynamic Forms
     */
    function _author() {
        console.info('DynamicForms! Developed with \u2764 by simomosi - Ping me @ https://github.com/simomosi/dynamic-forms');
    }

    _author();

    return {
        makeForm: _makeForm,
        makeMultipleForms: _makeMultipleForms,
        getForm: _getForm,
        getField: _getField,
        author: _author,
    }
})();

// export default dynamicForms;
window.dynamicForms = dynamicForms; // Easier to use, makes this library available everywhere!