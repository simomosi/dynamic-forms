# Field Configuration
This document describes a single Field Configuration. The list of Field Configurations goes in the *fields* section of the [Form Configuration](./form-configuration.md).

Just specify the fields you want to customise: the other ones are discovered and added to the form automatically, with the standard behaviour.

Every Field Hook receives `htmlElement` as the `NodeList` of all the html elements with the field name, even when there is only one: read a single input with `htmlElement[0].value`.

A Field Hook which replaces a Standard Behaviour of the field (listening, reading, writing, clearing, updating its status, loading and saving a select's options) receives it as its last parameter, `standard`: call it to run the Standard Behaviour and add to it, instead of rewriting it. It takes no arguments and works on the hook's own ones.

```javascript
select: {
    saveData: (htmlElement, data, standard) => {
        standard(); // writes the <option>s as usual
        htmlElement[0].dispatchEvent(new Event('options-saved'));
    },
}
```

To integrate a third-party widget (select2, Choices.js, a date picker...), see [Third-party widgets](./third-party-widgets.md).

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

    The element type can be any `HTMLElement`, such as a form-associated custom element (see [Third-party widgets](./third-party-widgets.md#custom-elements)). The `standard` parameter of each hook is typed too: in `tags` above, `io.get`'s `standard` returns `string[]`.

    The library does not check these types against the html: `FieldConfiguration<HTMLSelectElement>` on an `<input>` compiles but fails at runtime.

Here's a complete Field Configuration. You just need to specify the attributes you need, the other will have default values.

=== "Generic field"
    ```javascript
    const fieldConfiguration = {
        name: 'fieldName',
        io: {  // Customize field input/output
            event: 'change',
            listen: (htmlElement, onChange, standard) => { return () => { }; }, // Subscribe to the field's changes, return the unsubscribe function
            get: (htmlElement, standard) => { },
            set: (htmlElement, value, standard) => { },
        },
        fetch: { // Remote call options
            method: 'GET',
            makeUrl: (data) => { },
            makeBody: (data) => { }, // JSON.stringify, formData, text...
            fullFetchConfig: (data) => { }, // Fetch complete configuration (RequestInit)
        },
        behavior: { // Field Hooks
            clear: (htmlElement, standard) => { }, // Clear the field's value
            beforeUpdate: (htmlElement, data, subjectName) => { return true; }, // Executed before the remote call. Return false to block the update
            updateStatus: (htmlElement, data, subjectName, signal, standard) => { },
            afterUpdate: (htmlElement, data, subjectName) => { } // Executed after the update, also when beforeUpdate stopped it
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
            loadOptions: (htmlElement, data, subjectName, signal, standard) => { }, // Load the data instead of the remote call
            postProcessData: (htmlElement, data, standard) => { }, // Process data retrieved by the remote call or loadOptions
            saveData: (htmlElement, data, standard) => { }, // Manually save data in html (e.g. creating `<option value="value">'text'</option>` nodes)
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

The library listens to it to update the Observers of the field when it is a Subject, unless a [*listen*](#listen-htmlelement-onchange-standard) Field Hook replaces the listening.

Type: `string`.

Default value: `change`.

### `listen (htmlElement, onChange, standard)`
Field Hook which replaces the standard listening to the field's changes: it subscribes to them, calls `onChange` on each one, and returns the function which unsubscribes. The library calls that function when the Form is [destroyed](../dynamic-forms-module.md#destroy).

Use it for a widget which announces its changes in a way `addEventListener` doesn't hear, such as jQuery events or a callback:

```javascript
io: {
    listen: (htmlElement, onChange) => {
        $(htmlElement).on('change.dynamicForms', onChange);
        return () => $(htmlElement).off('change.dynamicForms');
    },
}
```

While the library writes to the field (*set*, *clear*, *saveData*), it ignores the field's changes: a widget which fires *change* when written by code doesn't start a second update of the Observers, which the library already updates.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`() => void`} `onChange`: to call on each change of the field
- {`() => () => void`} `standard`: listens to [*event*](#event) on the html nodes, and returns the function which stops

Returns

- {`() => void`} the function which unsubscribes

### `get (htmlElement, standard)`
Function to read the field's value. Useful for custom html elements.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`() => any`} `standard`: reads the value the way the library does for this kind of field

Returns

- {`string`} the field's value

### `set (htmlElement, value, standard)`
Function to write the field's value. Useful for custom html elements.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`mixed`} `value`: the field's new value
- {`() => void`} `standard`: writes `value` the way the library does for this kind of field

Returns

- {`void`}

## `fetch`*
Object which groups properties related to remote calls.

**Available only for select fields**.

**Required only if the select field is an Observer** (it is updated on every change of its Subject), unless you specify a [*loadOptions*](#loadoptions-htmlelement-data-subjectname-signal-standard) or an *updateStatus* Field Hook: `makeForm` throws for an Observer select with none of them.

A select which is not an Observer and has nowhere to load its options from keeps the options of its html: an [Initialisation Rule](./init-rules.md) only sets its value.

When the remote call answers with a non-ok status, `notify()` (or `ready()`, during the Initialisation) rejects with a `RemoteCallError`, an `Error` exported by the package whose `response` holds the `Response`:

```js
import { RemoteCallError } from '@simomosi/dynamic-forms';

try {
    await form.notify('country');
} catch (error) {
    if (error instanceof RemoteCallError) {
        console.log(error.message);          // Remote call to "/regions" failed with status 404
        console.log(error.response.status);  // 404
    }
}
```

### `method`
It's the *http request method* (or verb).

Type: `string`.

Default value: `GET`


### `makeUrl (data)`*
A function to generate the url to make the remote call to.

*required* for an Observer select, unless it has *loadOptions* or *updateStatus* (see above)

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

### `clear (htmlElement, standard)`
Field Hook which replaces the standard clear: it empties the field of its value (and, for a select, of its options).

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`() => void`} `standard`: clears the field the way the library does for this kind of field

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

### `updateStatus (htmlElement, data, subjectName, signal, standard)`
Field Hook which replaces the standard update of the field's status: its attributes (*display*, *disabled*...) and, for a select, its options.

Default: nothing. For select fields it makes a remote call (using *fetch*), retrieves the new data and saves it as the select's new options.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update
- {`AbortSignal`}: `signal`: aborted when the Form is [destroyed](../dynamic-forms-module.md#destroy), or when a newer Update of the field replaces this one (see [Update Rules](./update-rules.md#update)). Pass it to the hook's remote calls (`fetch(url, { signal })`) so they stop; a hook writing the field after waiting for something else checks `signal.aborted` first, or it may write stale data
- {`() => Promise<void>`}: `standard`: updates the status the way the library does: nothing, or for a select its remote call and the saving of the options

Returns

- {`Promise<void>`}

### `afterUpdate (htmlElement, data, subjectName)`
Field Hook called after the field's update, also when the update was stopped before loading anything: by [*beforeUpdate*](#beforeupdate-htmlelement-data-subjectname) returning *false*, or by [*clearOnParentVoid*](#clearonparentvoid). It is not called when the update fails, nor for an update replaced by a newer one of the same field (see [Update Rules](./update-rules.md#update)), whose result is discarded.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update

Returns

- {`void`}

## `select`
Object which groups properties related to select fields.

A select updates its options in three steps, each replaceable by a Field Hook:

```text
remote call (or loadOptions) → postProcessData → saveData
```

### `loadOptions (htmlElement, data, subjectName, signal, standard)`
Field Hook which replaces the remote call: it loads the data another way (another http client, a cache, data already in the page) and the update goes on as usual, through `postProcessData` and `saveData`. With it, `fetch` is not needed.

```js
select: {
    loadOptions: async (htmlElement, data, subjectName, signal) =>
        (await axios.get('/regions', { params: { country: data.country }, signal })).data,
    postProcessData: (htmlElement, regions) => regions.map(r => ({ value: r.id, text: r.name })),
}
```

Parameters (the same as [*updateStatus*](#updatestatus-htmlelement-data-subjectname-signal-standard))

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: the [Update Data](./update-rules.md#update-data)
- {`string | null`}: `subjectName`: the name of the Subject which triggered the update. It is null for a manual update
- {`AbortSignal`}: `signal`: aborted when the Form is [destroyed](../dynamic-forms-module.md#destroy), or when a newer Update of the field replaces this one: the data then loaded is discarded
- {`() => Promise<any>`}: `standard`: makes the remote call with *fetch*, and resolves with the response parsed as json

Returns

- {`any | Promise<any>`} the data which `postProcessData` receives, or directly the options when there is no `postProcessData`

### `postProcessData (htmlElement, data, standard)`
Field Hook to process the data retrieved by the remote call or by `loadOptions`. It is useful for filtering/ordering data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name
- {`JSON`} `data`: data retrieved from the remote call or returned by `loadOptions`
- {`() => any`} `standard`: returns `data` as it is

Returns

- {`{ value: string | number, text: string }[]`} the options to save

### `saveData (htmlElement, data, standard)`
Field Hook which replaces the standard saving of the options: it writes the (post-processed) data retrieved by the remote call or by `loadOptions` in the html.

Default: saves the data as *option* html elements using *value* and *text* properties, creating also empty option if they are not present in retrieved data.

Parameters

- {`NodeList`} `htmlElement`: the html nodes with the field name, where data will be saved
- {`{ value: string | number, text: string }[]`} `data`: the options returned by `postProcessData`, or the data retrieved from the remote call or by `loadOptions` when there is no `postProcessData`
- {`() => void`} `standard`: saves the options the way the library does: it empties the select with the library's own clear, not with a [*clear*](#clear-htmlelement-standard) Field Hook, then writes an *option* for each one

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