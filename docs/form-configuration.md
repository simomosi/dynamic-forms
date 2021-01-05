# Table of Contents <!-- omit in toc -->

- [Form configuration](#form-configuration)
  - [id [required]](#id-required)
  - [debug](#debug)
  - [behavior](#behavior)
  - [behavior.beforeUpdate (subjectName)](#behaviorbeforeupdate-subjectname)
  - [behavior.afterUpdate (subjectName)](#behaviorafterupdate-subjectname)
  - [fields [required]](#fields-required)
  - [rules [required]](#rules-required)
  - [init](#init)
- [Update Rule configuration](#update-rule-configuration)
  - [name [required]](#name-required)
  - [additionalData](#additionaldata)
  - [externalData (data, subjectName)](#externaldata-data-subjectname)
- [Init Rule configuration](#init-rule-configuration)
  - [name [required]](#name-required-1)
  - [additionalData](#additionaldata-1)
  - [externalData (data, subjectName)](#externaldata-data-subjectname-1)

# Form configuration
This document describes the complete form configuration with focus on each property.

The configuration is written *client side* and passed to the correct method of *dynamicForms module* ([link to doc](./dynamicForms.md)) for the form instantiation.

Legend:
- **Subject**: the subject is the entity who changed;
- **Observer**: the observer is an entity who is notified by the subject change.

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

## id [required]
The form id. Just the plain text, no '#'.

## debug
A flag to activate the debug mode.

## behavior
Object which groups properties related to form behavior (e.g. what to do before or after an update event).

## behavior.beforeUpdate (subjectName)
Method called after a subject registers an update, but before triggering the update on the whole form.

Useful to show a loader during the fields update.

Parameters
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`bool`} *false* to abort the update, *true* otherwise

## behavior.afterUpdate (subjectName)
Method called after the form update, and in particular after all involved form's fields have completed their update.

Useful to hide a loader after the fields update.

Parameters
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`void`}

## fields [required]
A collection of Fields configurations.

Include here all fields involved in the DynamicForm behavior (get/set/update operations). Fields with no dynamic behavior may not be included.

See [Field configuration](#Field-configuration).

## rules [required]
A collection of Update Rules configurations.

Include here all rules like "if field A changes, trigger the update of fields B and C".

See [Update Rule configuration](#Update-Rule-configuration).

## init
A collection of Init Rules configurations.

Include here all fields which will be updated during the DynamicForm instantiation.

See [Init Rule configuration](#Init-Rule-configuration).

# Update Rule configuration
```javascript
let updateRuleConfiguration = {
    'name': 'fieldName',
    'update': [],
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};
```

## name [required]
The field name inside the form.

## additionalData
A collection of other fields name whose value will be automatically fetched and used in the field's update function.

## externalData (data, subjectName)
A function to collect other data used in the update function but external to the form (e.g. a timestamp).

Parameters
- {`object`} `data`: data obtained from the [additional data](#additionalData-optional) function
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`object`} An object with external data values (*key-value* format)

# Init Rule configuration
```javascript
let initRuleConfiguration = {
    'name': 'fieldName',
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};
```

## name [required]
The field name inside the form. It's the same as the analogous property in [Update Rule configuration](#Update-Rule-configuration).

## additionalData
It's the same as the analogous property in [Update Rule configuration](#Update-Rule-configuration).

## externalData (data, subjectName)
It's the same as the analogous property in [Update Rule configuration](#Update-Rule-configuration).
