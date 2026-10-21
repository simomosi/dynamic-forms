import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SourceMapConsumer } from 'source-map-js';
import { describe, expect, inject, it } from 'vitest';

const jsFiles = ['dist/dynamic-forms.js', 'dist/dynamic-forms.umd.cjs', 'dist/dynamic-forms.umd.js'];

/** Reads a file of the installed package */
const readPackageFile = (file: string) => readFileSync(path.join(inject('projectDir'), 'node_modules/@simomosi/dynamic-forms', file), 'utf8');

describe('the built files of the package', () => {
    it.each(jsFiles)('%s maps the code of makeForm back to its TypeScript source', (file) => {
        const code = readPackageFile(file);
        const mapFile = code.match(/\/\/# sourceMappingURL=(\S+)\s*$/)![1];
        const map = new SourceMapConsumer(JSON.parse(readPackageFile(path.join(path.dirname(file), mapFile))));
        const source = map.sources.find(s => s.endsWith('src/index.ts'))!;
        const sourceLines = map.sourceContentFor(source)!.split('\n');
        const line = sourceLines.findIndex(text => text.includes('document.forms.namedItem')) + 1;
        const column = sourceLines[line - 1].indexOf('document.forms');

        const generated = map.generatedPositionFor({ source, line, column, bias: SourceMapConsumer.LEAST_UPPER_BOUND });

        expect(code.split('\n')[generated.line - 1].slice(generated.column)).toMatch(/^document\.forms\.namedItem/);
    });

    it.each(jsFiles)('%s starts with the banner of the package version', (file) => {
        const { version } = JSON.parse(readPackageFile('package.json'));

        expect(readPackageFile(file)).toMatch(new RegExp(`^/\\*!\\s*Author: .*\\nVersion: ${version.replaceAll('.', '\\.')}\\n`));
    });

    it.each(['dist/index.d.ts', 'dist/index.d.cts'])('%s has no banner', (file) => {
        expect(readPackageFile(file)).not.toContain('/*!');
    });
});
