## ToDo List

- [ ] Use dynamic-forms with dynamically created fields
- [ ] Release `4.0.0`: bump `version` in `package.json` (still `3.0.0`) before tagging, the publish workflow requires the tag to match it

## Changelog
Dynamic-forms follows the [semver](https://semver.org) standard.

#### 4.0.0 (unreleased)

- **Breaking:** `form.notify()` rejects when a select's remote call fails, instead of logging the error and resolving. `form.ready()` rejects too when an initialisation remote call fails ([#27](https://github.com/simomosi/dynamic-forms/issues/27)). Changes triggered by the user still log the error to the console
- `form.ready()` rejects when initialisation fails (e.g. `beforeInit` throws), instead of never settling ([#28](https://github.com/simomosi/dynamic-forms/issues/28))
- **Breaking (TypeScript):** public types reworked so configurations need no casts. The package now exports `FormConfiguration`, `FormHooks`, `UpdateRule`, `InitialisationRule`, `FieldConfiguration`, `FieldIoHooks`, `FieldFetchConfiguration`, `FieldHooks`, `SelectConfiguration`, `CheckboxConfiguration`, `UpdateData` and the `DynamicForm` type
    - `FormConfiguration` requires only `id`, and `behavior` accepts any subset of the form hooks
    - `FieldConfiguration` has the `select` and `checkbox` keys; the former `SelectConfiguration`/`CheckboxConfiguration` interfaces extending it are gone, and the names now belong to the former `SelectSelectConfiguration`/`CheckboxCheckboxConfiguration`
    - Renamed `FormBehavior` to `FormHooks`, `FieldBehaviorConfiguration` to `FieldHooks`, `FieldIoConfiguration` to `FieldIoHooks`
    - The `data` received by field hooks, `makeUrl`, `makeBody` and `externalData` is `UpdateData` (`Record<string, any>`) instead of `object`, so `data.country` needs no annotation
    - Form hooks and `externalData` receive a `string` subject name, never `null`
- `makeForm()` no longer modifies the given configuration: defaults and discovered fields go into an internal copy
- Clearing a checkbox unchecks it instead of checking it ([#25](https://github.com/simomosi/dynamic-forms/issues/25))
- A select filled by a remote call gets an empty option when neither the html nor the data have one ([#26](https://github.com/simomosi/dynamic-forms/issues/26))

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