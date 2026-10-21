import { defineConfig, type UserConfig } from 'tsdown';
import packagejson from './package.json' with { type: 'json' };

const banner = `/*!
Author: ${packagejson.author}
Version: ${packagejson.version}
Repository: ${packagejson.repository.url}
Documentation: ${packagejson.homepage}
 */`;

const common: UserConfig = {
  entry: { index: 'src/index.ts' },
  platform: 'browser',
  // The supported browsers: Baseline widely available at 4.0.0 (Chrome/Edge 111, Firefox 114, Safari 16.4)
  target: 'baseline-widely-available',
  sourcemap: true,
  tsconfig: 'tsconfig.build.json',
  // Only in the JS files: a plain string would also go in the declarations
  banner: { js: banner },
};

// tsdown writes declarations only for the es format and one file per format, so the package's files take four builds
export default defineConfig([
  // ES build for import and bundlers, not minified (consumers' bundlers minify), with its types index.d.ts
  {
    ...common,
    format: 'esm',
    dts: { sourcemap: true },
    // The entry stays "index" to name the declarations, the JS file is dynamic-forms.js
    outputOptions: { entryFileNames: (chunk) => chunk.name.endsWith('.d') ? '[name].ts' : 'dynamic-forms.js' },
  },
  // The same types as index.d.cts, which TypeScript reads as CommonJS, for require
  {
    ...common,
    format: 'esm',
    dts: { emitDtsOnly: true, sourcemap: true },
    outExtensions: () => ({ dts: '.d.cts' }),
  },
  // UMD build for require: the package is "type": "module", so .cjs
  {
    ...common,
    format: 'umd',
    globalName: 'DynamicForms',
    minify: true,
    dts: false,
    // Rolldown's UMD wrapper has no "use strict"
    outputOptions: { entryFileNames: 'dynamic-forms.umd.cjs', intro: '"use strict";' },
  },
  // The same UMD build as .js for <script> tags: CDNs and web servers may serve .cjs with a non-JavaScript
  // Content-Type (jsDelivr: application/node with nosniff), which browsers refuse
  {
    ...common,
    format: 'umd',
    globalName: 'DynamicForms',
    minify: true,
    dts: false,
    outputOptions: { entryFileNames: 'dynamic-forms.umd.js', intro: '"use strict";' },
  },
]);
