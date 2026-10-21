import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { describe, expect, inject, it } from 'vitest';

describe('the package in a bundler', () => {
    it('bundles the ES module build into an app built with Vite', async () => {
        const projectDir = inject('projectDir');
        const entry = path.join(projectDir, 'app.js');
        writeFileSync(entry, `
            import { makeForm, getForm } from '@simomosi/dynamic-forms';
            export const exported = [typeof makeForm, typeof getForm];
        `);
        const outDir = path.join(projectDir, 'bundle');
        const loadedFiles: string[] = [];

        await build({
            root: projectDir,
            configFile: false,
            logLevel: 'silent',
            build: { outDir, emptyOutDir: true, minify: false, lib: { entry, formats: ['es'], fileName: () => 'app.js' } },
            plugins: [{ name: 'record-loaded-files', load(id) { loadedFiles.push(id); return null; } }],
        });

        // The ES module build, not the UMD one, which bundlers can't tree-shake
        const packageFiles = loadedFiles.filter(id => id.includes('node_modules/@simomosi/dynamic-forms/'));
        expect(packageFiles.map(id => id.replace(/^.*node_modules\/@simomosi\/dynamic-forms\//, ''))).toEqual(['dist/dynamic-forms.js']);
        const app = await import(pathToFileURL(path.join(outDir, 'app.js')).href);
        expect(app.exported).toEqual(['function', 'function']);
    });
});
