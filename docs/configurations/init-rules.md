# Single Initialisation Rule configuration
These rules are used to manage fields initialization.

Parameters in init rules can reference to form fields and external data.

```javascript
const initialisationRuleConfiguration = {
    name: 'fieldName',
    value: any
};
```

## `name`*
The field name.

## `value`
The field value. It can be any primitive value.

This attribute has 2 purposes:
- It's passed to all other fields during initialisation; 
- It will be the value automatically selected as the current field value; if the field type is *Dropdown*, the value must be available to be selected.