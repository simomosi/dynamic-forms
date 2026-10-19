# Single Update Rule configuration
These rules are used to manage fields update.

```javascript
const updateRuleConfiguration = {
    name: 'fieldName',
    update: [],  // Array of form fields names to notify when events occour
    additionalData: [], // Array of other form field names to send to server
    externalData: (data, subjectName) => { } // Function which returns a json of data
};
```

## `name`*
The field name inside the form.

## `additionalData`
A collection of other fields name whose value will be automatically fetched and used in the field's update function.

## `externalData (data, subjectName)`
A function to collect other data used in the update function but external to the form (e.g. a timestamp).

Parameters

- {`object`} `data`: data obtained from the [additional data](#additionalData-optional) function
- {`string`} `subjectName`: the name of the subject who triggered the update

Returns

- {`object`} An object with external data values (*key-value* format)
