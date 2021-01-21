# Table of Contents <!-- omit in toc -->
- [Dynamic Forms](#dynamic-forms)
    - [Select with variable options](#select-with-variable-options)
    - [Visibility changes depending on fields' state](#visibility-changes-depending-on-fields-state)
    - [Updating rules](#updating-rules)
  - [Main features](#main-features)
  - [Installation](#installation)
    - [NPM/Yarn](#npmyarn)
    - [Local](#local)
  - [Documentation and examples of use](#documentation-and-examples-of-use)
  - [Cool computer science stuff](#cool-computer-science-stuff)
  - [Contribute](#contribute)

# Dynamic Forms
DynamicForms is a javascript library that handles all the interaction in forms with dynamic content in an easy and fast way.

### Select with variable options

![Dynamic Dropdown example gif](./docs/imgs/dynamic-dropdown.gif)

### Visibility changes depending on fields' state

![Dynamic Checkbox example gif](./docs/imgs/dynamic-checkbox.gif)

### Updating rules

![Dynamic Radio example gif](./docs/imgs/dynamic-radio.gif)

## Main features
- **Easy to use**: DynamicForms works in a declarative way; no code, just a simple configuration!
- **Simple and modern javascript**: having no dependencies, you can integrate it everywhere!
- **Automatize repetitive and boring operations**: read values, fetch data making async remote calls, update fields' status, clear other fields, hide/show sections...
- **Highly customizable**: are you using an external library with custom html elements? Don't worry: you can specify your own functions to read/write data

## Installation
### NPM/Yarn
Feature incoming, stay tuned!

### Local
Include *dist/dynamicforms.js* in your project.

## Documentation and examples of use
See [DynamicForms page](https://simomosi.github.io/dynamic-forms/)

## Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type: html elements
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point (*src/index.js*) implements the **Facade Design Pattern** to improve software usability: it masks more complex underlying code e.g. explicit objects instantiation

## Contribute
Import *src/index.js* module in your project. Work on project sources. Build it with *yarn build*.