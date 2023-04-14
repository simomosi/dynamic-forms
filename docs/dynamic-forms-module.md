# DynamicForms module
## How to use it
This document describes the **dynamicForms** module properties.

This module let you instantiate and work easily with the whole DynamicForms library.

You only need to use properties declared in this module and nothing else.

First import the module (see [first page](./start/loading.md))

Module use example:
```javascript
const form = dynamicForms.makeForm(formConfiguration);
```

## Properties

### `makeForm (formConfiguration)`
Istantiates a DynamicForm.

Parameters
- {`object`} `formConfiguration`: the form configuration

Returns
- {`DynamicForm`} a DynamicForm instance

### `getForm (id)`
Returns a DynamicForm instance corresponding to the form id, if it exists.

Parameters
- {`string`} `id`: the form id

Returns
- {`DynamicForm | null`} the DynamicForm instance or null if it does not exists
