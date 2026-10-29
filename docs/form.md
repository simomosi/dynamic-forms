# Form
`makeForm` returns the Form of an html form, and `getForm` returns it again by its id. These are its methods.

```javascript
const form = makeForm({ id: 'address', rules: [{ name: 'country', update: ['city'] }] });
await form.ready();
await form.notify('country');
```

In TypeScript, its type is `Form`:

```ts
import { makeForm, type Form } from '@simomosi/dynamic-forms';

const form: Form = makeForm({ id: 'address' });
await form.ready();
```

## When the methods fail

`notify` and `manualUpdate` throw at once, before returning their promise, when the form has no field with the given name: `Form "id" has no field "name"`. It's a mistake in the calling code, so the error shows up even without `await` or `.catch`.

Otherwise they reject when the form can't update, with the first of these errors that applies:

1. `Form "id" was destroyed`: the form was [destroyed](#destroy).
2. `Form "id" is initialising: await ready() first`: the [Initialisation](./tutorial/initial_status.md#wait-for-complete-initialisation) isn't complete. Call them once `ready()` settles.
3. `Form "id" is disabled: call setEnabled(true) first`: the form is [disabled](#setenabled-enable).

## Methods

### `ready ()`
Waits for the [Initialisation](./tutorial/initial_status.md#wait-for-complete-initialisation) of the form. Until it settles, the form ignores the fields' changes, and `notify` and `manualUpdate` reject.

Returns

- {`Promise<void>`} resolved when the Initialisation is complete. It rejects if the Initialisation fails (for example a remote call fails or a Form Hook throws), or if the form is destroyed first.

### `notify (subjectName)`
Tells the form that a field changed, as the user changing it does: its Observers are updated and the fields beyond them are cleared on cascade, following the [Update Rules](./configurations/update-rules.md). Use it after changing a field's value from your code, which fires no event the form listens to.

```javascript
document.querySelector('[name="country"]').value = 'IT';
await form.notify('country');
```

Parameters

- {`string`} `subjectName`: the name of the changed field

Returns

- {`Promise<void>`} resolved when all the updates are complete. It rejects when an update fails (for example with a [`RemoteCallError`](./configurations/fields-configuration.md#fetch)), or as described in [When the methods fail](#when-the-methods-fail).

### `manualUpdate (data, subjectName)`
Updates a single field with the given data, as if a Subject had sent it: a select loads its options with it. Its Observers are neither updated nor cleared, and the Form Hooks aren't called.

```javascript
await form.manualUpdate({ country: 'IT' }, 'city');
```

Parameters

- {`object`} `data`: the data of the update, which the field receives as Update Data
- {`string`} `subjectName`: the name of the field to update

Returns

- {`Promise<void>`} resolved when the field is updated. It rejects when the update fails, or as described in [When the methods fail](#when-the-methods-fail).

### `setEnabled (enable)`
Enables or disables the form. A disabled form stops reacting until it's enabled again:

- the user's changes of the fields update nothing, and report nothing;
- `notify` and `manualUpdate` reject with `Form "id" is disabled: call setEnabled(true) first`, since both would run updates, with their remote calls and Field Hooks.

The updates already running when the form is disabled still complete. Disabling the form during its Initialisation doesn't stop it: `ready()` resolves once the fields are initialised.

Parameters

- {`boolean`} `enable`: true to enable the form, false to disable it

### `isEnabled ()`
Returns

- {`boolean`} true if the form is enabled. A new form is enabled.

### `getId ()`
Returns

- {`string`} the form id, the `id` of its Form Configuration

### `destroy ()`
Removes the form's listeners, so the fields no longer update each other. It also unregisters the form from `getForm`, so a new form can be created for the same html form, and aborts its remote calls in progress. Destroying it again does nothing.

A `notify()`, `manualUpdate()` or `ready()` still pending rejects with `Form "id" was destroyed`, and so do `notify()` and `manualUpdate()` called afterwards. A custom [`updateStatus`](./configurations/fields-configuration.md#updatestatus-htmlelement-data-subjectname-signal-standard) Field Hook receives the abort signal, to stop its own remote calls.
