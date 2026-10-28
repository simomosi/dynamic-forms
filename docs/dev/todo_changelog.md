## ToDo List

- [ ] Release `4.0.0`: bump `version` in `package.json` (still `3.0.0`) before tagging, the publish workflow requires the tag to match it
- [ ] Release `4.0.0`: replace `REPLACED_AT_THE_4.0.0_RELEASE` in `docs/start/loading.md` with the hash of the published `dist/dynamic-forms.umd.js` (command in that page); at every later release, update the version and hash of that snippet

## Changelog
Dynamic-forms follows the [semver](https://semver.org) standard.

#### 4.0.0 (unreleased)

- **Breaking:** `form.notify()` rejects when a select's remote call fails, instead of logging the error and resolving. `form.ready()` rejects too when an initialisation remote call fails ([#27](https://github.com/simomosi/dynamic-forms/issues/27)). Changes triggered by the user still log the error to the console
- `form.ready()` rejects when initialisation fails (e.g. `beforeInit` throws), instead of never settling ([#28](https://github.com/simomosi/dynamic-forms/issues/28))
- **Breaking:** every Field Hook receives the `NodeList` of the elements with the field name, even when there is only one. Hooks on single elements read `htmlElement[0].value` instead of `htmlElement.value`. Before, checkbox and radio `io.get`, `io.set` and `behavior.clear` and select `behavior.updateStatus`, `postProcessData` and `saveData` always received the `NodeList`, while the other hooks received the element itself when only one had the field name
- **Breaking (TypeScript):** public types reworked so configurations need no casts. The package now exports `FormConfiguration`, `FormHooks`, `UpdateRule`, `InitialisationRule`, `FieldConfiguration`, `FieldIoHooks`, `FieldFetchConfiguration`, `FieldHooks`, `SelectConfiguration`, `CheckboxConfiguration`, `UpdateData` and the `DynamicForm` type
    - `FormConfiguration` requires only `id`, and `behavior` accepts any subset of the Form Hooks
    - `FieldConfiguration` has the `select` and `checkbox` keys; the former `SelectConfiguration`/`CheckboxConfiguration` interfaces extending it are gone, and the names now belong to the former `SelectSelectConfiguration`/`CheckboxCheckboxConfiguration`
    - Renamed `FormBehavior` to `FormHooks`, `FieldBehaviorConfiguration` to `FieldHooks`, `FieldIoConfiguration` to `FieldIoHooks`
    - The `data` received by Field Hooks, `makeUrl`, `makeBody` and `externalData` is `UpdateData` (`Record<string, any>`) instead of `object`, so `data.country` needs no annotation
    - Form Hooks and `externalData` receive a `string` Subject name, never `null`
    - Field Hooks receive `NodeListOf<FieldElement>` (`FieldElement` is `HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement`) instead of `HTMLElement | NodeList`, so `htmlElement[0].value` needs no narrowing or cast. `FieldConfiguration<E, V>` states the element and value types of a field (`FieldConfiguration<HTMLSelectElement>`, `FieldConfiguration<HTMLInputElement, string[]>`); the value stays `any` by default
    - `select.postProcessData` receives the response as `any` and returns `SelectOption[]` (`{ value: string | number, text: string }`), which `select.saveData` receives
    - `InitialisationRule.value` is `unknown` instead of `any`
    - The `behavior.afterUpdate` Field Hook returns `void` instead of `boolean`: its result was never used
    - Exports `FieldElement` and `SelectOption` too
- **Breaking:** `fetch.fullFetchConfig` is a function of the Update Data, `(data) => RequestInit`, instead of a static object, as the documentation already described ([#31](https://github.com/simomosi/dynamic-forms/issues/31)). Wrap an existing object as `fullFetchConfig: () => ({ ... })`
- `makeForm()` no longer modifies the given configuration: defaults and discovered fields go into an internal copy. Form Hooks set to `undefined` fall back to the default instead of throwing
- **Breaking:** `makeForm()` throws when the Update Rules form a cycle, including a field listing itself in its own `update`, which used to be ignored ([#38](https://github.com/simomosi/dynamic-forms/issues/38)). A cycle used to clear the field the user had just changed
- **Breaking:** a custom `behavior.beforeUpdate` on a select no longer switches off `select.clearOnParentVoid`: with an empty Subject's value the select is cleared and its update stops before the hook is called ([#40](https://github.com/simomosi/dynamic-forms/issues/40)). Set `clearOnParentVoid: false` to handle an empty Subject's value in the hook
- **Breaking:** `makeForm()` throws when the configuration mentions a name which is not a field of the form: in an Update Rule (its `name`, `update` or `additionalData`) or in an Initialisation Rule. These used to fail at the first update with `Unknown element`, or be silently ignored ([#45](https://github.com/simomosi/dynamic-forms/issues/45)). The error lists every unknown name, and every missing `name`; a Field Configuration for a missing field joins the list instead of throwing `Element ... not found`
- **Breaking:** `makeForm()` throws when a Form for that id already exists, instead of leaving the previous one listening to the fields with its old configuration ([#47](https://github.com/simomosi/dynamic-forms/issues/47)). The new `form.destroy()` removes the Form's listeners, unregisters it from `getForm()` and aborts its remote calls; a pending `notify()`, `manualUpdate()` or `ready()` rejects with `Form "id" was destroyed`, as do later calls. Fields added after `makeForm()` are picked up by destroying the Form and creating it again
- The `behavior.updateStatus` Field Hook receives a 4th parameter, the `AbortSignal` aborted when the Form is destroyed. A `signal` returned by `fetch.fullFetchConfig` is combined with it
- **Breaking:** a failed remote call rejects `notify()` and `ready()` with a `RemoteCallError`, an `Error` exported by the package with the url and status in its message and the `Response` in `error.response`, instead of rejecting with the `Response` itself ([#49](https://github.com/simomosi/dynamic-forms/issues/49)). Read `error.response.status` instead of `error.status`
- New `select.loadOptions` Field Hook: it replaces only the remote call of a select, receiving the parameters of `updateStatus`, and its data goes through `postProcessData` and `saveData` as usual ([#50](https://github.com/simomosi/dynamic-forms/issues/50))
- **Breaking:** the package is `"type": "module"` and its files are renamed: `dist/dynamic-forms.js` (ES module), `dist/dynamic-forms.umd.cjs` (UMD for `require`) and `dist/dynamic-forms.umd.js` (the same UMD for `<script>` tags and CDNs). `exports` gives each of `import` and `require` its own types, so the types resolve with every TypeScript `moduleResolution` (before, only with the deprecated `node`), and exports `./package.json` and `./dist/*`. The `browser` field is removed; `unpkg` and `jsdelivr` keep the bare CDN URL serving the UMD build. `publint` and `@arethetypeswrong/cli` check the package in CI, and `npm run test:package` tests the packed package with `import` and `require` in Node, as a `<script>` tag in jsdom and bundled by Vite ([#52](https://github.com/simomosi/dynamic-forms/issues/52))
- The package is built with [tsdown](https://tsdown.dev) instead of Vite ([#54](https://github.com/simomosi/dynamic-forms/issues/54)):
    - The sourcemaps map to the right lines of the TypeScript source (they were 6 lines off), and the new declaration maps make "Go to definition" open the TypeScript source in `src`
    - The types no longer declare a `DynamicForm` value: `DynamicForm` is a type-only export, as it always was at runtime, so `x instanceof DynamicForm` is a compile error instead of a runtime one
    - Bundlers tree-shake the ES module build: importing only `RemoteCallError` no longer bundles the whole library. The ES module build isn't minified any more (consumers' bundlers minify it); the UMD builds still are
    - **Breaking:** supported browsers are stated: Chrome and Edge 111+, Firefox 114+, Safari 16.4+, which is also the build target (the README said "works on all browsers"). A `signal` returned by `fetch.fullFetchConfig` works where the browser lacks `AbortSignal.any`
    - `size-limit` checks the bundle sizes and tree-shaking in CI
- Third-party widgets (select2, Choices.js, Tom Select, bootstrap-select, flatpickr, form-associated custom elements) can be integrated through Field Hooks ([#57](https://github.com/simomosi/dynamic-forms/issues/57)), with a new [Third-party widgets](../configurations/third-party-widgets.md) page and tested recipes:
    - New `io.listen(htmlElement, onChange, standard)` Field Hook: it subscribes to the field's changes and returns the function which unsubscribes, called by `form.destroy()`. It hears widgets that announce changes only through jQuery events or callbacks, which `io.event` never could
    - Every Field Hook which replaces a Standard Behaviour receives it as its last parameter, `standard`: `io.listen`, `io.get`, `io.set`, `behavior.clear`, `behavior.updateStatus`, `select.loadOptions`, `select.postProcessData` and `select.saveData`. Call it to add to the Standard Behaviour instead of rewriting it
    - **Breaking:** while the library writes to a field (`io.set`, `behavior.clear`, `select.saveData`), it ignores the changes that field fires: a hook or widget firing `change` when written no longer starts a second, duplicate update of the field's Observers
    - `FieldConfiguration<E>` accepts any `HTMLElement`, so a custom element's type can be stated
- A newer Update of a field replaces a pending one ([#60](https://github.com/simomosi/dynamic-forms/issues/60)): a stale remote response no longer overwrites the options of a later change (e.g. Italian cities after choosing France), nor refills a select emptied meanwhile by `clearOnParentVoid` or a Cascade Clear. The replaced Update's remote call is aborted and its data discarded (no `postProcessData`, `saveData` or `afterUpdate`); a `notify()`, `manualUpdate()` or `ready()` waiting on it settles with the newest Update of that field. The `signal` of `updateStatus` and `loadOptions` is also aborted when a newer Update replaces theirs
- **Breaking:** the Initialisation comes first ([#64](https://github.com/simomosi/dynamic-forms/issues/64)): until `ready()` settles, the fields' changes are ignored and `notify()` and `manualUpdate()` reject with `Form "id" is initialising: await ready() first`, also for a form without Initialisation Rules. A change made during the Initialisation used to leave the form inconsistent (the user's value overwritten by the initial one, its Observers loaded for the user's). Call `notify()` after `await form.ready()` (or in `.then`)
- The loading docs cover every way to load the library: a bundler (`import` or `require`), a `<script>` tag from a CDN (with the `DynamicForms` global, and with Subresource Integrity), ES modules from esm.sh, an import map without a bundler, and self-hosting. CDN snippets use `@4` instead of `@latest`, and the snippets that didn't work are fixed
- Initialisation no longer clears the initial value of a field reached by the Cascade Clear of another initialised field ([#37](https://github.com/simomosi/dynamic-forms/issues/37))
- An update clears the Observers' Observers before updating the Observers, so the result no longer depends on the order of the names in `update`
- `form.notify()` and `form.ready()` reject when clearing the Observers' Observers fails (e.g. a `behavior.clear` Field Hook throws), instead of leaving an unhandled rejection
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