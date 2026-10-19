# Field configuration
This document describes a single field configuration. The field configuration list must be included in the *fields* section in the [form configuration](./form-configuration.md).

Just specify fields with custom behavior as the standard ones will be discovered and included in the dynamic-form automatically.

!!! tip "TypeScript"
    TypeScript cannot see the html, so field hooks receive an `HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement` (or a `NodeList` of them) and an `any` value.
    State the element and value types on the field to use them without casts:

    ```typescript
    import type { FieldConfiguration } from '@simomosi/dynamic-forms';

    const city: FieldConfiguration<HTMLSelectElement> = {
        name: 'city',
        behavior: { clear: (htmlElement) => { if (!(htmlElement instanceof NodeList)) htmlElement.options.length = 0; } },
    };
    const tags: FieldConfiguration<HTMLInputElement, string[]> = {
        name: 'tags',
        io: {
            get: (htmlElement) => htmlElement instanceof NodeList ? [] : htmlElement.value.split(','),
            set: (htmlElement, value) => { if (!(htmlElement instanceof NodeList)) htmlElement.value = value.join(','); },
        },
    };
    ```

    The library does not check these types against the html: `FieldConfiguration<HTMLSelectElement>` on an `<input>`, or a hook that leaves out the `NodeList` case, compiles but fails at runtime.

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
            fullFetchConfig: (data) => { }, // Fetch complete configuration (RequestInit)
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

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)

Returns

- {`string`} the field content

### `set (htmlElement)`
Function to set the html element's value. Useful for custom html elements.

Parameters

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)
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

Use it when the request needs more than a method and a body, e.g. headers that depend on the field values.

If this function is defined, the updateStatus default function will ignore *fetch.method* property and *fetch.makeBody* function.

Parameters

- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config

Returns

- {`RequestInit`} The complete Fetch configuration, passed as is to `fetch` as its second argument

```javascript
fetch: {
    makeUrl: (data) => '/posts',
    fullFetchConfig: (data) => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }),
}
```

*Until 3.x `fullFetchConfig` was a static object. Since 4.0.0 it must be a function: wrap an existing object as `fullFetchConfig: () => ({ ... })`.*

## `behavior`
Object which groups properties related to field behavior.

### `clear (htmlElement)`
Function to unset the field's current value. Sometimes it is used to clear the field from its content (for input and select types).

Parameters

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)

Returns

- {`void`}


### `beforeUpdate (htmlElement, data, subjectName)`
Method called before triggering the field's status update. If return value is *false*, the update is aborted.

Default behavior: nothing. For **DynamicSelect** elements it clear the field content if *clearOnParentVoid* conditions are satisfied.

Parameters

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string | null`}: `subjectName`: the name of the subject who triggered the update. It is null if the update is triggered manually

Returns

- {`boolean`} *false* to abort the update, *true* otherwise

### `updateStatus (htmlElement, data, subjectName)`
Method to update the field status. It is useful to update the field's attributes (*display*, *disabled*...) and content.

Default behavior: nothing. For **DynamicSelect** elements it makes a remote call (using *fetch*), retrieves new date and saves it as *select* new content (*option*).

Parameters

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string | null`}: `subjectName`: the name of the subject who triggered the update. It is null if the update is triggered manually

Returns

- {`Promise<void>`}

### `afterUpdate (htmlElement, data, subjectName)`
Method called after triggering the field's status update.

Parameters

- {`node | NodeList`} `htmlElement`: the html node, or all the nodes when more elements share the field name (checkboxes and radios always receive the `NodeList` in `get`, `set` and `clear`)
- {`JSON`} `data`: data obtained from additionalData and externalData functions in Update Rule Config
- {`string | null`}: `subjectName`: the name of the subject who triggered the update. It is null if the update is triggered manually

Returns

- {`boolean`} (currently) unused

## `select`
Object which groups properties related to select-option elements.

### `postProcessData (htmlElement, data)`
Function to process data retrieved by remote call. It is useful for filtering/ordering data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes
- {`JSON`} `data`: data retrieved from the remote call

Returns

- {`{ value: string | number, text: string }[]`} the options to save

### `saveData (htmlElement, data)`
Function to phisically save (post-processed) data retrieved by a remote call as html.

Default behavior: saves data as *option* html elements using *value* and *text* properties, creating also empty option if they are not present in retrieved data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes where data will be saved
- {`{ value: string | number, text: string }[]`} `data`: the options returned by `postProcessData`, or the data retrieved from the remote call when there is no `postProcessData`

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