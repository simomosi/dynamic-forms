# Third-party widgets
A widget is a third-party control shown in place of a field's html element, such as select2, Choices.js, Tom Select or a date picker. It keeps the html element in sync, but has its own way of being read, written and listened to.

DynamicForms integrates a widget through the [Field Hooks](./fields-configuration.md) of its field. The field is still the html element with the `name` (the `<select>` or `<input>` the widget decorates or hides), so the widget is created on that element before `makeForm`.

## What to write
A widget needs a Field Hook only where the library's Standard Behaviour doesn't fit:

| The widget... | Field Hook |
|---|---|
| announces its changes with jQuery events or a callback, which `addEventListener` doesn't hear | [`io.listen`](./fields-configuration.md#listen-htmlelement-onchange-standard) |
| announces them with an event other than `change` | [`io.event`](./fields-configuration.md#event) |
| doesn't keep the element's `value` up to date | [`io.get`](./fields-configuration.md#get-htmlelement-standard) |
| doesn't show a value written in the element | [`io.set`](./fields-configuration.md#set-htmlelement-value-standard) |
| doesn't show an emptied element | [`behavior.clear`](./fields-configuration.md#clear-htmlelement-standard) |
| doesn't show the `<option>`s written in the select | [`select.saveData`](./fields-configuration.md#savedata-htmlelement-data-standard) |

A Field Hook which replaces a Standard Behaviour receives it as its last parameter, `standard`. When the widget only needs to read again what the library wrote, run the standard and refresh it:

```javascript
select: {
    saveData: (htmlElement, data, standard) => {
        standard(); // writes the <option>s as usual
        $(htmlElement).selectpicker('refresh');
    },
}
```

Many widgets fire `change` when written by code. While the library writes to a field (`io.set`, `behavior.clear`, `select.saveData`), it ignores the field's changes, so they don't start a second update of its Observers, which the library already updates. The events still reach the widget and your code.

This covers events fired during the write. A widget which reacts later (after a timeout or a microtask) and then fires `change` still starts an update: pass it the option that makes it silent.

## Reusing an integration
A widget's Field Hooks are the same for every field which uses it: write them once in a function returning the field configuration. The recipes below take the field name and the overrides of that field, and merge them section by section with `mergeField`, so that `{ fetch: { makeUrl } }` adds to the widget's hooks instead of replacing a whole section:

```javascript
--8<-- "configurations/widgets/merge-field.js"
```

```javascript
import { select2Field } from './select2.js';

$('select[name="country"], select[name="city"]').select2();
const form = makeForm({
    id: 'address',
    fields: [
        select2Field('country'),
        select2Field('city', { fetch: { makeUrl: (data) => `/cities?country=${data.country}` } }),
    ],
    rules: [{ name: 'country', update: ['city'] }],
});
```

When the widget's instance can't be reached from the html element, pass it to the function, and the hooks keep it (see Choices.js below).

## Recipes
Copy and adapt them. They are tested against the widget versions in the notes, except bootstrap-select.

=== "select2"
    Tested with select2 4.1 and jQuery 4.

    ```javascript
    --8<-- "configurations/widgets/select2.js"
    ```

=== "Choices.js"
    Tested with Choices.js 11.

    ```javascript
    --8<-- "configurations/widgets/choices.js"
    ```

    ```javascript
    const city = new Choices('select[name="city"]');
    makeForm({ id: 'address', fields: [choicesField('city', city, { fetch: { makeUrl } })], /* ... */ });
    ```

=== "Tom Select"
    Tested with Tom Select 2.

    ```javascript
    --8<-- "configurations/widgets/tom-select.js"
    ```

=== "bootstrap-select"
    Not tested by the library: bootstrap-select 1.13 needs jQuery 3 or older.

    ```javascript
    --8<-- "configurations/widgets/bootstrap-select.js"
    ```

=== "flatpickr"
    Tested with flatpickr 4.6.

    ```javascript
    --8<-- "configurations/widgets/flatpickr.js"
    ```

## Custom elements
A form-associated custom element with the field `name` (e.g. `<sl-select name="city">`) is a field like the others. The library doesn't recognise it as a select, checkbox or radio, so it gets the standard behaviour of a generic input: its `value` is read and written, and its `change` is listened to.

A select-like custom element doesn't get the select's options loading: there's no remote call through `fetch`, `postProcessData`, `saveData` or `clearOnParentVoid`. Load and write its options in [`behavior.updateStatus`](./fields-configuration.md#updatestatus-htmlelement-data-subjectname-signal-standard), passing `signal` to the remote call.

In TypeScript, state the element type of the field:

```typescript
import type { FieldConfiguration } from '@simomosi/dynamic-forms';
// SlSelect: the class of the custom element, imported from its library

const city: FieldConfiguration<SlSelect, string> = {
    name: 'city',
    behavior: {
        updateStatus: async (htmlElement, data, subjectName, signal) => {
            const cities: { id: string, name: string }[] = await (await fetch(`/cities?country=${data.country}`, { signal })).json();
            htmlElement[0].replaceChildren(...cities.map((c) => Object.assign(document.createElement('sl-option'), { value: c.id, textContent: c.name })));
        },
    },
};
```
