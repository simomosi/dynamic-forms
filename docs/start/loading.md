# Loading the library
Choose your favorite import method

## From installed sources

=== "ES6 Module"
    ```html
    <script type="module">
        import './node_modules/@simomosi/dynamic-forms/dist/dynamicforms.min.js';
    </script>
    ```

=== "Commonjs require"
    ```javascript
    const dynamicForms = require('@simomosi/dynamic-forms');
    ```

=== "Script tag"
    ```html
    <script src='./node_modules/@simomosi/dynamic-forms/dist/dynamicforms.min.js'></script>
    ```

Note that 2 different sources exist:

- `@simomosi/dynamic-forms/src` is the actual source code
- `@simomosi/dynamic-forms/dist` (recommended) is built bundle: sources are transpiled with *Webpack* and *Babel* to enhance performance and ensure compatibility with different browsers

## From CDN

=== "Script tag"
    ```html
    <script src = 'https://unpkg.com/@simomosi/dynamic-forms@latest'></script>
    ```

=== "ES6 Module"
    ```html
    <script type="module">
        import 'https://unpkg.com/@simomosi/dynamic-forms@latest';
    </script>
    ```

Be careful to not include the library twice!