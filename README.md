# Table of Contents <!-- omit in toc -->
- [Dynamic Forms](#dynamic-forms)
  - [Main features](#main-features)
- [Installation](#installation)
  - [NPM/Yarn](#npmyarn)
  - [Local](#local)
- [Examples of use](#examples-of-use)
  - [Minimal working example (serverless)](#minimal-working-example-serverless)
  - [Documentation](#documentation)
- [Cool computer science stuff](#cool-computer-science-stuff)
- [Contribute](#contribute)

# Dynamic Forms
DynamicForms is a js library that handles all the interaction with forms with dynamic content (e.g. select with variable options, visibility changes depending on fields' state, updating rules...).

## Main features
- **Easy to use**: DynamicForms works in a declarative way; no code, just a simple configuration!
- **Simple and modern javascript**: having no dependencies, you can integrate it everywhere!
- **Automatize repetitive and boring operations**: read values, make async remote calls, update fields, clear other fields, hide/show sections...
- **Highly customizable**: are you using an external library with custom html elements? Don't worry: you can specify your own functions to read/write data

# Installation
## NPM/Yarn
Feature incoming, stay tuned!

## Local
Include *dist/dynamicforms.js* in your project.

# Examples of use
## Minimal working example (serverless)
This example shows how to create a Dynamic Form with 2 dropdowns (select-option). 

According to the *Init Rule*, the first dropdown loads its content from a remote call during the form initialization.

According to the *Update Rule*, selecting a value in the first dropdown triggers the loading of the second dropdown filtered content.

Here follows the code. It's ready to use!

Create the form:
```html
<form id='jsonPlaceholder'>
  <label for="user">Users</label>
  <select id="user" name='user'>
      <option value="" selected> </option>
  </select>
  <br />
  <label for="post">Posts</label>
  <select id="post" name='post'>
      <option value="" selected></option>
  </select>
</form>
```
Note: both fields have no data.

Import the sources (use the correct path according to your project's structure):
```html
<script src = './dist/dynamicforms.js'></script>
```

Write the form configuration:
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

Initialize the DynamicForm:
```javascript
let form = dynamicForms.makeMultipleForms(formConfig);
```

**Done**. Easy.
Now the *user* field initializes itself with a remote call (according to the *Init Rule*); on every changes it updates the *post* field data (according to the *Update Rule*).

## Documentation
The approach followed is Documentation through Examples.

# Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type: html elements
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point (*src/index.js*) implements the **Facade Design Pattern** to improve software usability: it masks more complex underlying code e.g. explicit objects instantiation

# Contribute
Import *src/index.js* module in your project. Work on project sources. Build it with *yarn build*.