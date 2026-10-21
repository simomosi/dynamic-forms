## ToDo List

- [ ] Use dynamic-forms with dynamically created fields
- [ ] Release `4.0.0`: bump `version` in `package.json` (still `3.0.0`) before tagging, the publish workflow requires the tag to match it

## Changelog
Dynamic-forms follows the [semver](https://semver.org) standard.

#### 4.0.0 (unreleased)

- **Breaking:** `form.notify()` rejects when a select's remote call fails, instead of logging the error and resolving. `form.ready()` rejects too when an initialisation remote call fails ([#27](https://github.com/simomosi/dynamic-forms/issues/27)). Changes triggered by the user still log the error to the console
- `form.ready()` rejects when initialisation fails (e.g. `beforeInit` throws), instead of never settling ([#28](https://github.com/simomosi/dynamic-forms/issues/28))
- **Breaking:** every field hook receives the `NodeList` of the elements with the field name, even when there is only one. Hooks on single elements read `htmlElement[0].value` instead of `htmlElement.value`. Before, checkbox and radio `io.get`, `io.set` and `behavior.clear` and select `behavior.updateStatus`, `postProcessData` and `saveData` always received the `NodeList`, while the other hooks received the element itself when only one had the field name
- **Breaking (TypeScript):** public types reworked so configurations need no casts. The package now exports `FormConfiguration`, `FormHooks`, `UpdateRule`, `InitialisationRule`, `FieldConfiguration`, `FieldIoHooks`, `FieldFetchConfiguration`, `FieldHooks`, `SelectConfiguration`, `CheckboxConfiguration`, `UpdateData` and the `DynamicForm` type
    - `FormConfiguration` requires only `id`, and `behavior` accepts any subset of the form hooks
    - `FieldConfiguration` has the `select` and `checkbox` keys; the former `SelectConfiguration`/`CheckboxConfiguration` interfaces extending it are gone, and the names now belong to the former `SelectSelectConfiguration`/`CheckboxCheckboxConfiguration`
    - Renamed `FormBehavior` to `FormHooks`, `FieldBehaviorConfiguration` to `FieldHooks`, `FieldIoConfiguration` to `FieldIoHooks`
    - The `data` received by field hooks, `makeUrl`, `makeBody` and `externalData` is `UpdateData` (`Record<string, any>`) instead of `object`, so `data.country` needs no annotation
    - Form hooks and `externalData` receive a `string` subject name, never `null`
    - Field hooks receive `NodeListOf<FieldElement>` (`FieldElement` is `HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement`) instead of `HTMLElement | NodeList`, so `htmlElement[0].value` needs no narrowing or cast. `FieldConfiguration<E, V>` states the element and value types of a field (`FieldConfiguration<HTMLSelectElement>`, `FieldConfiguration<HTMLInputElement, string[]>`); the value stays `any` by default
    - `select.postProcessData` receives the response as `any` and returns `SelectOption[]` (`{ value: string | number, text: string }`), which `select.saveData` receives
    - `InitialisationRule.value` is `unknown` instead of `any`
    - The `behavior.afterUpdate` field hook returns `void` instead of `boolean`: its result was never used
    - Exports `FieldElement` and `SelectOption` too
- **Breaking:** `fetch.fullFetchConfig` is a function of the Update Data, `(data) => RequestInit`, instead of a static object, as the documentation already described ([#31](https://github.com/simomosi/dynamic-forms/issues/31)). Wrap an existing object as `fullFetchConfig: () => ({ ... })`
- `makeForm()` no longer modifies the given configuration: defaults and discovered fields go into an internal copy. Form hooks set to `undefined` fall back to the default instead of throwing
- **Breaking:** `makeForm()` throws when the update rules form a cycle, including a field listing itself in its own `update`, which used to be ignored ([#38](https://github.com/simomosi/dynamic-forms/issues/38)). A cycle used to clear the field the user had just changed
- **Breaking:** a custom `behavior.beforeUpdate` on a select no longer switches off `select.clearOnParentVoid`: with an empty subject the select is cleared and its update stops before the hook is called ([#40](https://github.com/simomosi/dynamic-forms/issues/40)). Set `clearOnParentVoid: false` to handle an empty subject in the hook
- Initialisation no longer clears the init value of a field reached by the cascade clear of another initialised field ([#37](https://github.com/simomosi/dynamic-forms/issues/37))
- An update clears the observers' observers before updating the observers, so the result no longer depends on the order of the names in `update`
- `form.notify()` and `form.ready()` reject when clearing the observers' observers fails (e.g. a `behavior.clear` field hook throws), instead of leaving an unhandled rejection
- Clearing a checkbox unchecks it instead of checking it ([#25](https://github.com/simomosi/dynamic-forms/issues/25))
- A select filled by a remote call gets an empty option when neither the html nor the data have one ([#26](https://github.com/simomosi/dynamic-forms/issues/26)). An option with value `0` is not taken for the empty one

#### 3.0.0

- Webpack has been replaced with Vite
- Library import does not expose the `dynamicForms` module anymore but `makeform` and `getForm` functions directly

#### 2.0.0

- Library has been rewritten in typescript
- `FieldConfiguration.dropdown` renamed to `FieldConfiguration.select`
- Better documentation

#### 1.3.0

- Added automatic field discovery: you don't need to specify fields with standard behavior anymore

#### 1.2.0

- Supported fields initialisation
- Added `form.ready()` method to synchronise post-initialisation operations

#### 1.0.1

- Added support for nested input names ([link](https://github.com/simomosi/dynamic-forms/pull/3)). Thanks to [@yoannisj](https://github.com/yoannisj)

#### 1.0.0

- First release