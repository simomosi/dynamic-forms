# DynamicForms library
## How to use it
DynamicForms is designed to be **simple and straightforward**  - no complex setup or configuration required.

The library offers 2 main functions that handle all the heavy lifting for you, including completing the Form Configuration with defaults and the form initialisation.

**For 90% of use cases, `makeForm` is all you need!**

First, import the module (see [loading guide](./start/loading.md))

```javascript
import { makeForm, getForm } from '@simomosi/dynamic-forms';
```

### TypeScript

The package exports the configuration types, so Form and Field Configurations can be written in their own files without casts. Only the form `id` is required, the library completes the rest.

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

Exported types: `FormConfiguration`, `FormHooks`, `UpdateRule`, `InitialisationRule`, `FieldConfiguration`, `FieldIoHooks`, `FieldFetchConfiguration`, `FieldHooks`, `SelectConfiguration`, `SelectOption`, `CheckboxConfiguration`, `FieldElement`, `UpdateData` and `Form`, the type of the [Form](./form.md) returned by `makeForm` (a type only: forms are created by `makeForm`). The package also exports the `RemoteCallError` class, the error of a [failed remote call](./configurations/fields-configuration.md#fetch).


## Properties

### `makeForm (formConfiguration)`
Creates a form. An html form has at most one Form at a time: `makeForm` throws `Form "id" already exists` when the previous Form for that id has not been destroyed (see [`destroy`](./form.md#destroy)).

The form starts with its [Initialisation](./tutorial/initial_status.md#wait-for-complete-initialisation): until `form.ready()` settles, the fields' changes are ignored and `notify()` and `manualUpdate()` reject. Wait for it (`await form.ready()` or `form.ready().then(...)`) before calling them. The [Form](./form.md) page describes the methods of the form and when they fail.

Parameters

- {`object`} `formConfiguration`: the Form Configuration

Returns

- {`Form`} the [form](./form.md)

### `getForm (id)`
Returns the form with the given id, if it exists.

Parameters

- {`string`} `id`: the form id

Returns

- {`Form | undefined`} the [form](./form.md), or `undefined` if it does not exist

### Fields added after `makeForm`
Fields are discovered when the Form is created. To pick up fields added to the html form later, [destroy](./form.md#destroy) the Form and create it again:

```js
let form = makeForm(configuration);
// ...the page adds <input name="notes"> to the form...
form.destroy();
form = makeForm(configuration);
```

The new Form runs the Initialisation again, so its Initialisation Rules set the initial Values again. To keep the Values the user has changed meanwhile, create it without them:

```js
form.destroy();
form = makeForm({ ...configuration, init: [] });
```
