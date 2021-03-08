# Dynamic Forms

## What is it and what can I do with it
DynamicForms is a javascript library that handles all the interaction in forms with dynamic content in an easy and fast way.

Here's some examples.

### Select with variable options

![Dynamic Dropdown example gif](./imgs/dynamic-dropdown.gif)

### Visibility changes depending on fields' state

![Dynamic Checkbox example gif](./imgs/dynamic-checkbox.gif)

### Updating rules

![Dynamic Radio example gif](./imgs/dynamic-radio.gif)

### Much much more
Got your attention? Try it!

Dynamic Forms is released as a **single file**. You can also find an already functioning example!

## Main features
- **Easy to use**: DynamicForms works in a declarative way; no code, just a simple configuration!
- **Simple and modern javascript**: having no dependencies, you can integrate it everywhere!
- **Automatize repetitive and boring operations**: read values, fetch data making async remote calls, update fields' status, clear other fields, hide/show sections...
- **Highly customizable**: are you using an external library with custom html elements? Don't worry: you can specify your own functions to read/write data

## Installation
### NPM/Yarn
Feature incoming, stay tuned!

### Local

#### Import as script tag
```html
<script src = './dist/dynamicforms.min.js'></script>
```

#### Import as module (ES6 syntax)
```html
<script type="module">
    import * from './dist/dynamicforms.min.js';
</script>
```

#### Import with CommonJs syntax
```javascript
const dynamicForms = require('dynamicForms');
```

## Documentation
### Examples of use

- [Minimal and serverless working example](./examples/minimal-example.md) (you can copy and paste it!)

### Configuration

- [DynamicForms module](./dynamic-forms-module.md) (how to use the library)
- [Form configuration](./configurations/form-configuration.md) (identify the form and define its behavior)
- [Field configuration](./configurations/field-configuration.md) (identify form fields and define their behavior)

## Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type: html elements
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point (*src/index.js*) implements the **Facade Design Pattern** to improve software usability: it masks more complex underlying code e.g. explicit objects instantiation

## Disclaimer
DynamicForms is build considered some use-cases I faced in my career.

If you can offer me other *real* use cases to test it on please let me know.

If you have trouble using it open an issue, I'll be glad to help you. Suggestions are also welcome!

It will be useful if you pass me some code to try: you can use tools like CodePen, PasteBin etc.

## Contribute
Help me develop DynamicForms!

Remember to work on `dist/dynamicforms.js` file to access source code (or import the `src/index.js` file as a module if you prefer).

Useful commands:

- `yarn build:dev` - Build the project in *development mode*: this enables dev tools and keeps references to original source code; you can use it with `--watch` flag
- `yarn build:prod` - Build the project in *production mode*: this improves performance and security (hide all source code references); you can use it with `--watch` flag
- `yarn build` - Build both dev file and prod file
- `yarn build:diagrams` - Updates *classdiagram.svg* from *classdiagram.mmd*

Please, update also the documentation if you can.

Here is the UML Class Diagram to help you understand the project structure.

![Class Diagram](./imgs/classdiagram.svg)

**Thank you very much for your support ❤**

## ToDo List

- Implement 'forms configurations': instantiate the DynamicForm *one time*, and specify different sets of rules to switch on. Example: `if (A is Europe) then B updates C; if (A is America) then B updates D.`
