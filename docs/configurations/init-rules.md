# Single Initialisation Rule configuration
These rules declare the fields to bring up to date when the form is created, optionally with their initial value.

An Initialisation Rule can name a field of the form, or external data which is not a field.

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

- It's passed in the Update Data of every field listed in the Initialisation Rules;
- It becomes the field's value; for a select field, the value must be among its options to be selected.