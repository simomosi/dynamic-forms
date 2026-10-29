# Tutorial - Set the Initial Status

Sometimes you need to load a prefilled form, and the initial values should trigger actions like *retrieving data*, *hide* or *disable* other fields.

Dynamic-forms can automatically set the form initial status and trigger those operations for you.

You need to list in the Initialisation Rules all the fields which require the initialisation, describing:

1. Their **name**
2. Their initial **value** (optional)


```javascript
const formConfiguration = {
    id: 'form_id',
    fields:[/* ... */],
    rules: [/* ... */],
    init: [
        {
            name: 'field_one',
            value: '1'
        },
    ]
};
```

Note: you need to specify an API-endpoint in `fields` for `field_one` to work.

Dynamic-forms uses:

- the Field Configurations in the `fields` section to retrieve remote data for each field listed in the Initialisation Rules (`init` section)
- the Update Rules in the `rules` section to update the Observers of the initialised fields

In the example above, dynamic-forms will first initialise `field_one` using its Field Configuration and its Initialisation Rule, then it will update its Observer `field_two` using the Update Rules specified in the previous page.

The values of all the Initialisation Rules go in the Update Data of each initialised field. Initialisation Rules name fields of the form only: `makeForm` throws for any other name.

## Wait for complete initialisation

The initialisation phase is an asynchronous procedure: your script will continue without waiting for the subroutine to end. Every form goes through it, also without Initialisation Rules (it calls `beforeInit` and `afterInit`).

Until `ready()` settles (resolved or rejected), the Initialisation comes first:

- the fields' changes are ignored: the initial values win over what the user types meanwhile, and a field changed then updates its Observers only at its next change;
- `notify()` and `manualUpdate()` reject with `Form "id" is initialising: await ready() first`.

So wait for `ready()` before calling them, as shown below.



=== "Promise"
    ```javascript
    const form = makeForm(formConfiguration);
    form.ready().then(() => {
        /* Your code here */
    });
    ```
=== "Async/Await"
    ```javascript
    async function initialiseForm() {
        let form = makeForm(formConfiguration);
        await form.ready();
        /* Your code here */
    }
    initialiseForm();
    ```

