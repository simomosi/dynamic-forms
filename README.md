# Dynamic Forms
DynamicForms is a js library that handles all the interaction with forms with dynamic content (e.g. select with variable options, updating rules and visibility changes depending on fields' state).

## Main features
- *Easy to use*: DynamicForms works in a declarative way; no code, just a simple JSON configuration!
- *Simple and modern javascript*: having no dependencies, you can integrate it everywhere!
- *Automatize repetitive and boring operations*: read values, async calls, update fields, clear other fields, hide/show sections...
- *Highly customizable*: using an external library with custom html elements? No worries: you can specify your own functions to read/write data

## Example of use
First of all, import the file dist/dynamicforms.js in your project (loading with npm/yarn will be the next feature)

Examples are on their way. Stay tuned!

## Cool computer science stuff
- DynamicForms is a particular instance of the *Observer Design Pattern* in which Observers and Subjects are all of the same type (html elements)
- The function used to clear fields on cascade is the *Breadth-first search* used in Graph theory