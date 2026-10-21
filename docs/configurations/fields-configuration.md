# Field Configuration
This document describes a single Field Configuration. The list of Field Configurations goes in the *fields* section of the [Form Configuration](./form-configuration.md).

Just specify the fields you want to customise: the other ones are discovered and added to the form automatically, with the standard behaviour.

Every Field Hook receives `htmlElement` as the `NodeList` of all the html elements with the field name, even when there is only one: read a single input with `htmlElement[0].value`.

!!! tip "TypeScript"
    TypeScript cannot see the html, so Field Hooks receive a `NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>` and an `any` value.
    State the element and value types on the field to use them without casts:

    ```typescript
    import type { FieldConfiguration } from '@simomosi/dynamic-forms';

    const city: FieldConfiguration<HTMLSelectElement> = {
        name: 'city',
        behavior: { clear: (htmlElement) => { htmlElement[0].options.length = 0; } },
    };
    const tags: FieldConfiguration<HTMLInputElement, string[]> = {
        name: 'tags',
        io: {
            get: (htmlElement) => htmlElement[0].value.split(','),
            set: (htmlElement, value) => { htmlElement[0].value = value.join(','); },
        },
    };
    ```

    The library does not check these types against the html: `FieldConfiguration<HTMLSelectElement>` on an `<input>` compiles but fails at runtime.

Here's a complete Field Configuration. You just need to specify the attributes you need, the other will have default values.

=== "Generic field"
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
        behavior: { // Field Hooks
            clear: (htmlElement) => { }, // Clear the field's value
            beforeUpdate: (htmlElement, data, subjectName) => { return true; }, // Executed before the remote call. Return false to block the update
            updateStatus: (htmlElement, data, subjectName, signal) => { },
            afterUpdate: (htmlElement, data, subjectName) => { } // Executed after the remote call
        }
    };
    ```

=== "Select field"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: /* ... */,
        fetch: /* ... */,
        behavior: /* ... */,
        select: { // Only for select fields
            postProcessData: (htmlElement, data) => { }, // Process data retrieved by remote call
            saveData: (htmlElement, data) => { }, // Manually save data in html (e.g. creating `<option value="value">'text'</option>` nodes)
            clearOnParentVoid: true, // True (default) to clear the field when the Subject's value is empty; false to trigger a remote call
        }
    };
    ```

=== "Checkbox field"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: /* ... */,
        fetch: /* ... */,
        behavior: /* ... */,
        checkbox: { // Only for checkbox fields
            booleanValue: true // True (default) to get the field's value as boolean, based on the checked property; false to get the value property
        }
    };
    ```

## `name`*
The field name: the `name` attribute of its html elements.

Type: `string`.

*required*

## `io`
Object which groups the properties to read and write the field's value.


### `event`
The html event which signals that the field's value changed (e.g. *change* for a select, *click* for a checkbox...).

The library listens to it to update the Observers of the field when it is a Subject.

Type: `string`.

Default value: `change`.

### `get (htmlElement)`
Function to read the field's value. Useful for custom html elements.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name

Returns

- {`string`} the field's value

### `set (htmlElement)`
Function to write the field's value. Useful for custom html elements.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`mixed`} `value`: the field's new value

Returns

- {`void`}

## `fetch`*
Object which groups properties related to remote calls.

**Available only for select fields**.

**Required only if the select field is an Observer** (it is updated on every change of its Subject), unless you specify an *updateStatus* Field Hook.

### `method`
It's the *http request method* (or verb).

Type: `string`.

Default value: `GET`


### `makeUrl (data)`*
A function to generate the url to make the remote call to.

*required*

Parameters

- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)

Returns

- {`string`} The remote call url

### `makeBody (data)`
A function to generate the remote call body in the desired method (e.g. JSON.stringify, FormData...).

It's not necessary if the remote call uses the GET request method (the Update Data needs to be placed in the url).

Parameters

- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)

Returns

- {`object`} The remote call body

### `fullFetchConfig (data)`
A function to generate the complete Fetch configuration for remote calls.

Use it when the request needs more than a method and a body, e.g. headers that depend on the field values.

If this function is defined, the standard update ignores the *fetch.method* property and the *fetch.makeBody* function.

Parameters

- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)

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
Object which groups the Field Hooks.

### `clear (htmlElement)`
Field Hook which replaces the standard clear: it empties the field of its value (and, for a select, of its options).

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name

Returns

- {`void`}


### `beforeUpdate (htmlElement, data, subjectName)`
Field Hook called before the field's update. If it returns *false*, the update is aborted.

Default: nothing. It adds to the field's standard behaviour without switching any of it off: a select whose Subject's value is empty is cleared, and this hook is not called (see [*clearOnParentVoid*](#clearonparentvoid)).

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update

Returns

- {`boolean`} *false* to abort the update, *true* otherwise

### `updateStatus (htmlElement, data, subjectName, signal)`
Field Hook which replaces the standard update of the field's status: its attributes (*display*, *disabled*...) and, for a select, its options.

Default: nothing. For select fields it makes a remote call (using *fetch*), retrieves the new data and saves it as the select's new options.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update
- {`AbortSignal`}: `signal`: aborted when the Form is [destroyed](../dynamic-forms-module.md#destroy). Pass it to the hook's remote calls (`fetch(url, { signal })`) so they stop with the Form

Returns

- {`Promise<void>`}

### `afterUpdate (htmlElement, data, subjectName)`
Field Hook called after the field's update, also when the update was aborted.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update

Returns

- {`void`}

## `select`
Object which groups properties related to select fields.

### `postProcessData (htmlElement, data)`
Field Hook to process the data retrieved by the remote call. It is useful for filtering/ordering data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: data retrieved from the remote call

Returns

- {`{ value: string | number, text: string }[]`} the options to save

### `saveData (htmlElement, data)`
Field Hook which replaces the standard saving of the options: it writes the (post-processed) data retrieved by the remote call in the html.

Default: saves the data as *option* html elements using *value* and *text* properties, creating also empty option if they are not present in retrieved data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name, where data will be saved
- {`{ value: string | number, text: string }[]`} `data`: the options returned by `postProcessData`, or the data retrieved from the remote call when there is no `postProcessData`

Returns

- {`void`}

### `clearOnParentVoid`
Property which (when `true`) tells to clear the field when the Subject's value is empty, instead of triggering a remote call (when `false`).

The clear happens before the [*beforeUpdate*](#beforeupdate-htmlelement-data-subjectname) Field Hook, which is then not called: set this property to `false` to handle an empty Subject's value in the hook.

Type: `boolean`.

Default value: `true`.

## `checkbox`
Object which groups properties related to checkbox fields.

### `booleanValue`
Property which tells if the field's value is *boolean*.

When *true* the field considers its value as *boolean*, based on the  html `checked` attribute; when *false* it considers its value as *string*, based on the `value` attribute.

Type: `boolean`.

Default value: `true`.