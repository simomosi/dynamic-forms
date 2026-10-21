import { describe, expect, it, vi } from 'vitest';
import { getForm, makeForm } from '@/index';
import { createForm, field, mountForm, optionValues, probeField, selectHtml, stubFetch } from './helpers';

const users = [{ value: '1', text: 'Ann' }, { value: '2', text: 'Bob' }];
const postsOfUser1 = [{ value: '10', text: 'Post A' }, { value: '11', text: 'Post B' }];
const commentsOfPost10 = [{ value: '100', text: 'Comment X' }];

/** user -> post -> comment, each select filled from the remote endpoint of its parent */
function mountProgressiveForm(id = 'progressive') {
    mountForm(id, selectHtml('user', { '1': 'Ann', '2': 'Bob' }) + selectHtml('post') + selectHtml('comment'));
    return createForm({
        id,
        fields: [
            { name: 'user', fetch: { makeUrl: () => '/users' } },
            { name: 'post', fetch: { makeUrl: (data) => `/posts?userId=${data.user}` } },
            { name: 'comment', fetch: { makeUrl: (data) => `/comments?postId=${data.post}` } },
        ],
        rules: [
            { name: 'user', update: ['post'] },
            { name: 'post', update: ['comment'] },
        ],
    });
}

describe('makeForm / getForm', () => {
    it('registers the created form so that getForm returns it', () => {
        mountForm('registered', '<input name="a">');
        const form = createForm({ id: 'registered' });

        expect(getForm('registered')).toBe(form);
        expect(form.getId()).toBe('registered');
    });

    it('throws when a form with the same id still exists (#47)', () => {
        mountForm('twice', '<input name="a">');
        makeForm({ id: 'twice' });

        expect(() => makeForm({ id: 'twice' })).toThrow('Form "twice" already exists: call destroy() on it first');
    });

    it('creates a form again once the previous one is destroyed (#47)', () => {
        mountForm('again', '<input name="a">');
        makeForm({ id: 'again' }).destroy();

        expect(getForm('again')).toBeUndefined();
        const form = makeForm({ id: 'again' });
        expect(getForm('again')).toBe(form);
    });

    it('ignores a second destroy(), leaving the form created after the first one (#47)', () => {
        mountForm('twice-destroyed', '<input name="a">');
        const old = makeForm({ id: 'twice-destroyed' });
        old.destroy();
        const current = makeForm({ id: 'twice-destroyed' });

        old.destroy();

        expect(getForm('twice-destroyed')).toBe(current);
    });

    it('stops listening to the fields once destroyed (#47)', async () => {
        mountForm('listen', '<input name="a"><input name="b">');
        const calls: string[] = [];
        const rules = [{ name: 'a', update: ['b'] }];
        makeForm({ id: 'listen', rules, behavior: { beforeUpdate: () => { calls.push('first'); return true; } } }).destroy();
        makeForm({ id: 'listen', rules, behavior: { beforeUpdate: () => { calls.push('second'); return true; } } });

        field('a').dispatchEvent(new Event('change'));

        await vi.waitFor(() => expect(calls).toEqual(['second']));
    });

    it('rejects notify() and manualUpdate() on a destroyed form (#47)', async () => {
        mountForm('gone', '<input name="a"><input name="b">');
        const form = makeForm({ id: 'gone', rules: [{ name: 'a', update: ['b'] }] });
        form.destroy();

        await expect(form.notify('a')).rejects.toThrow('Form "gone" was destroyed');
        await expect(form.manualUpdate({}, 'b')).rejects.toThrow('Form "gone" was destroyed');
    });

    it('aborts the remote calls in progress on destroy, rejecting the pending notify() (#47)', async () => {
        const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
        }));
        vi.stubGlobal('fetch', fetchMock);
        mountForm('abort', selectHtml('user', { '1': 'Ann' }) + selectHtml('post'));
        const form = makeForm({ id: 'abort', fields: [{ name: 'post', fetch: { makeUrl: () => '/posts' } }], rules: [{ name: 'user', update: ['post'] }] });
        field<HTMLSelectElement>('user').value = '1';

        const pending = form.notify('user');
        form.destroy();

        await expect(pending).rejects.toThrow('Form "abort" was destroyed');
        expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    });

    it.each([
        { browser: 'with AbortSignal.any', setupBrowser: () => {} },
        // Safari < 17.4, Chrome < 116, Firefox < 124
        { browser: 'without AbortSignal.any', setupBrowser: () => vi.stubGlobal('AbortSignal', Object.assign(Object.create(AbortSignal), { any: undefined })) },
    ])('aborts the remote call with either the signal of fullFetchConfig or the form destruction, $browser (#47)', async ({ setupBrowser }) => {
        setupBrowser();
        vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
        })));
        let userController = new AbortController();
        mountForm('signals', selectHtml('user', { '1': 'Ann' }) + selectHtml('post'));
        const form = makeForm({
            id: 'signals',
            fields: [{ name: 'post', fetch: { makeUrl: () => '/posts', fullFetchConfig: () => ({ signal: userController.signal }) } }],
            rules: [{ name: 'user', update: ['post'] }],
        });
        field<HTMLSelectElement>('user').value = '1';

        const abortedByUser = form.notify('user');
        userController.abort(new Error('timeout'));
        await expect(abortedByUser).rejects.toThrow('timeout');

        userController = new AbortController();
        const abortedByDestroy = form.notify('user');
        form.destroy();
        await expect(abortedByDestroy).rejects.toThrow('Form "signals" was destroyed');
    });

    it('passes the abort signal to the updateStatus field hook, and rejects the pending notify() on destroy even if the hook ignores it (#47)', async () => {
        const signals: AbortSignal[] = [];
        mountForm('hook', '<input name="a"><input name="b">');
        const form = makeForm({
            id: 'hook',
            fields: [{ name: 'b', behavior: { updateStatus: (_el, _data, _subject, signal) => { signals.push(signal); return new Promise(() => {}); } } }],
            rules: [{ name: 'a', update: ['b'] }],
        });

        const pending = form.notify('a');
        form.destroy();

        await expect(pending).rejects.toThrow('Form "hook" was destroyed');
        expect(signals).toHaveLength(1);
        expect(signals[0].aborted).toBe(true);
    });

    it('rejects a pending ready() on destroy (#47)', async () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
        mountForm('init', selectHtml('user'));
        const form = makeForm({ id: 'init', fields: [{ name: 'user', fetch: { makeUrl: () => '/users' } }], init: [{ name: 'user' }] });

        form.destroy();

        await expect(form.ready()).rejects.toThrow('Form "init" was destroyed');
    });

    it('reports nothing when destroyed during the initialisation or an update started by the user (#47)', async () => {
        vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
        })));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const unhandled = vi.fn();
        process.on('unhandledRejection', unhandled);
        mountForm('quiet', selectHtml('user', { '1': 'Ann' }) + selectHtml('post'));
        const form = makeForm({
            id: 'quiet',
            fields: [{ name: 'post', fetch: { makeUrl: () => '/posts' } }],
            rules: [{ name: 'user', update: ['post'] }],
            init: [{ name: 'post' }],
        });
        field<HTMLSelectElement>('user').value = '1';
        field('user').dispatchEvent(new Event('change'));

        form.destroy();
        await new Promise(resolve => setTimeout(resolve, 10));
        process.off('unhandledRejection', unhandled);

        expect(unhandled).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('returns undefined for an unknown form id', () => {
        expect(getForm('never-created')).toBeUndefined();
    });

    it('throws when the configuration has no id', () => {
        expect(() => createForm({ id: '' })).toThrow('Required field in form configuration: id');
    });

    it('throws when no form with the given id exists in the document', () => {
        expect(() => createForm({ id: 'missing' })).toThrow('Form not found for id missing');
    });

    it('throws when a configured field is not in the form', () => {
        mountForm('f', '<input name="a">');

        expect(() => createForm({ id: 'f', fields: [{ name: 'ghost' }] })).toThrow('Invalid form configuration "f":\n- field configuration "ghost": unknown field');
    });

    it.each([
        ['field configuration', { fields: [{} as any] }],
        ['update rule', { rules: [{ update: [] } as any] }],
        ['initialisation rule', { init: [{} as any] }],
    ])('throws when a %s has no name', (kind, config) => {
        mountForm('f', '<input name="a">');

        expect(() => createForm({ id: 'f', ...config })).toThrow(`Invalid form configuration "f":\n- ${kind} #0: missing name`);
    });

    it('lists every missing name, before checking the field names', () => {
        mountForm('f', '<input name="a">');
        const config = { id: 'f', fields: [{} as any], rules: [{ update: ['ghost'] } as any, { name: 'a', update: ['ghost'] }], init: [{} as any] };

        expect(() => createForm(config)).toThrow(new Error([
            'Invalid form configuration "f":',
            '- field configuration #0: missing name',
            '- update rule #0: missing name',
            '- initialisation rule #0: missing name',
        ].join('\n')));
    });

    it.each([
        ['a field observing itself', [{ name: 'a', update: ['a'] }], 'a → a'],
        ['a cycle through other fields', [{ name: 'a', update: ['b'] }, { name: 'b', update: ['c'] }, { name: 'c', update: ['a'] }], 'a → b → c → a'],
    ])('throws when the update rules form a cycle: %s (#38)', (_, rules, path) => {
        mountForm('f', '<input name="a"><input name="b"><input name="c">');

        expect(() => createForm({ id: 'f', rules })).toThrow(`Update rules form a cycle: ${path}`);
    });

    it.each([
        ['in update', { rules: [{ name: 'a', update: ['ghost'] }] }, 'update rule "a": unknown field "ghost" in update'],
        ['in additionalData', { rules: [{ name: 'a', update: ['b'], additionalData: ['ghost'] }] }, 'update rule "a": unknown field "ghost" in additionalData'],
        ['as the subject of an update rule', { rules: [{ name: 'ghost', update: ['b'] }] }, 'update rule "ghost": unknown subject'],
        ['in an initialisation rule', { init: [{ name: 'ghost', value: 'x' }] }, 'initialisation rule "ghost": unknown field'],
    ])('throws for an unknown field name %s (#45)', (_, config, error) => {
        mountForm('f', '<input name="a"><input name="b">');

        expect(() => createForm({ id: 'f', ...config })).toThrow(`Invalid form configuration "f":\n- ${error}`);
    });

    it('lists every unknown field name in one error', () => {
        mountForm('f', '<input name="a"><input name="b">');
        const config = {
            id: 'f',
            fields: [{ name: 'ghost' }],
            rules: [{ name: 'a', update: ['b', 'titel'], additionalData: ['x'] }],
            init: [{ name: 'contry' }],
        };

        expect(() => createForm(config)).toThrow([
            'Invalid form configuration "f":',
            '- field configuration "ghost": unknown field',
            '- update rule "a": unknown field "titel" in update',
            '- update rule "a": unknown field "x" in additionalData',
            '- initialisation rule "contry": unknown field',
        ].join('\n'));
    });

    it('accepts update rules reaching a field through two paths', () => {
        mountForm('f', '<input name="a"><input name="b"><input name="c"><input name="d">');
        const rules = [{ name: 'a', update: ['b', 'c'] }, { name: 'b', update: ['d'] }, { name: 'c', update: ['d'] }];

        expect(() => createForm({ id: 'f', rules })).not.toThrow();
    });

    it('discovers fields present in the form but missing from the configuration', async () => {
        const probe = probeField();
        mountForm('f', '<input name="discovered" value="hello">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'discovered', update: ['probe'] }],
        });

        await form.notify('discovered');

        expect(probe.updates).toEqual([{ data: { discovered: 'hello' }, subjectName: 'discovered' }]);
    });

    it('does not modify the given configuration', () => {
        mountForm('f', '<input name="discovered">');
        const config = { id: 'f', fields: [] };

        createForm(config);

        expect(config).toEqual({ id: 'f', fields: [] });
    });
});

describe('progressive filtering', () => {
    it('fills the observer select with the options fetched for the subject value', async () => {
        const fetchMock = stubFetch({ '/posts?userId=1': postsOfUser1 });
        const form = mountProgressiveForm();

        field<HTMLSelectElement>('user').value = '1';
        await form.notify('user');

        expect(fetchMock).toHaveBeenCalledWith('/posts?userId=1', { method: 'GET', signal: expect.any(AbortSignal) });
        expect(optionValues('post')).toEqual(['', '10', '11']);
        expect(field<HTMLSelectElement>('post').options[1].text).toBe('Post A');
    });

    it('updates observers when the subject fires its change event', async () => {
        stubFetch({ '/posts?userId=1': postsOfUser1 });
        mountProgressiveForm();

        const user = field<HTMLSelectElement>('user');
        user.value = '1';
        user.dispatchEvent(new Event('change'));

        await vi.waitFor(() => expect(optionValues('post')).toEqual(['', '10', '11']));
    });

    it('listens to the event configured in io.event', async () => {
        const probe = probeField();
        mountForm('f', '<input name="search">' + probe.html);
        createForm({
            id: 'f',
            fields: [{ name: 'search', io: { event: 'input' } }, probe.config],
            rules: [{ name: 'search', update: ['probe'] }],
        });

        const search = field('search');
        search.value = 'abc';
        search.dispatchEvent(new Event('change'));
        search.dispatchEvent(new Event('input'));

        await vi.waitFor(() => expect(probe.updates).toHaveLength(1));
        expect(probe.updates[0].data).toEqual({ search: 'abc' });
    });

    it('clears the observers of the observers on cascade', async () => {
        stubFetch({ '/posts?userId=1': postsOfUser1, '/comments?postId=10': commentsOfPost10, '/posts?userId=2': [] });
        const form = mountProgressiveForm();
        field<HTMLSelectElement>('user').value = '1';
        await form.notify('user');
        field<HTMLSelectElement>('post').value = '10';
        await form.notify('post');
        expect(optionValues('comment')).toEqual(['', '100']);

        field<HTMLSelectElement>('user').value = '2';
        await form.notify('user');

        expect(optionValues('comment')).toEqual(['']);
    });

    it('clears the observer select without fetching when the subject becomes empty', async () => {
        const fetchMock = stubFetch({ '/posts?userId=1': postsOfUser1 });
        const form = mountProgressiveForm();
        field<HTMLSelectElement>('user').value = '1';
        await form.notify('user');
        fetchMock.mockClear();

        field<HTMLSelectElement>('user').value = '';
        await form.notify('user');

        expect(fetchMock).not.toHaveBeenCalled();
        expect(optionValues('post')).toEqual(['']);
    });

    it('clears the observer select on an empty subject before calling a custom beforeUpdate (#40)', async () => {
        const fetchMock = stubFetch();
        const beforeUpdate = vi.fn(() => true);
        mountForm('f', selectHtml('user') + selectHtml('post', { '10': 'Post A' }));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: (data) => `/posts?userId=${data.user}` }, behavior: { beforeUpdate } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(optionValues('post')).toEqual(['']);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(beforeUpdate).not.toHaveBeenCalled();
    });

    it('calls the custom beforeUpdate of a select when the subject is not empty', async () => {
        stubFetch({ '/posts?userId=1': postsOfUser1 });
        const beforeUpdate = vi.fn(() => true);
        mountForm('f', selectHtml('user', { '1': 'Ann' }) + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: (data) => `/posts?userId=${data.user}` }, behavior: { beforeUpdate } }],
            rules: [{ name: 'user', update: ['post'] }],
        });
        field<HTMLSelectElement>('user').value = '1';

        await form.notify('user');

        expect(beforeUpdate).toHaveBeenCalledWith(expect.any(NodeList), { user: '1' }, 'user');
        expect(optionValues('post')).toEqual(['', '10', '11']);
    });

    it('still fetches on an empty subject when select.clearOnParentVoid is false', async () => {
        const fetchMock = stubFetch({ '/posts?userId=': [] });
        mountForm('f', selectHtml('user') + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: (data) => `/posts?userId=${data.user}` }, select: { clearOnParentVoid: false } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(fetchMock).toHaveBeenCalledWith('/posts?userId=', expect.anything());
    });

    it('updates every observer listed in a rule', async () => {
        const first = probeField('first');
        const second = probeField('second');
        mountForm('f', '<input name="a" value="x">' + first.html + second.html);
        const form = createForm({
            id: 'f',
            fields: [first.config, second.config],
            rules: [{ name: 'a', update: ['first', 'second'] }],
        });

        await form.notify('a');

        expect(first.updates).toEqual([{ data: { a: 'x' }, subjectName: 'a' }]);
        expect(second.updates).toEqual([{ data: { a: 'x' }, subjectName: 'a' }]);
    });

    it.each([
        [['currency', 'region']],
        [['region', 'currency']],
    ])('clears on cascade before updating, whatever the order of the observers %j', async (observers) => {
        stubFetch({ '/regions': [{ value: 'lom', text: 'Lombardia' }] });
        mountForm('f', selectHtml('country', { it: 'Italia' }) + selectHtml('region') + '<input name="currency">');
        const form = createForm({
            id: 'f',
            fields: [
                { name: 'region', fetch: { makeUrl: () => '/regions' } },
                { name: 'currency', behavior: { updateStatus: (el, data) => { el[0].value = data.country === 'it' ? 'EUR' : ''; } } },
            ],
            rules: [{ name: 'country', update: observers }, { name: 'region', update: ['currency'] }],
        });
        field<HTMLSelectElement>('country').value = 'it';

        await form.notify('country');

        expect(field('currency').value).toBe('EUR');
        expect(optionValues('region')).toEqual(['', 'lom']);
    });

    it('rejects notify() when the cascade clear fails', async () => {
        mountForm('f', '<input name="a"><input name="b"><input name="c">');
        const form = createForm({
            id: 'f',
            fields: [{ name: 'c', behavior: { clear: () => { throw new Error('clear failed'); } } }],
            rules: [{ name: 'a', update: ['b'] }, { name: 'b', update: ['c'] }],
        });

        await expect(form.notify('a')).rejects.toThrow('clear failed');
    });
});

describe('update parameters', () => {
    it('adds the values of the fields listed in additionalData', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a" value="1"><input name="b" value="2">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'], additionalData: ['b'] }],
        });

        await form.notify('a');

        expect(probe.updates[0].data).toEqual({ a: '1', b: '2' });
    });

    it('merges the data returned by externalData', async () => {
        const probe = probeField();
        const received: unknown[] = [];
        const externalData = (data: object, subjectName: string | null) => {
            received.push({ ...data }, subjectName);
            return { token: 'abc' };
        };
        mountForm('f', '<input name="a" value="1">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'], externalData }],
        });

        await form.notify('a');

        expect(received).toEqual([{ a: '1' }, 'a']);
        expect(probe.updates[0].data).toEqual({ a: '1', token: 'abc' });
    });
});

describe('remote call configuration', () => {
    it('sends the configured method and the body built by makeBody', async () => {
        const fetchMock = stubFetch({ '/posts': postsOfUser1 });
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { method: 'POST', makeUrl: () => '/posts', makeBody: (data) => JSON.stringify(data) } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(fetchMock).toHaveBeenCalledWith('/posts', { method: 'POST', body: '{"user":"1"}', signal: expect.any(AbortSignal) });
    });

    it('sends the RequestInit returned by fullFetchConfig for the Update Data, ignoring method and makeBody', async () => {
        const fetchMock = stubFetch({ '/posts': postsOfUser1 });
        const received: unknown[] = [];
        const fullFetchConfig = (data: Record<string, any>) => {
            received.push({ ...data });
            return { method: 'PUT', headers: { 'X-Test': '1' }, body: JSON.stringify(data) };
        };
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { method: 'POST', makeUrl: () => '/posts', makeBody: () => 'ignored', fullFetchConfig } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(received).toEqual([{ user: '1' }]);
        expect(fetchMock).toHaveBeenCalledWith('/posts', { method: 'PUT', headers: { 'X-Test': '1' }, body: '{"user":"1"}', signal: expect.any(AbortSignal) });
    });

    it('saves the data transformed by select.postProcessData', async () => {
        stubFetch({ '/posts': [{ id: 10, title: 'Post A' }] });
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{
                name: 'post',
                fetch: { makeUrl: () => '/posts' },
                select: { postProcessData: (_el, data) => data.map((p: { id: number, title: string }) => ({ value: p.id, text: p.title })) },
            }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(optionValues('post')).toEqual(['', '10']);
    });

    it('delegates saving to select.saveData when configured', async () => {
        stubFetch({ '/posts': postsOfUser1 });
        const saveData = vi.fn();
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: () => '/posts' }, select: { saveData } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(saveData).toHaveBeenCalledWith(expect.any(NodeList), postsOfUser1);
        expect(optionValues('post')).toEqual(['']);
    });

    it('leaves the select untouched when the remote call fails', async () => {
        stubFetch({});
        mountForm('f', '<input name="user" value="1">' + selectHtml('post', { '10': 'Old' }));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: () => '/posts' } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await expect(form.notify('user')).rejects.toBeDefined();

        expect(optionValues('post')).toEqual(['', '10']);
    });

    it('logs an error for fetched items without text or value', async () => {
        stubFetch({ '/posts': [{ id: 10 }] });
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { makeUrl: () => '/posts' } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("'text' or 'value'"), { id: 10 });
    });
});

describe('form behavior', () => {
    it('calls beforeUpdate and afterUpdate around the updates of a subject', async () => {
        const calls: string[] = [];
        const probe = probeField();
        probe.config.behavior!.updateStatus = () => { calls.push('update'); };
        mountForm('f', '<input name="a">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
            behavior: {
                beforeUpdate: (name: string) => { calls.push(`before:${name}`); return true; },
                afterUpdate: (name: string) => { calls.push(`after:${name}`); },
            },
        });

        await form.notify('a');

        expect(calls).toEqual(['before:a', 'update', 'after:a']);
    });

    it('skips the updates when beforeUpdate returns false, still calling afterUpdate', async () => {
        const probe = probeField();
        const afterUpdate = vi.fn();
        mountForm('f', '<input name="a">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
            behavior: { beforeUpdate: () => false, afterUpdate },
        });

        await form.notify('a');

        expect(probe.updates).toEqual([]);
        expect(afterUpdate).toHaveBeenCalledWith('a');
    });

    it('uses the default for form hooks set to undefined', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a" value="1">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
            behavior: { beforeInit: undefined, afterInit: undefined, beforeUpdate: undefined, afterUpdate: undefined },
        });

        await form.ready();
        await form.notify('a');

        expect(probe.updates).toEqual([{ data: { a: '1' }, subjectName: 'a' }]);
    });

    it('ignores changes while disabled', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            rules: [{ name: 'a', update: ['probe'] }],
        });

        form.setEnabled(false);
        await form.notify('a');
        expect(form.isEnabled()).toBe(false);
        expect(probe.updates).toEqual([]);

        form.setEnabled(true);
        await form.notify('a');
        expect(probe.updates).toHaveLength(1);
    });

    it('updates a single field on demand with manualUpdate', async () => {
        const fetchMock = stubFetch({ '/posts?userId=2': postsOfUser1 });
        const form = mountProgressiveForm();

        await form.manualUpdate({ user: '2' }, 'post');

        expect(fetchMock).toHaveBeenCalledWith('/posts?userId=2', expect.anything());
        expect(optionValues('post')).toEqual(['', '10', '11']);
    });
});

describe('field behavior', () => {
    it('skips updateStatus when the field beforeUpdate returns false, still calling afterUpdate', async () => {
        const updateStatus = vi.fn();
        const afterUpdate = vi.fn(() => true);
        mountForm('f', '<input name="a" value="1"><input name="b">');
        const form = createForm({
            id: 'f',
            fields: [{ name: 'b', behavior: { beforeUpdate: () => false, updateStatus, afterUpdate } }],
            rules: [{ name: 'a', update: ['b'] }],
        });

        await form.notify('a');

        expect(updateStatus).not.toHaveBeenCalled();
        expect(afterUpdate).toHaveBeenCalledWith(expect.any(NodeList), { a: '1' }, 'a');
    });

    it('passes the html elements, the data and the subject name to the field hooks, and the abort signal to updateStatus', async () => {
        const beforeUpdate = vi.fn(() => true);
        const updateStatus = vi.fn();
        mountForm('f', '<input name="a" value="1"><input name="b">');
        const form = createForm({
            id: 'f',
            fields: [{ name: 'b', behavior: { beforeUpdate, updateStatus } }],
            rules: [{ name: 'a', update: ['b'] }],
        });

        await form.notify('a');

        expect(beforeUpdate).toHaveBeenCalledWith(expect.any(NodeList), { a: '1' }, 'a');
        expect(updateStatus).toHaveBeenCalledWith(expect.any(NodeList), { a: '1' }, 'a', expect.any(AbortSignal));
    });
});

describe('initialisation', () => {
    it('resolves ready() and calls beforeInit/afterInit even without init rules', async () => {
        const calls: string[] = [];
        mountForm('f', '<input name="a">');
        const form = createForm({
            id: 'f',
            behavior: { beforeInit: () => { calls.push('beforeInit'); }, afterInit: () => { calls.push('afterInit'); } },
        });

        await form.ready();

        expect(calls).toEqual(['beforeInit', 'afterInit']);
    });

    it('restores the progressive filtering status from the init values', async () => {
        const fetchMock = stubFetch({
            '/users': users,
            '/posts?userId=1': postsOfUser1,
            '/comments?postId=10': commentsOfPost10,
        });
        mountForm('init', selectHtml('user') + selectHtml('post') + selectHtml('comment'));
        const calls: string[] = [];
        const form = createForm({
            id: 'init',
            fields: [
                { name: 'user', fetch: { makeUrl: () => '/users' } },
                { name: 'post', fetch: { makeUrl: (data) => `/posts?userId=${data.user}` } },
                { name: 'comment', fetch: { makeUrl: (data) => `/comments?postId=${data.post}` } },
            ],
            rules: [
                { name: 'user', update: ['post'] },
                { name: 'post', update: ['comment'] },
            ],
            init: [{ name: 'user', value: '1' }, { name: 'post', value: '10' }],
            behavior: { beforeInit: () => { calls.push('beforeInit'); }, afterInit: () => { calls.push('afterInit'); } },
        });

        await form.ready();

        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/users', '/posts?userId=1', '/comments?postId=10']);
        expect(field<HTMLSelectElement>('user').value).toBe('1');
        expect(field<HTMLSelectElement>('post').value).toBe('10');
        expect(optionValues('comment')).toEqual(['', '100']);
        expect(calls).toEqual(['beforeInit', 'afterInit']);
    });

    it('passes all the init values to every initialised field', async () => {
        const probe = probeField();
        mountForm('f', '<input name="a">' + probe.html);
        const form = createForm({
            id: 'f',
            fields: [probe.config],
            init: [{ name: 'a', value: 'x' }, { name: 'probe' }],
        });

        await form.ready();

        expect(probe.updates).toEqual([{ data: { a: 'x' }, subjectName: null }]);
        expect(field('a').value).toBe('x');
    });

    it('keeps the init value of a field reached by the cascade clear of another initialised field, still clearing the fields beyond it (#37)', async () => {
        mountForm('f', '<input name="a"><input name="b"><input name="c"><input name="d" value="4">');
        const form = createForm({
            id: 'f',
            rules: [{ name: 'a', update: ['b'] }, { name: 'b', update: ['c'] }, { name: 'c', update: ['d'] }],
            init: [{ name: 'a', value: '1' }, { name: 'c', value: '3' }],
        });

        await form.ready();

        expect(field('c').value).toBe('3');
        expect(field('d').value).toBe('');
    });
});
