# Table of Contents <!-- omit in toc -->
- [Dynamic Forms](#dynamic-forms)
  - [Main features](#main-features)
- [Installation](#installation)
  - [NPM/Yarn](#npmyarn)
  - [Local](#local)
- [Documentation and examples of use](#documentation-and-examples-of-use)
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

# Documentation and examples of use
- [Minimal and serverless working example](docs/minimal-example.md)
- [Module dynamicForms (to instantiate dynamic forms)](docs/dynamicForms.md)
- [Form configuration](docs/configuration.md)

# Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type: html elements
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point (*src/index.js*) implements the **Facade Design Pattern** to improve software usability: it masks more complex underlying code e.g. explicit objects instantiation

# Contribute
Import *src/index.js* module in your project. Work on project sources. Build it with *yarn build*.