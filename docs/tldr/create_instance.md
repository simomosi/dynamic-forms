# TL;DR - Form creation

## Preconditions

Did you already [installed](../start/installation.md) and [loaded](../start/loading.md) the library? Then go on, you are almost there!

Let's assume we are working on the following html form:

```html
<form id='form_id'>
    <label for="field_one">Field one</label>
    <select id="field_one" name='field_one'>
        <option value="" selected></option>
    </select>

    <label for="field_two">Field two</label>
    <select id="field_two" name='field_two'>
        <option value="" selected></option>
    </select>
</form>
```

## Write form configuration

For the form configuration we need to write 2 lists:

1. **fields**: a list of all form fields
2. **rules**: a list which indicates when an event in a field (usually a `change`) should notify other fields

```javascript
const formConfiguration = {
    id: 'form_id',
    fields: [
        {
            name: 'field_one',
            fetch: {
                makeUrl: (data) => `https://url/to/api`,
            }
        },
        {
            name: 'field_two'
        },
    ],
    rules: [
        {
            name: 'field_one',
            update: ['field_two']
        },
    ]
};
```

## Create the dynamic form

Create an instance and forget about it: dynamic-forms will work by itself!

```javascript
const form = dynamicForms.makeForm(formConfiguration);
```

## Done!

You can now play with your form!

This is a basic configuration which works with default values. To customize it to your needs check the [documentation chapter](../configurations/form-configuration.md).

For a working example open files in the [example folder](https://github.com/simomosi/dynamic-forms/blob/main/examples) in your browser. 
