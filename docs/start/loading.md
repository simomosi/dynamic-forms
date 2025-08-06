# Loading the library
Choose your favorite import method

## From installed sources

=== "ES6 Module (recommended)"
    ```html
    <script type="module">
        import { makeForm } '@simomosi/dynamic-forms';
    </script>
    ```

=== "CommonJS"
    ```javascript
    const { makeForm } = require('@simomosi/dynamic-forms');
    ```

## From CDN

=== "Script tag"
    ```html
    <script src = 'https://unpkg.com/@simomosi/dynamic-forms@latest'></script>
    ```

=== "ES6 Module"
    ```html
    <script type="module">
        import { makeForm } from 'https://unpkg.com/@simomosi/dynamic-forms@latest';
    </script>
    ```

Be careful to not include the library twice!