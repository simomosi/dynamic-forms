# Loading the library
Choose your favorite import method

## From installed sources

=== "ES6 Module"
    ```html
    <script type="module">
        import 'your-assets-path/@simomosi/dynamic-forms/dist/dynamicforms.min.js';
    </script>
    ```

=== "Commonjs require"
    ```javascript
    const dynamicForms = require('@simomosi/dynamic-forms');
    ```

=== "Script tag"
    ```html
    <script src='your-assets-path/@simomosi/dynamic-forms/dist/dynamicforms.min.js'></script>
    ```

Note that 2 different sources exist:

- `@simomosi/dynamic-forms/dist` (recommended) is transpiled with *Webpack* and *Babel* to enhance performance and ensure compatibility with different browsers
- `@simomosi/dynamic-forms/src` is the actual source

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
