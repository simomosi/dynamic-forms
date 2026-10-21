import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SourceMapConsumer } from 'source-map-js';
import ts from 'typescript';
import { describe, expect, inject, it } from 'vitest';

/** Compiler options of a consumer project on Node's module resolution, which picks index.d.ts for import and index.d.cts for require */
const consumerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    strict: true,
    noEmit: true,
};

/** Writes `code` in the project where the package is installed, as a TypeScript file with the given extension */
function writeConsumer(code: string, extension: 'mts' | 'cts'): string {
    const file = path.join(inject('projectDir'), `consumer.${extension}`);
    writeFileSync(file, code);
    return file;
}

/** Names of the values that the package's declarations say a namespace import has, as an `.mts` (import) or `.cts` (require) file sees them */
function declaredValueExports(extension: 'mts' | 'cts'): string[] {
    const file = writeConsumer(`import * as lib from '@simomosi/dynamic-forms';\nexport const library = lib;\n`, extension);
    const program = ts.createProgram([file], consumerOptions);
    expect(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);
    const checker = program.getTypeChecker();
    const library = program.getSourceFile(file)!.statements[1] as ts.VariableStatement;
    const type = checker.getTypeAtLocation(library.declarationList.declarations[0].name);
    return type.getProperties().map(property => property.name).sort();
}

/** Names of the values the package really exports, with `import` or `require` */
function runtimeExports(extension: 'mjs' | 'cjs'): string[] {
    const projectDir = inject('projectDir');
    const file = path.join(projectDir, `exports.${extension}`);
    writeFileSync(file, extension === 'mjs'
        ? `import * as lib from '@simomosi/dynamic-forms'; console.log(JSON.stringify(Object.keys(lib)));`
        : `console.log(JSON.stringify(Object.keys(require('@simomosi/dynamic-forms'))));`);
    const output = execFileSync('node', [file], { cwd: projectDir, encoding: 'utf8' });
    return JSON.parse(output.trim().split('\n').at(-1)!).sort(); // the last line, after the library banner
}

/**
 * Where an editor's "Go to definition" on the first `makeForm` call of `code` leads: the declaration the TypeScript
 * language service finds, followed through its declaration map when there is one, as the editor's TypeScript server does
 */
function goToDefinitionOfMakeForm(code: string, extension: 'mts' | 'cts'): string[] {
    const file = writeConsumer(code, extension);
    const host: ts.LanguageServiceHost = {
        getScriptFileNames: () => [file],
        getScriptVersion: () => '1',
        getScriptSnapshot: name => ts.sys.fileExists(name) ? ts.ScriptSnapshot.fromString(ts.sys.readFile(name)!) : undefined,
        getCurrentDirectory: () => inject('projectDir'),
        getCompilationSettings: () => consumerOptions,
        getDefaultLibFileName: ts.getDefaultLibFilePath,
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
    };
    const definitions = ts.createLanguageService(host).getDefinitionAtPosition(file, code.indexOf('makeForm('));
    return (definitions ?? []).map(definition => {
        const declarations = ts.sys.readFile(definition.fileName)!;
        const before = declarations.slice(0, definition.textSpan.start).split('\n');
        let fileName = definition.fileName;
        let line = before.length;
        const mapFile = declarations.match(/\/\/# sourceMappingURL=(\S+)\s*$/)?.[1];
        if (mapFile) {
            const mapPath = path.join(path.dirname(fileName), mapFile);
            const original = new SourceMapConsumer(JSON.parse(ts.sys.readFile(mapPath)!)).originalPositionFor({ line, column: before.at(-1)!.length });
            fileName = path.join(path.dirname(mapPath), original.source);
            line = original.line;
        }
        return `${fileName.replace(/^.*node_modules\/@simomosi\/dynamic-forms\//, '')}:${line}`;
    });
}

describe('the types of the package', () => {
    it.each(['mts', 'cts'] as const)('lead "Go to definition" from a .%s file to the TypeScript source', (extension) => {
        const definitions = goToDefinitionOfMakeForm(`import { makeForm } from '@simomosi/dynamic-forms';\nmakeForm({ id: 'f' });\n`, extension);

        expect(definitions).toEqual(['src/index.ts:19']);
    });

    it('declare for import exactly the values the ES module build exports', () => {
        expect(declaredValueExports('mts')).toEqual(runtimeExports('mjs'));
    });

    it('declare for require exactly the values the UMD build exports', () => {
        expect(declaredValueExports('cts')).toEqual(runtimeExports('cjs'));
    });
});
