import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
    export interface ProvidedContext {
        /** A project folder where the packed package is installed in node_modules, as `npm install` would */
        projectDir: string;
    }
}

/** Packs the built package with `npm pack`, the archive `npm publish` would upload, and installs it in a temporary project */
export default function setup(project: TestProject) {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'dynamic-forms-package-'));
    const [{ filename }] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', projectDir], { encoding: 'utf8' }));
    const packageDir = path.join(projectDir, 'node_modules', '@simomosi', 'dynamic-forms');
    mkdirSync(packageDir, { recursive: true });
    execFileSync('tar', ['-xzf', path.join(projectDir, filename), '-C', packageDir, '--strip-components=1']);
    project.provide('projectDir', projectDir);
    return () => rmSync(projectDir, { recursive: true, force: true });
}
