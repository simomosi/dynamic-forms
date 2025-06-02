import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import banner from 'vite-plugin-banner';

const packagejson = require('./package.json');
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
      fileName: (format: string) => `dynamic-forms.${format}.js`
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
  }),
  // Bundle size visualization
  visualizer({
    open: false,
    gzipSize: true,
  }),
  
  banner(bannerInfo),
  ]
});