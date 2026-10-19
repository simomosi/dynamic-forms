# DynamicForms library
## How to use it
DynamicForms is designed to be **simple and straightforward**  - no complex setup or configuration required.

The library offers 2 main functions that handle all the heavy lifting for you, including automatic configuration fixes and form initialization.

**For 90% of use cases, `makeForm` is all you need!**

First, import the module (see [loading guide](./start/loading.md))

```html
<script type="module">
    import { makeForm, getForm } '@simomosi/dynamic-forms';
</script>
```

### TypeScript

The package exports the configuration types, so configurations can be written in their own files without casts. Only the form `id` is required, the library completes the rest.

```ts
import { makeForm, type FormConfiguration, type FieldConfiguration } from '@simomosi/dynamic-forms';

const city: FieldConfiguration = {
    name: 'city',
    fetch: { makeUrl: (data) => `/cities?country=${data.country}` },
    select: { clearOnParentVoid: false },
};
const configuration: FormConfiguration = {
    id: 'checkout',
    fields: [city],
    rules: [{ name: 'country', update: ['city'] }],
    behavior: { afterInit: () => console.log('ready') },
};
makeForm(configuration);
```

Exported types: `FormConfiguration`, `FormHooks`, `UpdateRule`, `InitialisationRule`, `FieldConfiguration`, `FieldIoHooks`, `FieldFetchConfiguration`, `FieldHooks`, `SelectConfiguration`, `CheckboxConfiguration`, `UpdateData` and `DynamicForm`.


## Properties

### `makeForm (formConfiguration)`
Istantiates a DynamicForm.

Parameters

- {`object`} `formConfiguration`: the form configuration

Returns

- {`DynamicForm`} a DynamicForm instance

### `getForm (id)`
Returns a DynamicForm instance corresponding to the form id, if it exists.

Parameters

- {`string`} `id`: the form id

Returns

- {`DynamicForm | null`} the DynamicForm instance or null if it does not exists
