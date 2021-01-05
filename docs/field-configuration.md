# Table of Contents <!-- omit in toc -->
- [Field configuration](#field-configuration)
  - [name [required]](#name-required)
  - [io](#io)
  - [io.event](#ioevent)
  - [io.get (htmlElement)](#ioget-htmlelement)
  - [io.set (htmlElement)](#ioset-htmlelement)
  - [fetch [required*]](#fetch-required)
  - [fetch.method](#fetchmethod)
  - [fetch.makeUrl (data) [required*]](#fetchmakeurl-data-required)
  - [fetch.makeBody (data)](#fetchmakebody-data)
  - [fetch.fullFetchConfig (data)](#fetchfullfetchconfig-data)
  - [behavior](#behavior)

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

## name [required]
The html element name.

## io
Object which groups properties related to field input and output.

Default value: `change`.

## io.event
The html event which symbolize the Subject's status change (e.g. *change* for a dropdown, *click* for a checkbox...).

It is used to put an event listener which will notify Subject's Observers.

## io.get (htmlElement)
Function to fetch the html element's value. Useful for custom html elements.

## io.set (htmlElement)
Function to set the html element's value. Useful for custom html elements.

## fetch [required*]
Object which groups properties related to remote calls.

**Available only for *DynamicDropdown* instances** (select-option like fields).

**Required only if the dropdown element is an observer** (it will be updated for every observed subject change), unless you specify a new *updateStatus* function.

## fetch.method
It's the *http request method* (or verb).

Default value: *GET*

## fetch.makeUrl (data) [required*]
A function to generate the url to make the remote call to.

Parameters
- {`object`} `data`: data obtained from additionaData and externalData functions in Update Rule Config

Returns
- {`string`} The remote call url
-
## fetch.makeBody (data)
A function to generate the remote call body in the desired method (e.g. JSON.stringify, FormData...).

It's not necessary if the remote call uses the GET request method (parameters need to be placed in the url).

Parameters
- {`object`} `data`: data obtained from additionaData and externalData functions in Update Rule Config

Returns
- {`object`} The remote call body

## fetch.fullFetchConfig (data)
A function to generate the complete Fetch configuration for remote calls.

If this function is defined, the updateStatus default function will ignore *fetch.method* property and *fetch.makeBody* function.

Parameters
- {`object`} `data`: data obtained from additionaData and externalData functions in Update Rule Config

Returns
- {`object`} The complete Fetch configuration

## behavior
Work in progress...
<!-- ## ext [optional] -->
