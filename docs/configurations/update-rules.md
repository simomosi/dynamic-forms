# Single Update Rule configuration
These rules declare which Observers to update when a Subject changes.

```javascript
const updateRuleConfiguration = {
    name: 'fieldName',
    update: [],  // Names of the Observers to update when the Subject changes
    additionalData: [], // Names of other fields whose values go in the Update Data
    externalData: (data, subjectName) => { } // Function which returns external data to add to the Update Data
};
```

## `name`*
The name of the Subject.

## `update`
The names of the Observers to update when the Subject changes. Their own Observers are cleared on cascade, since their value is no longer valid.

When the Subject changes again before an Observer has finished loading, the newer Update replaces the pending one: the pending one's remote call is aborted and its data discarded, even when it arrives later, so the Observer always shows the data of the latest change. The same happens when a Cascade Clear empties a field still loading. A `notify()` waiting on a replaced Update settles with the newest one.

Update Rules can't form a cycle: a field can't be an Observer of itself, directly or through other fields. `makeForm` throws `Update rules form a cycle: a → b → a` when they do.

## `additionalData`
The names of other fields whose values are read and added to the Update Data.

## `externalData (data, subjectName)`
A function to add to the Update Data other data, external to the form (e.g. a timestamp).

Parameters

- {`object`} `data`: the Update Data collected so far, with the Subject's value and the [additionalData](#additionaldata) values
- {`string`} `subjectName`: the name of the Subject

Returns

- {`object`} An object with external data values (*key-value* format)

## Update Data
The data an Observer receives for an update, keyed by field name: the Subject's value, plus the values of the `additionalData` fields and the object returned by `externalData`.

Field Hooks, `fetch.makeUrl`, `fetch.makeBody` and `fetch.fullFetchConfig` receive it as `data`.
