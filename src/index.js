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
     * Method to retrieve a Dynamic Form instance.
     * @param {int} id the form id
     */
    function _getForm(id) {
        return formCollection.get(id);
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
        getForm: _getForm,
        author: _author,
    }
})();

// export default dynamicForms;
window.dynamicForms = dynamicForms; // Easier to use, makes this library available everywhere!