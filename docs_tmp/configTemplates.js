/**
 * An object representing the dynamic form configuration
 * @name DynamicForm~formTemplate
 * @param {string} formTemplate.id - the form id
 * @param {bool} formTemplate.debug - a flag to activate (true) or deactivate (false) the debug mode
 * @param {object} formTemplate.behavior - an object representing the form behavior
 * @param {function(string):bool | null} formTemplate.behavior.beforeUpdate - callback called before the update phase
 * @param {function(string):void | null} formTemplate.behavior.afterUpdate - callback called after the update phase
 * @param {ruleTemplate[]} formTemplate.fields - collection of field objects (@see fieldTemplate)
 * @param {ruleTemplate[]} formTemplate.rules - collection of rule objects (@see ruleTemplate)
 * @param {ruleTemplate[]} formTemplate.init - collection of init objects (@see initTemplate)
 */
let formTemplate = {
    'id': 'formId',
    'debug': true,
    'behavior': {
        'beforeUpdate': (subjectName) => { }, // Executed before the update related events. Return false to block all updates
        'afterUpdate': (subjectName) => { }, // Executed after the update related events
    },
    'fields': [], // Collection of fields objects
    'rules': [], // Collection of rules objects
    'init': [] // Collection of init objects
};

/**
 * Function called before the form update phase
 * @callback
 * @name DynamicForm~beforeUpdate
 * @param {string} subjectName - the name of the observed subject who changed its status
 * @returns {bool} a flag that can abort the update if its value is false
 */

/**
* @name DynamicForm~afterUpdate
* @param {string} subjectName - the name of the observed subject who changed its status
* @returns {bool} a flag
*/

/**
 *
 */
let ruleTemplate = {
    'name': 'fieldName',
    'update': [],
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};

// Debug info
let initTemplate = {
    'name': 'fieldName',
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};

// Debug info
let fieldTemplate = {
    'name': 'fieldName',
    'io': {  // Customize field input/output
        'event': 'change',
        'get': (htmlElement) => { },
        'set': (htmlElement, value) => { },
    },
    'fetch': { // Remote call options
        'method': 'GET',
        'makeUrl': (data) => { },
        'makeBody': (data) => { }, // JSON.stringify, formData, text...
        'fullFetchConfig': {}, // Fetch whole configuration
    },
    'behavior': {
        'clear': (htmlElement) => { }, // Clear field from its content
        'beforeUpdate': (htmlElement, data, subjectName) => { return true; }, // Executed before the remote call. Return false to block the update
        'updateStatus': (htmlElement, data, subjectName) => { },
        'afterUpdate': (htmlElement, data, subjectName) => { } // Executed after the remote call
    },
    'ext': {
        'postProcessData': (htmlElement, data) => { }, // Process data retrieved by remote call
        'saveData': (htmlElement, data) => { }, // Save data in html (es: <option value="value">'text'</option>)
        'clearOnParentVoid': true, // True to clear field content when subject is void; false to trigger a remote call
    }
};