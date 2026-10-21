import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import banner from 'vite-plugin-banner';

const packagejson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));
const bannerInfo = `
Author: ${packagejson.author}
Version: ${packagejson.version}
Repository: ${packagejson.repository.url}
Documentation: ${packagejson.homepage}
`;

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DynamicForms',
      formats: ['es', 'umd'],
      // The package is "type": "module": the ES build is .js, the UMD build for require is .cjs
      fileName: (format: string) => format === 'es' ? 'dynamic-forms.js' : 'dynamic-forms.umd.cjs'
    },
    sourcemap: true,
    outDir: 'dist',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        preserveModules: false,
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dist': path.resolve(__dirname, './dist')
    },
    extensions: ['.ts', '.js', '.json']
  },
  esbuild: {
    keepNames: true
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  plugins: [
    // Generate TypeScript declaration files
  dts({
    include: ['src/**/*.ts'],
    rollupTypes: true,
    // The same declarations for the UMD build: a .d.cts so that TypeScript reads them as CommonJS
    afterBuild: () => fs.copyFileSync(path.resolve(__dirname, 'dist/index.d.ts'), path.resolve(__dirname, 'dist/index.d.cts')),
  }),
  // Bundle size visualization
  visualizer({
    open: false,
    gzipSize: true,
  }),
  
  banner(bannerInfo),

  // The same UMD build as .js for browsers: CDNs and web servers may serve .cjs with a non-JavaScript
  // Content-Type (jsDelivr: application/node with nosniff), which browsers refuse in a <script> tag
  {
    name: 'umd-for-browsers',
    writeBundle(options, bundle) {
      if ('dynamic-forms.umd.cjs' in bundle) {
        fs.copyFileSync(path.resolve(options.dir!, 'dynamic-forms.umd.cjs'), path.resolve(options.dir!, 'dynamic-forms.umd.js'));
      }
    },
  },
  ]
});