# Table of Contents <!-- omit in toc -->

- [DynamicForms module](#dynamicforms-module)
  - [makeForm (formConfiguration)](#makeform-formconfiguration)
  - [makeMultipleForms (formsConfigCollection)](#makemultipleforms-formsconfigcollection)
  - [getForm (id)](#getform-id)
  - [getField (formId, fieldName)](#getfield-formid-fieldname)

# DynamicForms module
This document describes the **dynamicForms** module properties.

This module let you instantiate and work easily with the whole DynamicForms library.

You only need to use properties declared in this module and nothing else.

Module import example:
```html
<script src = './dist/dynamicforms.js'></script>
```

Module use example:
```javascript
let form = dynamicForms.makeMultipleForms(formConfig);
```
## makeForm (formConfiguration)
Istantiates a DynamicForm.

Parameters
- {`object`} `formConfiguration`: the form configuration

Returns
- {`DynamicForm`} a DynamicForm instance

## makeMultipleForms (formsConfigCollection)
Istantiates multiple DynamicForm.

Parameters
- {`object[]`} `formsConfigCollection`: a collection of form configurations

Returns
- {`DynamicForm[]`} a collection of DynamicForm instances

## getForm (id)
Returns a DynamicForm instance corresponding to the form id, if it exists.

Parameters
- {`string`} `id`: the form id

Returns
- {`DynamicForm | null`} the DynamicForm instance or null if it does not exists

## getField (formId, fieldName)
Returns a DynamicElement instance inside the specified DynamicForm, if it exists.

Parameters
- {`string`} `formId`: the form id
- {`string`} `fieldName`: the field name

Returns
- {`DynamicElement | null`} the DynamicElement instance or null if it does not exists