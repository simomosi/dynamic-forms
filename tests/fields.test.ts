import { describe, expect, it, vi } from 'vitest';
import { createForm, field, mountForm, optionValues, probeField, selectHtml, stubFetch, timeout } from './helpers';

/**
 * Field values are observed the way users see them:
 * - get(): through the data a subject sends to a probe observer
 * - set(): through init rules
 * - clear(): through the cascade clear triggered by a parent field
 */

/** Value sent by `name` to its observers on change. */
async function valueSentBy(name: string, html: string, fieldConfig: object = {}) {
    const probe = probeField();
    mountForm('f', html + probe.html);
    const form = createForm({
        id: 'f',
        fields: [{ name, ...fieldConfig }, probe.config],
        rules: [{ name, update: ['probe'] }],
    });
    await form.notify(name);
    return probe.updates[0].data[name];
}

/** Mounts `html` below `parent -> middle -> name` and changes `parent`: the cascade clears `name`, the observer of the updated `middle`. */
async function clearViaCascade(name: string, html: string, fieldConfig: object = {}) {
    const middle = probeField('middle');
    mountForm('f', '<input name="parent">' + middle.html + html);
    const form = createForm({
        id: 'f',
        fields: [{ name, ...fieldConfig }, middle.config],
        rules: [{ name: 'parent', update: ['middle'] }, { name: 'middle', update: [name] }],
    });
    await form.notify('parent');
}

describe('generic input', () => {
    it('sends its value', async () => {
        expect(await valueSentBy('a', '<input name="a" value="hello">')).toBe('hello');
    });

    it('is set from the init value', async () => {
        mountForm('f', '<input name="a">');
        await createForm({ id: 'f', init: [{ name: 'a', value: 'hello' }] }).ready();

        expect(field('a').value).toBe('hello');
    });

    it('is emptied on cascade clear', async () => {
        await clearViaCascade('a', '<input name="a" value="hello">');

        expect(field('a').value).toBe('');
    });

    it('uses the custom io.get, io.set and behavior.clear', async () => {
        const get = vi.fn(() => 'custom');
        expect(await valueSentBy('a', '<input name="a">', { io: { get } })).toBe('custom');
        expect(get).toHaveBeenCalledWith(field('a'));

        const set = vi.fn();
        mountForm('f', '<input name="a">');
        await createForm({ id: 'f', fields: [{ name: 'a', io: { set } }], init: [{ name: 'a', value: 'v' }] }).ready();
        expect(set).toHaveBeenCalledWith(field('a'), 'v');

        const clear = vi.fn();
        await clearViaCascade('a', '<input name="a" value="hello">', { behavior: { clear } });
        expect(clear).toHaveBeenCalledWith(field('a'));
        expect(field('a').value).toBe('hello');
    });
});

describe('checkbox', () => {
    it('sends its checked state by default', async () => {
        expect(await valueSentBy('c', '<input type="checkbox" name="c" value="yes" checked>')).toBe(true);
        expect(await valueSentBy('c', '<input type="checkbox" name="c" value="yes">')).toBe(false);
    });

    it('sends its value when checkbox.booleanValue is false', async () => {
        const value = await valueSentBy('c', '<input type="checkbox" name="c" value="yes">', { checkbox: { booleanValue: false } });

        expect(value).toBe('yes');
    });

    it.each([
        [true, true],
        ['true', true],
        ['false', false],
        ['', false],
    ])('is checked=%s from the init value %j', async (value, checked) => {
        mountForm('f', '<input type="checkbox" name="c">');
        await createForm({ id: 'f', init: [{ name: 'c', value }] }).ready();

        expect(field('c').checked).toBe(checked);
    });

    it('is unchecked on cascade clear', async () => {
        await clearViaCascade('c', '<input type="checkbox" name="c">');

        expect(field('c').checked).toBe(false);
    });
});

describe('radio group', () => {
    const radios = '<input type="radio" name="r" value="a"><input type="radio" name="r" value="b">';

    it('sends the checked value, or null when none is checked', async () => {
        expect(await valueSentBy('r', radios)).toBeNull();
        expect(await valueSentBy('r', radios.replace('value="b"', 'value="b" checked'))).toBe('b');
    });

    it('checks the radio matching the init value', async () => {
        mountForm('f', radios);
        await createForm({ id: 'f', init: [{ name: 'r', value: 'b' }] }).ready();

        expect(document.querySelector<HTMLInputElement>('[value=b]')!.checked).toBe(true);
        expect(document.querySelector<HTMLInputElement>('[value=a]')!.checked).toBe(false);
    });

    it('unchecks every radio on cascade clear', async () => {
        await clearViaCascade('r', radios.replace('value="a"', 'value="a" checked'));

        expect(document.querySelectorAll('[name=r]:checked')).toHaveLength(0);
    });

    it('passes the whole NodeList to the custom io.get', async () => {
        const get = vi.fn(() => 'custom');

        expect(await valueSentBy('r', radios, { io: { get } })).toBe('custom');
        expect(get).toHaveBeenCalledWith(expect.any(NodeList));
    });
});

describe('select', () => {
    it('sends the selected value', async () => {
        expect(await valueSentBy('s', selectHtml('s', { '1': 'One' }).replace('value="1"', 'value="1" selected'))).toBe('1');
    });

    it('keeps only the empty options on cascade clear', async () => {
        await clearViaCascade('s', selectHtml('s', { '1': 'One', '2': 'Two' }));

        expect(optionValues('s')).toEqual(['']);
    });

    it('replaces the previous options with the fetched ones', async () => {
        stubFetch({ '/s': [{ value: '3', text: 'Three' }] });
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s', { '1': 'One' }));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '3']);
    });

    it('adds an empty option when neither the html nor the fetched data have one', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        mountForm('f', '<input name="parent" value="x"><select name="s"></select>');
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '1']);
    });

    it('does not add a second empty option when the fetched data has one', async () => {
        stubFetch({ '/s': [{ value: '', text: 'Pick one' }, { value: '1', text: 'One' }] });
        mountForm('f', '<input name="parent" value="x"><select name="s"></select>');
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '1']);
    });

    // Bug: updateStatus catches the remote call errors and only logs them, so callers can't react.
    // https://github.com/simomosi/dynamic-forms/issues/27
    it.fails('rejects notify() when the remote call fails', async () => {
        stubFetch({});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await expect(form.notify('parent')).rejects.toBeDefined();
    });
});

describe('initialisation errors', () => {
    it('rejects ready() when beforeInit throws', async () => {
        mountForm('f', '<input name="a">');
        const form = createForm({
            id: 'f',
            behavior: { beforeInit: () => { throw new Error('beforeInit failed'); } } as any,
        });

        await expect(Promise.race([form.ready(), timeout(50)])).rejects.toThrow('beforeInit failed');
    });
});
