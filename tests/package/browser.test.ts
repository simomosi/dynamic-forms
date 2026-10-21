import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, inject, it } from 'vitest';

describe('the package in a page', () => {
    it('runs the UMD build from a <script> tag, defining the DynamicForms global', async () => {
        const umdFile = path.join(inject('projectDir'), 'node_modules/@simomosi/dynamic-forms/dist/dynamic-forms.umd.js');
        const dom = new JSDOM(`
            <form id="f"><input name="country"><input name="region"></form>
            <script>${readFileSync(umdFile, 'utf8')}</script>
            <script>
                window.form = DynamicForms.makeForm({
                    id: 'f',
                    rules: [{ name: 'country', update: ['region'] }],
                    init: [{ name: 'country', value: 'it' }],
                });
            </script>
        `, { runScripts: 'dangerously' });
        const window = dom.window as any;

        await window.form.ready();

        expect(Object.keys(window.DynamicForms).sort()).toEqual(['RemoteCallError', 'getForm', 'makeForm']);
        expect(window.DynamicForms.getForm('f')).toBe(window.form);
        expect(window.document.querySelector('[name=country]').value).toBe('it');
    });
});
