# Table of Contents <!-- omit in toc -->
- [Field configuration](#field-configuration)
  - [Properties](#properties)

# Field configuration
This document describes a single field configuration.

The field configuration must be included in the *fields* collection in the [form configuration](./form-configuration.md).

Here's a whole single field configuration:

```javascript
let fieldConfiguration = {
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
```

## Properties
Work in progress...