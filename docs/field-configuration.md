# Table of Contents <!-- omit in toc -->
- [Field configuration](#field-configuration)
  - [name](#name)
  - [io [optional]](#io-optional)
  - [io.event [optional]](#ioevent-optional)
  - [io.get (htmlElement) [optional]](#ioget-htmlelement-optional)
  - [io.set (htmlElement) [optional]](#ioset-htmlelement-optional)
  - [fetch [optional]](#fetch-optional)

# Field configuration
This document describes a single field configuration.

The field configuration must be included in the *fields* collection in the [form configuration](./form-configuration.md).

Here's a complete single field configuration:

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
        'fullFetchConfig': {}, // Fetch complete configuration
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

## name
The html element name.

## io [optional]
Object which groups properties related to field input and output.

Default value: `change`.

## io.event [optional]
The html event which symbolize the Subject's status change (e.g. *change* for a dropdown, *click* for a checkbox...).

It is used to put an event listener which will notify Subject's Observers.

## io.get (htmlElement) [optional]
Function to fetch the html element's value. Useful for custom html elements.

## io.set (htmlElement) [optional]
Function to set the html element's value. Useful for custom html elements.

## fetch [optional]
Work in progress

<!-- ## behavior [optional] -->
<!-- ## ext [optional] -->
