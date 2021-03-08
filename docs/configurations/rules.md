# Rules
Rules to manage fields update and instantiation.

## Update Rule configuration
```javascript
let updateRuleConfiguration = {
    'name': 'fieldName',
    'update': [],
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};
```

### `name`*
The field name inside the form.

### `additionalData`
A collection of other fields name whose value will be automatically fetched and used in the field's update function.

### `externalData (data, subjectName)`
A function to collect other data used in the update function but external to the form (e.g. a timestamp).

Parameters
- {`object`} `data`: data obtained from the [additional data](#additionalData-optional) function
- {`string | null`} `subjectName`: the name of the subject who triggered the update. It can be null if the update is triggered manually

Returns
- {`object`} An object with external data values (*key-value* format)

## Init Rule configuration
```javascript
let initRuleConfiguration = {
    'name': 'fieldName',
    'additionalData': [], // Array of field names
    'externalData': (data, subjectName) => { } // Function which returns a json of data
};
```

### `name`*
The field name inside the form. It's the same as the analogous property in [Update Rule configuration](#Update-Rule-configuration).

### `additionalData`
It's the same as the analogous property in [Update Rule configuration](#additionalData).

### `externalData (data, subjectName)`
It's the same as the analogous property in [Update Rule configuration](#externalData-data-subjectName).