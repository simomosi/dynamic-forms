# Form Configuration
This document describes the complete Form Configuration with focus on each property.

The Form Configuration is written *client side* and passed to `makeForm` (see [*DynamicForms library*](../dynamic-forms-module.md)) to create the form.

Glossary:

- **Subject**: the role of a field whose change triggers an Update Rule
- **Observer**: the role of a field updated when the Subject of an Update Rule changes. The same field can be Observer in one rule and Subject in another

Here's the complete form configuration:

```javascript
const formConfiguration = {
    id: 'form_id',
    debug: true,
    behavior: { // Form Hooks
        beforeUpdate: (subjectName) => { }, // Executed before updating the Observers. Return false to block all updates
        afterUpdate: (subjectName) => { }, // Executed after updating the Observers
        beforeInit: () => { }, // Executed before the form initialisation
        afterInit: () => { } // Executed after the form initialisation
    },
    fields: [], // Collection of Field Configurations
    rules: [], // Collection of Update Rules
    init: [] // Collection of Initialisation Rules
};
```

`makeForm` checks the configuration before building the form. Every field name it mentions (in `fields`, `rules` and `init`) must be a field of the form; otherwise it throws an error listing every unknown name:

```text
Invalid form configuration "form_id":
- update rule "country": unknown field "regoin" in update
- initialisation rule "contry": unknown field
```

## `id`*
The form id. Just the plain text, no '#'.

Type: `string`.

*required*

## `debug`
A flag to activate the debug mode which prints in the console every Update Rule and the initialisation right before their execution.

Type: `boolean`.

## `behavior`
Object which groups the Form Hooks (e.g. what to do before or after an update).

### `beforeUpdate (subjectName)`
Form Hook called after a Subject changes, but before updating its Observers.

Useful to show a loader during the fields update.

Parameters

- {`string`} `subjectName`: the name of the Subject which triggered the update. Manual updates (`form.manualUpdate`) don't call this Form Hook

Returns

- {`bool`} *false* to abort the update, *true* otherwise

### `afterUpdate (subjectName)`
Form Hook called after all the updated Observers have completed their update.

Useful to hide a loader after the fields update.

Parameters

- {`string`} `subjectName`: the name of the Subject which triggered the update. Manual updates (`form.manualUpdate`) don't call this Form Hook

Returns

- {`void`}

### `beforeInit () `
Form Hook called before the form initialisation.

Useful to show a loader before all fields are initialised.

Returns

- {`void`}

### `afterInit () `
Form Hook called after the form initialisation.

Useful to hide any loader after the form is ready.

Returns

- {`void`}

## `fields`
A collection of Field Configurations.

Include here the fields you want to customise (get/set/update operations). The other ones are discovered automatically.

See [Field Configuration](fields-configuration.md).

## `rules`
A collection of Update Rules.

Include here all the rules like "if field A changes, trigger the update of fields B and C".

See [Update Rule configuration](./update-rules.md).

## `init`
A collection of Initialisation Rules.

Include here all fields which will be updated when the form is created.

See [Initialisation Rule configuration](./init-rules.md).
