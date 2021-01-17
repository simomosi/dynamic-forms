# 1. Minimal and serverless working example

This example shows how to create a Dynamic Form with 2 dropdowns (select-option).

According to the *Init Rule*, the first dropdown loads its content from a remote call during the form initialization.

According to the *Update Rule*, selecting a value in the first dropdown triggers the loading of the second dropdown filtered content.

Here follows the code. It's ready to use!

## 1.1. Create the form
```html
<form id='jsonPlaceholder'>
  <label for="user">Users</label>
  <select id="user" name='user'>
      <option value="" selected></option>
  </select>
  <br />
  <label for="post">Posts</label>
  <select id="post" name='post'>
      <option value="" selected></option>
  </select>
</form>
```
Note: both fields have no data.

## 1.2. Import the sources
Use the correct path according to your project's structure.

```html
<script src = './dist/dynamicforms.js'></script>
```

## 1.3. Write the form configuration.
```javascript
let formConfig = {
  'id': 'jsonPlaceholder', // form id
  'debug': true, // prints some info
  'fields': [ // list of involved fields
    {
      'name': 'user', // field name
      'fetch': {
        // function to generate an url for remote calls
        'makeUrl': (data) => `https://jsonplaceholder.typicode.com/users`,
      },
      'behavior': {
        // function to postprocess data and adapt it according to our needs
        'postProcessData': (htmlElement, data) => {
          return data
          .map(x => { return { 'value': x.id, 'text': x.username }; })
          .sort((a, b) => { return a.text > b.text });
        }
      }
    },
    {
      'name': 'post',
      'fetch': {
        'makeUrl': (data) => `https://jsonplaceholder.typicode.com/posts?userId=${data.user}`,
      },
      'behavior': {
        'postProcessData': (htmlElement, data) => {
          return data
          .map(x => { return { 'value': x.id, 'text': x.title }; });
        }
      }
    }
  ],
  'rules': [ // list of Update Rules
    // a change on 'user' updates the 'post' field content
    {
      'name': 'user',
      'update': ['post'],
    }
  ],
  'init': [ // list of Init Rules
    // the 'user' field loads its content remotely during the form initialization
    {
      'name': 'user',
    }
  ]
};
```

## 1.4. Initialize the DynamicForm
```javascript
let form = dynamicForms.makeForm(formConfig);
```

**Done**. 4 steps. Easy.

Now the *user* field initializes itself with a remote call (see the *Init Rule*); on every changes it updates the *post* field data (see the *Update Rule*).