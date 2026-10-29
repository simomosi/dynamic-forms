# Architecture
The UML class diagram of the library, to help you find your way in `src`. It shows the public members (`+`) and the members the Field kinds override (`#`); private members are left out, and so are types, for space reasons. The diagram is created using Mermaid, which places elements automatically.

Users only see `makeForm`, `getForm` and the `Form` interface: the classes are internal, and `DynamicForm` keeps its state in ES private fields.

```mermaid
classDiagram

    class dynamicForms {
        +makeForm(formConfiguration) Form
        +getForm(id) Form
    }

    note for dynamicForms "Library entrypoint"

    class resolveConfiguration {
        +resolveConfiguration(formHtmlElement, formConfiguration) ResolvedFormConfiguration
    }

    note for resolveConfiguration "Checks the configuration and completes every Form and Field default, Discovered Fields included"

    class createFields {
        +createFields(fieldsCollection, htmlForm) Map❬string DynamicElement❭
    }

    class Form {
        <<interface>>
        +ready() Promise❬void❭
        +notify(subjectName) Promise❬void❭
        +manualUpdate(data, subjectName) Promise❬void❭
        +destroy() void
        +setEnabled(enable) void
        +isEnabled() boolean
        +getId() string
    }

    class DynamicForm

    note for DynamicForm "The Mediator between the Fields: on each change it updates the Observers of the changed Field and clears on cascade the Fields beyond them"

    class DynamicElement {
        +NodeList htmlElement
        +string name
        +FieldIoHooks io
        +FieldFetchConfiguration fetch
        +FieldHooks behavior
        +string event
        +attach(onChange) void
        +detach() void
        +get() any
        +set(value) void
        +clear() void
        +cascadeClear() void
        +update(data, subjectName, signal) Promise❬void❭
        #standardListen(onChange) function
        #whileWriting(write) void
        #standardGet() any
        #standardSet(value) void
        #standardClear() void
        #canUpdate(data, subjectName) boolean
        #standardUpdateStatus(data, subjectName, signal) Promise❬void❭
    }

    note for DynamicElement "Public methods use the Field Hook if given, else the Standard Behaviour; subclasses override only the Standard Behaviours"

    class DynamicSelect {
        +string method
        +SelectConfiguration select
        #standardClear() void
        #canUpdate(data, subjectName) boolean
        #standardUpdateStatus(data, subjectName, signal) Promise❬void❭
        #postProcessData(data) SelectOption[]
        #saveData(data) void
    }

    class DynamicCheckbox {
        +CheckboxConfiguration checkbox
        #standardGet() any
        #standardSet(value) void
        #standardClear() void
    }

    class DynamicRadio {
        #standardGet() any
        #standardSet(value) void
        #standardClear() void
    }

    dynamicForms --> resolveConfiguration
    dynamicForms --> createFields
    dynamicForms --> DynamicForm

    Form <|.. DynamicForm
    DynamicForm o-- DynamicElement
    createFields ..> DynamicElement

    DynamicElement <|-- DynamicSelect
    DynamicElement <|-- DynamicCheckbox
    DynamicElement <|-- DynamicRadio

```
