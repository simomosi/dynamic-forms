import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Every TypeScript snippet of the docs (```ts or ```typescript blocks, also indented in admonitions and tabs)
 * compiles under strict against the library's types, as a user's file importing '@simomosi/dynamic-forms' would.
 */

const docsDir = path.resolve(import.meta.dirname, '../docs');

/** Classes the snippets take from third-party libraries, declared here instead of installed */
const thirdPartyDeclarations = 'declare class SlSelect extends HTMLElement { value: string }';

const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    skipLibCheck: true,
    paths: { '@simomosi/dynamic-forms': [path.resolve(import.meta.dirname, '../src/index.ts')] },
};

function markdownFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : [];
    });
}

/** The TypeScript snippets of the docs, each as a module named after its page and position */
const snippets = markdownFiles(docsDir).flatMap(file => {
    const blocks = readFileSync(file, 'utf8').matchAll(/^( *)```(?:ts|typescript)\n([\s\S]*?)^\1```/gm);
    return Array.from(blocks, ([, indent, code], i) => ({
        name: `${path.relative(docsDir, file)} #${i + 1}`,
        file: path.join(docsDir, `${path.relative(docsDir, file).replaceAll('/', '_')}.snippet${i + 1}.ts`),
        code: `${thirdPartyDeclarations}\n${code.replace(new RegExp(`^${indent}`, 'gm'), '')}\nexport {};\n`,
    }));
});

/** Compiles the snippets in one program, each as its own module, and returns the errors of each one */
function compileSnippets(): Map<string, string[]> {
    const host = ts.createCompilerHost(options);
    const sources = new Map(snippets.map(snippet => [snippet.file, snippet.code]));
    const { getSourceFile, fileExists, readFile } = host;
    host.getSourceFile = (fileName, languageVersion, ...rest) => sources.has(fileName)
        ? ts.createSourceFile(fileName, sources.get(fileName)!, languageVersion)
        : getSourceFile(fileName, languageVersion, ...rest);
    host.fileExists = fileName => sources.has(fileName) || fileExists(fileName);
    host.readFile = fileName => sources.get(fileName) ?? readFile(fileName);
    const program = ts.createProgram([...sources.keys()], options, host);
    return new Map(snippets.map(snippet => [snippet.name, ts.getPreEmitDiagnostics(program, program.getSourceFile(snippet.file)).map(diagnostic => {
        const { line } = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start!);
        return `line ${line}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`; // the module starts with thirdPartyDeclarations, so this is the line in the snippet
    })]));
}

describe('the TypeScript snippets of the docs', () => {
    const errors = compileSnippets();

    it('exist', () => {
        expect(snippets.length).toBeGreaterThan(0);
    });

    it.each(snippets.map(snippet => snippet.name))('compile against the library types: %s', (name) => {
        expect(errors.get(name)).toEqual([]);
    });
});
