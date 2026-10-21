import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, inject, it } from 'vitest';

/**
 * Runs `code` with Node in the project where the package is installed, as a `.mjs` (ES module) or `.cjs` (CommonJS) file,
 * and returns what the code prints as JSON. Node resolves the package itself, through its package.json.
 */
function runNode(code: string, extension: 'mjs' | 'cjs'): any {
    const projectDir = inject('projectDir');
    const file = path.join(projectDir, `script.${extension}`);
    writeFileSync(file, code);
    const output = execFileSync('node', [file], { cwd: projectDir, encoding: 'utf8' });
    return JSON.parse(output.trim().split('\n').at(-1)!); // the last line, after the library banner
}

/** Path of a resolved file, relative to the installed package */
const inPackage = (resolved: string) => resolved.replace(/^.*node_modules\/@simomosi\/dynamic-forms\//, '');

describe('the package loaded by Node', () => {
    it('gives import the ES module build and its exports', () => {
        const result = runNode(`
            import { makeForm, getForm, RemoteCallError } from '@simomosi/dynamic-forms';
            console.log(JSON.stringify({
                exports: [typeof makeForm, typeof getForm, typeof RemoteCallError],
                file: import.meta.resolve('@simomosi/dynamic-forms'),
            }));
        `, 'mjs');

        expect(result.exports).toEqual(['function', 'function', 'function']);
        expect(inPackage(result.file)).toBe('dist/dynamic-forms.js');
    });

    it('gives require the UMD build and its exports', () => {
        const result = runNode(`
            const { makeForm, getForm, RemoteCallError } = require('@simomosi/dynamic-forms');
            console.log(JSON.stringify({
                exports: [typeof makeForm, typeof getForm, typeof RemoteCallError],
                file: require.resolve('@simomosi/dynamic-forms'),
            }));
        `, 'cjs');

        expect(result.exports).toEqual(['function', 'function', 'function']);
        expect(inPackage(result.file)).toBe('dist/dynamic-forms.umd.cjs');
    });

    it('exports package.json and the files in dist, to find them for self-hosting', () => {
        const result = runNode(`
            console.log(JSON.stringify({
                name: require('@simomosi/dynamic-forms/package.json').name,
                umd: require.resolve('@simomosi/dynamic-forms/dist/dynamic-forms.umd.js'),
                esm: require.resolve('@simomosi/dynamic-forms/dist/dynamic-forms.js'),
            }));
        `, 'cjs');

        expect(result.name).toBe('@simomosi/dynamic-forms');
        expect(inPackage(result.umd)).toBe('dist/dynamic-forms.umd.js');
        expect(inPackage(result.esm)).toBe('dist/dynamic-forms.js');
    });
});
