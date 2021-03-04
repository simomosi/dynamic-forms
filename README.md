# Table of Contents <!-- omit in toc -->
- [Dynamic Forms](#dynamic-forms)
  - [What is it and what can I do with it](#what-is-it-and-what-can-i-do-with-it)
    - [Select with variable options](#select-with-variable-options)
    - [Visibility changes depending on fields' state](#visibility-changes-depending-on-fields-state)
    - [Updating rules](#updating-rules)
    - [Much much more](#much-much-more)
  - [Main features](#main-features)
  - [Installation](#installation)
    - [NPM/Yarn](#npmyarn)
    - [Local](#local)
  - [Documentation and examples of use](#documentation-and-examples-of-use)
  - [Cool computer science stuff](#cool-computer-science-stuff)
  - [Disclaimer](#disclaimer)
  - [ToDo List](#todo-list)

# Dynamic Forms
## What is it and what can I do with it
DynamicForms is a javascript library that handles all the interaction in forms with dynamic content in an easy and fast way.

Here's some examples.

### Select with variable options

![Dynamic Dropdown example gif](./docs/imgs/dynamic-dropdown.gif)

### Visibility changes depending on fields' state

![Dynamic Checkbox example gif](./docs/imgs/dynamic-checkbox.gif)

### Updating rules

![Dynamic Radio example gif](./docs/imgs/dynamic-radio.gif)

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
Include `dist/dynamicforms.min.js` (in a production environment) OR `dist/dynamicforms.js` (in a development environment) in your project.

## Documentation and examples of use
See [DynamicForms page](https://simomosi.github.io/dynamic-forms/)

## Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type: html elements
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point (*src/index.js*) implements the **Facade Design Pattern** to improve software usability: it masks more complex underlying code e.g. explicit objects instantiation

## Disclaimer
DynamicForms is build considered some use-cases I have faced in my career.

At the moment I have no *real* use case to test it on. If you have trouble using it please let me know and open an issue, I'll be glad to help you. Suggestions are also welcome!

It will be useful if you pass me some code to try: you can use tools like CodePen, PasteBin etc.

## ToDo List

- Implement 'forms configurations': instantiate the DynamicForm *one time*, and specify different sets of rules to switch on. Example: `if (A is Europe) then B updates C; if (A is America) then B updates D.`