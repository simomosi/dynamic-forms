# Form configuration
This document describes the complete form configuration with focus on each property.

The configuration is written *client side* and passed to the correct method of [*dynamicForms module*](../dynamic-forms-module.md) for the form instantiation.

Glossary:

- **Subject**: the subject is the entity who changed
- **Observer**: the observer is an entity who is notified by the subject change

Here's the complete form configuration:

```javascript
let formConfiguration = {
    'id': 'formId',
    'debug': true,
    'behavior': {
        'beforeUpdate': (subjectName) => { }, // Executed before the update related events. Return false to block all updates
        'afterUpdate': (subjectName) => { }, // Executed after the update related events
    },
    'fields': [], // Collection of fields objects
    'rules': [], // Collection of rules objects
    'init': [] // Collection of init objects
};
```

## id*
The form id. Just the plain text, no '#'.

Type: `string`.

*required*

## debug
A flag to activate the debug mode.

Type: `boolean`.

## behavior
Object which groups properties related to form behavior (e.g. what to do before or after an update event).

### beforeUpdate (subjectName)
Method called after a subject registers an update, but before triggering the update on the whole form.

Useful to show a loader during the fields update.

Parameters
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`bool`} *false* to abort the update, *true* otherwise

### afterUpdate (subjectName)
Method called after the form update, and in particular after all involved form's fields have completed their update.

Useful to hide a loader after the fields update.

Parameters
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`void`}

## fields*
A collection of Fields configurations.

Include here all fields involved in the DynamicForm behavior (get/set/update operations). Fields with no dynamic behavior may not be included.

*required*

See [Field configuration](#Field-configuration).

## rules*
A collection of Update Rules configurations.

Include here all rules like "if field A changes, trigger the update of fields B and C".

*required*

See [Update Rule configuration](#Update-Rule-configuration).

## init
A collection of Init Rules configurations.

Include here all fields which will be updated during the DynamicForm instantiation.

See [Init Rule configuration](#Init-Rule-configuration).
