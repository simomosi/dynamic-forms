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
    <script type="module">
        import { makeForm } from 'https://unpkg.com/@simomosi/dynamic-forms@latest';
    </script>
```

## Write the Form Configuration

For the Form Configuration we need to write 2 lists:

1. **fields**: a list of the fields you want to customise (using the [Field Configuration](../configurations/fields-configuration.md) format); a field which loads its options from a remote url needs a Field Configuration;
2. **rules**: a list of Update Rules, which tell the Observers to update when a Subject changes, usually on a `change` event (using the [Update Rule](../configurations/update-rules.md) format)

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

Note: we didn't need to specify a Field Configuration for `field_one`: it is discovered automatically.

## Create the form

Create the form and forget about it: dynamic-forms will work by itself!

```javascript
const form = makeForm(formConfiguration);
```

## Done!

Look at the network tab in developer console/tools while you play with your form!

Of course you need a real api-endpoint to load your values. For a working example open files in the [example folder](https://github.com/simomosi/dynamic-forms/blob/main/examples) in your browser. 

This is a basic configuration which works with default values. To customize it to your needs check the [documentation chapter](../configurations/form-configuration.md).