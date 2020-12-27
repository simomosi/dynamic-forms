# Dynamic Forms
DynamicForms is a js library that handles all the interaction with forms with dynamic content (e.g. select with variable options, updating rules and visibility changes depending on fields' state).

## Main features
- **Easy to use**: DynamicForms works in a declarative way; no code, just a simple JSON configuration!
- **Simple and modern javascript**: having no dependencies, you can integrate it everywhere!
- **Automatize repetitive and boring operations**: read values, make async remote calls, update fields, clear other fields, hide/show sections...
- **Highly customizable**: using an external library with custom html elements? Don't worry: you can specify your own functions to read/write data

## Installation
### NPM/Yarn
Feature incoming, stay tuned!

### Local
Include *dist/dynamicforms.min.js* (or *dist/dynamicforms.js*) in your project.

## Example of use
Examples are on their way. Stay tuned!

## Cool computer science stuff
- DynamicForms is a particular instance of the **Observer Design Pattern** in which Observers and Subjects are all of the same type (html elements)
- The function used to clear fields *on cascade* is the **Depth-first search (DFS)** used in Graph theory
- The library entry point implements the **Facade Design Pattern** to improve software usability (masking more complex underlying code e.g. explicit objects instantiation)

## Contribute
Import *src/index.js* module in your project. Work on project sources. Build it with *yarn build*.