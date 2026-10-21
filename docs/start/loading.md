# Loading the library
Choose the way that fits your project. Load the library **once** per page: two copies would each keep their own forms, and `getForm` of one copy doesn't see the forms of the other.

## With a bundler

Vite, webpack, Rollup, esbuild and the other bundlers resolve the package installed with a [package manager](./installation.md).

=== "ES module (recommended)"
    ```javascript
    import { makeForm } from '@simomosi/dynamic-forms';
    ```

=== "CommonJS"
    ```javascript
    const { makeForm } = require('@simomosi/dynamic-forms');
    ```

`import` loads the ES module build and `require` the UMD build: use one of the two in the whole app, since mixing them loads the library twice.

## From a CDN

`@4` follows the 4.x releases without jumping to a future major version, which could break your configuration. To freeze a release, write the exact version (e.g. `@4.0.0`). Avoid `@latest`.

### Script tag

The script defines the global variable `DynamicForms`.

```html
<script src="https://cdn.jsdelivr.net/npm/@simomosi/dynamic-forms@4"></script>
<script>
    const { makeForm } = DynamicForms;
</script>
```

`https://unpkg.com/@simomosi/dynamic-forms@4` serves the same file.

### Script tag with Subresource Integrity

With [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) the browser runs the script only if it is exactly the published file. It needs an exact version and the full file path:

```html
<script
    src="https://cdn.jsdelivr.net/npm/@simomosi/dynamic-forms@4.0.0/dist/dynamic-forms.umd.js"
    integrity="sha384-REPLACED_AT_THE_4.0.0_RELEASE"
    crossorigin="anonymous"></script>
```

For another version, take the hash from the version's page on [jsDelivr](https://www.jsdelivr.com/package/npm/@simomosi/dynamic-forms), or compute it:

```shell
curl -s https://cdn.jsdelivr.net/npm/@simomosi/dynamic-forms@4.0.0/dist/dynamic-forms.umd.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### ES module

```html
<script type="module">
    import { makeForm } from 'https://esm.sh/@simomosi/dynamic-forms@4';
</script>
```

esm.sh also sends the TypeScript types (useful with Deno). `https://cdn.jsdelivr.net/npm/@simomosi/dynamic-forms@4/+esm` works too.

## Without a bundler: import map

In a plain html page, `import ... from '@simomosi/dynamic-forms'` works only with an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap), which tells the browser where the package is. Without it (or a bundler, or a dev server like Vite's) the browser throws a `TypeError`.

```html
<script type="importmap">
{ "imports": { "@simomosi/dynamic-forms": "https://esm.sh/@simomosi/dynamic-forms@4" } }
</script>
<script type="module">
    import { makeForm } from '@simomosi/dynamic-forms';
</script>
```

## Self-hosting

To serve the library from your own site, copy one of these files from the npm package (`node_modules/@simomosi/dynamic-forms/dist/`):

- `dynamic-forms.js`: the ES module, for `<script type="module">` and import maps;
- `dynamic-forms.umd.js`: the UMD build, for a `<script>` tag (defines `DynamicForms`).

```html
<script src="/js/dynamic-forms.umd.js"></script>
<!-- or -->
<script type="importmap">
{ "imports": { "@simomosi/dynamic-forms": "/js/dynamic-forms.js" } }
</script>
```

Build scripts and copy plugins can find the files with `require.resolve('@simomosi/dynamic-forms/dist/dynamic-forms.umd.js')` or `import.meta.resolve('@simomosi/dynamic-forms/dist/dynamic-forms.js')`.
