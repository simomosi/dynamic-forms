import { describe, expect, it, vi } from 'vitest';
import { RemoteCallError } from '@/index';
import type { FieldElement, SelectOption } from '@/index';
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

        const set = vi.fn();
        mountForm('f', '<input name="a">');
        await createForm({ id: 'f', fields: [{ name: 'a', io: { set } }], init: [{ name: 'a', value: 'v' }] }).ready();
        expect(set).toHaveBeenCalledWith(expect.any(NodeList), 'v', expect.any(Function));

        const clear = vi.fn();
        await clearViaCascade('a', '<input name="a" value="hello">', { behavior: { clear } });
        expect(clear).toHaveBeenCalled();
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
});

describe('select', () => {
    it('sends the selected value', async () => {
        expect(await valueSentBy('s', selectHtml('s', { '1': 'One' }).replace('value="1"', 'value="1" selected'))).toBe('1');
    });

    it('keeps only the empty options on cascade clear', async () => {
        await clearViaCascade('s', selectHtml('s', { '1': 'One', '2': 'Two' }), { fetch: { makeUrl: () => '/s' } });

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

    it('saves numeric option values, and 0 is not the empty option', async () => {
        stubFetch({ '/s': [{ value: 0, text: 'Zero' }, { value: 1, text: 'One' }] });
        mountForm('f', '<input name="parent" value="x"><select name="s"></select>');
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '0', '1']);
    });

    it('loads the options with select.loadOptions instead of the remote call, then post-processes and saves them (#50)', async () => {
        const fetchMock = stubFetch({});
        const loadOptions = vi.fn(async () => [{ id: 3, name: 'Three' }]);
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s', { '1': 'One' }));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', select: { loadOptions, postProcessData: (_el, items) => items.map((i: any) => ({ value: i.id, text: i.name })) } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '3']);
        expect(loadOptions).toHaveBeenCalledWith(expect.any(NodeList), { parent: 'x' }, 'parent', expect.any(AbortSignal), expect.any(Function));
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('saves the options returned by select.loadOptions as they are, without postProcessData (#50)', async () => {
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', select: { loadOptions: () => [{ value: '7', text: 'Seven' }] } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '7']);
    });

    it('rejects notify() with a RemoteCallError when the remote call fails (#49)', async () => {
        stubFetch({});
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        const error = await form.notify('parent').catch(e => e);

        expect(error).toBeInstanceOf(RemoteCallError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Remote call to "/s" failed with status 404');
        expect(error.response.status).toBe(404);
    });

    it('logs the remote call error when the change comes from the user', async () => {
        stubFetch({});
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        field('parent').dispatchEvent(new Event('change'));

        await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());
    });
});

describe('field hooks', () => {
    /** Calls every hook of field `name`, mounted from `html`, and returns the element argument of each call. */
    async function hookElements(name: string, html: string) {
        const received: Record<string, unknown> = {};
        const record = (hook: string) => (el: unknown) => { received[hook] = el; return true; };
        const config = {
            io: { get: record('get'), set: record('set') },
            behavior: {
                clear: record('clear'),
                beforeUpdate: record('beforeUpdate'),
                updateStatus: record('updateStatus'),
                afterUpdate: record('afterUpdate'),
            },
        };
        await valueSentBy(name, html, config);
        mountForm('f', '<input name="parent">' + html);
        const form = createForm({ id: 'f', fields: [{ name, ...config }], rules: [{ name: 'parent', update: [name] }], init: [{ name, value: 'v' }] });
        await form.ready();
        await form.notify('parent');
        await clearViaCascade(name, html, config);
        return received;
    }

    it.each([
        ['text input', '<input name="x">'],
        ['textarea', '<textarea name="x"></textarea>'],
        ['select', selectHtml('x', { '1': 'One' })],
        ['checkbox', '<input type="checkbox" name="x">'],
        ['radio', '<input type="radio" name="x" value="a">'],
        ['radio group', '<input type="radio" name="x" value="a"><input type="radio" name="x" value="b">'],
    ])('receive the NodeList of every %s element with the field name', async (_kind, html) => {
        const received = await hookElements('x', html);

        const hooks = ['get', 'set', 'clear', 'beforeUpdate', 'updateStatus', 'afterUpdate'];
        expect(Object.keys(received).sort()).toEqual([...hooks].sort());
        for (const hook of hooks) {
            const el = received[hook];
            expect(el, hook).toBeInstanceOf(NodeList);
            expect(Array.from(el as NodeList), hook).toEqual(Array.from(document.getElementsByName('x')));
        }
    });

    it('give select postProcessData and saveData the NodeList', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        const postProcessData = vi.fn((_els, data) => data);
        const saveData = vi.fn();
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, select: { postProcessData, saveData } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(postProcessData).toHaveBeenCalledWith(expect.any(NodeList), [{ value: '1', text: 'One' }], expect.any(Function));
        expect(saveData).toHaveBeenCalledWith(expect.any(NodeList), [{ value: '1', text: 'One' }], expect.any(Function));
    });
});

describe('the Standard Behaviour a Field Hook replaces', () => {
    it('is given to io.get, which reads through it', async () => {
        const get = (_el: unknown, standard: () => string) => standard().toUpperCase();

        expect(await valueSentBy('a', '<input name="a" value="hello">', { io: { get } })).toBe('HELLO');
    });

    it('is given to io.set, which writes through it and adds to it', async () => {
        mountForm('f', '<input name="a">');
        await createForm({
            id: 'f',
            fields: [{ name: 'a', io: { set: (el, _value, standard) => { standard(); el[0].dataset.written = 'yes'; } } }],
            init: [{ name: 'a', value: 'hello' }],
        }).ready();

        expect(field('a').value).toBe('hello');
        expect(field('a').dataset.written).toBe('yes');
    });

    it('is given to behavior.clear, the one of the field kind', async () => {
        await clearViaCascade('s', selectHtml('s', { '1': 'One' }), { fetch: { makeUrl: () => '/s' }, behavior: { clear: (el: NodeListOf<HTMLSelectElement>, standard: () => void) => { standard(); el[0].dataset.cleared = 'yes'; } } });

        expect(optionValues('s')).toEqual(['']);
        expect(field('s').dataset.cleared).toBe('yes');
    });

    it('is given to behavior.updateStatus, the remote call and Options saving of a select', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, behavior: { updateStatus: async (el, _data, _subject, _signal, standard) => { await standard(); el[0].dataset.updated = 'yes'; } } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '1']);
        expect(field('s').dataset.updated).toBe('yes');
    });
    it('is given to select.loadOptions: the remote call', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, select: { loadOptions: async (_el, _data, _subject, _signal, standard) => [...await standard(), { value: '2', text: 'Two' }] } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '1', '2']);
    });

    it('is given to select.postProcessData: the Options as they are', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }, { value: '2', text: 'Two' }] });
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, select: { postProcessData: (_el, _data, standard) => standard().filter((option: SelectOption) => option.value !== '1') } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '2']);
    });

    it('is given to select.saveData, which saves through it and adds to it', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s', { '9': 'Old' }));
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, select: { saveData: (el, _data, standard) => { standard(); el[0].dataset.saved = 'yes'; } } }],
            rules: [{ name: 'parent', update: ['s'] }],
        });

        await form.notify('parent');

        expect(optionValues('s')).toEqual(['', '1']);
        expect(field('s').dataset.saved).toBe('yes');
    });
});

describe('the events of a field while the library writes it', () => {
    /** Writes through the Standard Behaviour, then fires `change` on the field like Widgets do when written by code */
    const writeAndFireChange = (el: NodeListOf<FieldElement>, standard: () => void) => { standard(); el[0].dispatchEvent(new Event('change')); };
    const settle = () => new Promise(resolve => setTimeout(resolve));

    it('start no Update when io.set writes the init value, but still reach the application', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a">' + probe.html);
        const heardByApplication = vi.fn();
        field('a').addEventListener('change', heardByApplication);
        await createForm({
            id: 'f',
            fields: [{ name: 'a', io: { set: (el, _value, standard) => writeAndFireChange(el, standard) } }, probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
            init: [{ name: 'a', value: 'v' }],
        }).ready();
        await settle();

        expect(probe.updates).toHaveLength(1); // by the Initialisation only
        expect(heardByApplication).toHaveBeenCalledTimes(1);
    });

    it('start no Update when behavior.clear clears the field in a Cascade Clear', async () => {
        const middle = probeField('middle');
        const probe = probeField();
        mountForm('f', '<input name="parent">' + middle.html + '<input name="a" value="x">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [middle.config, { name: 'a', behavior: { clear: (el, standard) => writeAndFireChange(el, standard) } }, probe.config],
            rules: [{ name: 'parent', update: ['middle'] }, { name: 'middle', update: ['a'] }, { name: 'a', update: ['probe'] }],
        });

        await form.notify('parent');
        await settle();

        expect(field('a').value).toBe('');
        expect(probe.updates).toHaveLength(0); // cleared by the Cascade Clear, never updated
    });

    it('start no Update when select.saveData saves the loaded Options', async () => {
        stubFetch({ '/s': [{ value: '1', text: 'One' }] });
        const probe = probeField();
        mountForm('f', '<input name="parent" value="x">' + selectHtml('s') + probe.html);
        const form = createForm({
            id: 'f',
            fields: [{ name: 's', fetch: { makeUrl: () => '/s' }, select: { saveData: (el, _data, standard) => writeAndFireChange(el, standard) } }, probe.config],
            rules: [{ name: 'parent', update: ['s'] }, { name: 's', update: ['probe'] }],
        });

        await form.notify('parent');
        await settle();

        expect(optionValues('s')).toEqual(['', '1']);
        expect(probe.updates).toHaveLength(0);
    });

    it('still start an Update when the user changes the field afterwards', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a">' + probe.html);
        await createForm({
            id: 'f',
            fields: [{ name: 'a', io: { set: (el, _value, standard) => writeAndFireChange(el, standard) } }, probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
            init: [{ name: 'a', value: 'v' }],
        }).ready();

        field('a').dispatchEvent(new Event('change'));
        await vi.waitFor(() => expect(probe.updates).toHaveLength(2));
    });
});

/** A third-party Widget announcing its changes through its own subscription api, not through DOM events */
function fakeWidget() {
    let subscriber: (() => void) | null = null;
    return {
        subscribe(onChange: () => void) {
            subscriber = onChange;
            return () => { subscriber = null; };
        },
        change() { subscriber?.(); },
        get listened() { return subscriber !== null; },
    };
}

describe('io.listen', () => {
    it('listens to a Widget instead of the field event, and stops listening when the form is destroyed', async () => {
        const widget = fakeWidget();
        const probe = probeField();
        mountForm('f', '<input name="a" value="x">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [{ name: 'a', io: { listen: (_el, onChange) => widget.subscribe(onChange) } }, probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
        });

        widget.change();
        await vi.waitFor(() => expect(probe.updates).toHaveLength(1));
        expect(probe.updates[0].data).toEqual({ a: 'x' });
        field('a').dispatchEvent(new Event('change'));
        await new Promise(resolve => setTimeout(resolve));
        expect(probe.updates).toHaveLength(1);

        form.destroy();
        expect(widget.listened).toBe(false);
    });

    it('receives the Standard Behaviour, which listens to io.event until the form is destroyed', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [{ name: 'a', io: { event: 'input', listen: (_el, _onChange, standard) => standard() } }, probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
        });

        field('a').dispatchEvent(new Event('input'));
        await vi.waitFor(() => expect(probe.updates).toHaveLength(1));
        form.destroy();
        field('a').dispatchEvent(new Event('input'));
        await new Promise(resolve => setTimeout(resolve));

        expect(probe.updates).toHaveLength(1);
    });
});

describe('initialisation errors', () => {
    it('rejects ready() when beforeInit throws', async () => {
        mountForm('f', '<input name="a">');
        const form = createForm({
            id: 'f',
            behavior: { beforeInit: () => { throw new Error('beforeInit failed'); } },
        });

        await expect(Promise.race([form.ready(), timeout(50)])).rejects.toThrow('beforeInit failed');
    });
});
