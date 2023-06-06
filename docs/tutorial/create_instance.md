# Tutorial - Form creation

## Preconditions

Did you already [installed](../start/installation.md) and [loaded](../start/loading.md) the library? Then go on, you are almost there!

Let's assume we are working on the following html form:

```html
<form id='form_id'>
    <label for="field_one">Field one</label>
    <select id="field_one" name='field_one'>
        <option value="" selected></option>
        <option value="1">One</option>
        <option value="2">Two</option>
    </select>

    <label for="field_two">Field two</label>
    <select id="field_two" name='field_two'>
        <option value="" selected></option>
    </select>
</form>
```

Let's assume we loaded dynamic-forms using a CDN:
```html
<script src = 'https://unpkg.com/@simomosi/dynamic-forms@latest'></script>
```

## Write form configuration

For the form configuration we need to write 2 lists:

1. **fields**: a list of form fields with custom behavior (using the [field configuration](../configurations/fields-configuration.md) format); a field with a remote url for fetching its values is a custom behavior field;
2. **rules**: a list which indicates when a field related event (usually a `change`) should notify other fields (using the [update rule](../configurations/update-rules.md) format)

```javascript
const formConfiguration = {
    id: 'form_id',
    fields: [
        {
            name: 'field_two',
            fetch: {
                makeUrl: (data) => `https://url/to/api/`,
            }
        }
    ],
    rules: [
        {
            name: 'field_one',
            update: ['field_two']
        },
    ]
};
```

Note: we didn't specify `field_one`'s configuration.

## Create the dynamic form

Create an instance and forget about it: dynamic-forms will work by itself!

```javascript
const form = dynamicForms.makeForm(formConfiguration);
```

## Done!

Look at the network tab in developer console/tools while you play with your form!

Of course you need a real api-endpoint to load your values. For a working example open files in the [example folder](https://github.com/simomosi/dynamic-forms/blob/main/examples) in your browser. 

This is a basic configuration which works with default values. To customize it to your needs check the [documentation chapter](../configurations/form-configuration.md).