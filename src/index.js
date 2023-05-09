import DynamicForm from './DynamicForm.js';

/** Module to easily manage dynamic forms */

/** @param {Map<String, DynamicForm>} formCollection a collection of DynamicForms instances */
let formCollection = new Map();

/**
 * Method to instantiate a single Dynamic Form
 * @param {object} formConfiguration the form configuration
 * @returns Instance of a Dynamic Form
 */
export function makeForm(formConfiguration) {
    let form = new DynamicForm(formConfiguration);
    formCollection.set(form.getId(), form);
    return form;
}

/**
 * Method to retrieve a Dynamic Form instance.
 * @param {int} id the form id
 */
export function getForm(id) {
    return formCollection.get(id);
}

/**
 * Credits the author of Dynamic Forms, in hope to receive some love (and stars)
 */
function _author() {
    console.info('DynamicForms! Developed with \u2764 by simomosi - Ping me @ https://github.com/simomosi/dynamic-forms');
}

_author();
