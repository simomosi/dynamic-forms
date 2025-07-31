# Tutorial - Set the Initial Status

Sometimes you need to load a prefilled form, and the initial values should trigger actions like *retrieving data*, *hide* or *disable* other fields.

Dynamic-forms can automatically set the form initial status and trigger those operations for you.

You need to list all the fields which requires the initialisation, describing:

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

- the information specified in the `fields` section to retrieve remote data for each field specified in the `init` section
- the informations specified in the `rules` section to infer what data should be retrieved after the initialisation

In the example above, dynamic-forms will first initialise `field_one` using `fields` and `init` rules, then it will initialise `field_two` using (update) `rules` as specified in the previous page.

If you need to specify other data, just list their name and value in the `init` collection just like they were form fields.

## Wait for complete initialisation

The initialisation phase is an asynchronous procedure: your script will continue without waiting for the subroutine to end. 

If you need to execute code after the initialisation is complete, use the `ready` function as shown below.



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

