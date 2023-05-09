# Field configuration
This document describes a single field configuration. The field configuration list must be included in the *fields* section in the [form configuration](./form-configuration.md).

Just specify fields with custom behavior as the standard ones will be discovered and included in the dynamic-form automatically.

Here's a complete single field configuration. You just need to specify the attributes you need, the other will have default values.

=== "Generic element"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: {  // Customize field input/output
            event: 'change',
            get: (htmlElement) => { },
            set: (htmlElement, value) => { },
        },
        fetch: { // Remote call options
            method: 'GET',
            makeUrl: (data) => { },
            makeBody: (data) => { }, // JSON.stringify, formData, text...
            fullFetchConfig: {}, // Fetch complete configuration
        },
        behavior: {
            clear: (htmlElement) => { }, // Clear field from its content
            beforeUpdate: (htmlElement, data, subjectName) => { return true; }, // Executed before the remote call. Return false to block the update
            updateStatus: (htmlElement, data, subjectName) => { },
            afterUpdate: (htmlElement, data, subjectName) => { } // Executed after the remote call
        }
    };
    ```

=== "Select element"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: /* ... */,
        fetch: /* ... */,
        behavior: /* ... */,
        select: { // Only for select elements
            postProcessData: (htmlElement, data) => { }, // Process data retrieved by remote call
            saveData: (htmlElement, data) => { }, // Manually save data in html (e.g. creating `<option value="value">'text'</option>` nodes)
            clearOnParentVoid: true, // True (default) to clear field content when subject is empty; false to trigger a remote call
        }
    };
    ```

=== "Checkbox element"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: /* ... */,
        fetch: /* ... */,
        behavior: /* ... */,
        checkbox: { // Only for checkbox elements
            booleanValue: true // True (default) to get element's value as boolean, based on the checked property; false to get the value property
        }
    };
    ```

## `name`*
The html element name.

Type: `string`.

*required*

## `io`
Object which groups properties related to field input and output.


### `event`
The html event which symbolize the Subject's status change (e.g. *change* for a select, *click* for a checkbox...).

It is used to put an event listener which will notify Subject's Observers.

Type: `string`.

Default value: `change`.

### `get (htmlElement)`
Function to fetch the html element's value. Useful for custom html elements.

Parameters

- {`node | NodeList`} `htmlElement`: the html node

Returns

- {`string`} the field content

### `set (htmlElement)`
Function to set the html element's value. Useful for custom html elements.

Parameters

- {`node | NodeList`} `htmlElement`: the html node
- {`mixed`} `value`: the field's new value

Returns

- {`void`}

## `fetch`*
Object which groups properties related to remote calls.

**Available only for *DynamicSelect* instances** (select-option like fields).

**Required only if the select element is an observer** (it will be updated for every observed subject change), unless you specify a new *updateStatus* function.

### `method`
It's the *http request method* (or verb).

Type: `string`.

Default value: `GET`


### `makeUrl (data)`*
A function to generate the url to make the remote call to.

*required*

Parameters

- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config

Returns

- {`string`} The remote call url

### `makeBody (data)`
A function to generate the remote call body in the desired method (e.g. JSON.stringify, FormData...).

It's not necessary if the remote call uses the GET request method (parameters need to be placed in the url).

Parameters

- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config

Returns

- {`object`} The remote call body

### `fullFetchConfig (data)`
A function to generate the complete Fetch configuration for remote calls.

If this function is defined, the updateStatus default function will ignore *fetch.method* property and *fetch.makeBody* function.

Parameters

- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config

Returns

- {`object`} The complete Fetch configuration

## `behavior`
Object which groups properties related to field behavior.

### `clear (htmlElement)`
Function to unset the field's current value. Sometimes it is used to clear the field from its content (for input and select types).

Parameters

- {`node | NodeList`} `htmlElement`: the html node

Returns

- {`void`}


### `beforeUpdate (htmlElement, data, subjectName)`
Method called before triggering the field's status update. If return value is *false*, the update is aborted.

Default behavior: nothing. For **DynamicSelect** elements it clear the field content if *clearOnParentVoid* conditions are satisfied.

Parameters

- {`node | NodeList`} `htmlElement`: the html node
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string`}: `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns

- {`boolean`} *false* to abort the update, *true* otherwise

### `updateStatus (htmlElement, data, subjectName)`
Method to update the field status. It is useful to update the field's attributes (*display*, *disabled*...) and content.

Default behavior: nothing. For **DynamicSelect** elements it makes a remote call (using *fetch*), retrieves new date and saves it as *select* new content (*option*).

Parameters

- {`node | NodeList`} `htmlElement`: the html node
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string`}: `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns

- {`Promise<void>`}

### `afterUpdate (htmlElement, data, subjectName)`
Method called after triggering the field's status update.

Parameters

- {`node | NodeList`} `htmlElement`: the html node
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string`}: `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns

- {`boolean`} (currently) unused

## `select`
Object which groups properties related to select-option elements.

### `postProcessData (htmlElement, data)`
Function to process data retrieved by remote call. It is useful for filtering/ordering data.

Parameters

- {`node | NodeList`} `htmlElement`: the html node
- {`JSON | object[]`} `data`: data retrieved from the remote call

Returns

- {`JSON | object[]`} post-processed data

### `saveData (htmlElement, data)`
Function to phisically save (post-processed) data retrieved by a remote call as html.

Default behavior: saves data as *option* html elements using *value* and *text* properties, creating also empty option if they are not present in retrieved data.

Parameters

- {`node | NodeList`} `htmlElement`: the html node where data will be saved
- {`JSON | object[]`} `data`: data retrieved from the remote call

Returns

- {`void`}

### `clearOnParentVoid`
Property which (when `true`) tells to clear field content when subject value is empty instead of triggering a remote call (when `false`).

Type: `boolean`.

Default value: `true`.

## `checkbox`
Object which groups properties related to select-option elements.

### `booleanValue`
Property which tells if the field's value is *boolean*.

When *true* the field considers its value as *boolean*, based on the  html `checked` attribute; when *false* it considers its value as *string*, based on the `value` attribute.

Type: `boolean`.

Default value: `true`.