# TL;DR - Set the Initial Status

Dynamic-forms can automatically set the form initial status if you don't want to retrieve all values manually.

You need to list all the fields which requires the initialisation, describing:

1. Their **name**
2. Their initial **value**, if you want to set one


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

Dynamic-forms uses:

- the information specified in the `fields` section to retrieve remote data for each field in the `init` section
- the informations specified in the `rules` section to infer what data should be retrieved next

In the example above, first `fields` and `init` rules will initialise `field_one`, then (update) `rules` will initialise `field_two` as specified in the previous page.

If you need to specify other data, just list their name and value in the `init` collection just like they were form fields.

## Wait for complete initialisation

The initialisation phase is an asynchronous procedure: your script will continue without waiting for the subroutine to end. 

If you need to execute code after the initialisation is complete, use the `ready` function as shown below.



=== "Promise"
    ```javascript
    const form = dynamicForms.makeForm(formConfiguration);
    form.ready().then(() => {
        /* Your code here */
    });
    ```
=== "Async/Await"
    ```javascript
    async function initialiseForm() {
        let form = dynamicForms.makeForm(formConfiguration);
        await form.ready();
        /* Your code here */
    }
    initialiseForm();
    ```

