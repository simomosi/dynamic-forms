import { describe, expect, it, vi } from 'vitest';
import { getForm } from '@/index';
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

        expect(() => createForm({ id: 'f', fields: [{ name: 'ghost' }] })).toThrow('Element ghost not found');
    });

    it.each([
        ['field configuration', { fields: [{} as any] }],
        ['update rule', { rules: [{ update: [] } as any] }],
        ['initialisation rule', { init: [{} as any] }],
    ])('throws when a %s has no name', (kind, config) => {
        mountForm('f', '<input name="a">');

        expect(() => createForm({ id: 'f', ...config })).toThrow(`Missing required name in ${kind} #0`);
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

        expect(fetchMock).toHaveBeenCalledWith('/posts?userId=1', { method: 'GET' });
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

    it('does not update a field which lists itself as observer', async () => {
        const self = probeField('self');
        const other = probeField('other');
        mountForm('f', self.html + other.html);
        const form = createForm({
            id: 'f',
            fields: [self.config, other.config],
            rules: [{ name: 'self', update: ['self', 'other'] }],
        });

        await form.notify('self');

        expect(self.updates).toEqual([]);
        expect(other.updates).toHaveLength(1);
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

        expect(fetchMock).toHaveBeenCalledWith('/posts', { method: 'POST', body: '{"user":"1"}' });
    });

    it('uses fullFetchConfig as is, ignoring method and makeBody', async () => {
        const fetchMock = stubFetch({ '/posts': postsOfUser1 });
        const fullFetchConfig = { method: 'PUT', headers: { 'X-Test': '1' } };
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{ name: 'post', fetch: { method: 'POST', makeUrl: () => '/posts', makeBody: () => 'ignored', fullFetchConfig } }],
            rules: [{ name: 'user', update: ['post'] }],
        });

        await form.notify('user');

        expect(fetchMock).toHaveBeenCalledWith('/posts', fullFetchConfig);
    });

    it('saves the data transformed by select.postProcessData', async () => {
        stubFetch({ '/posts': [{ id: 10, title: 'Post A' }] });
        mountForm('f', '<input name="user" value="1">' + selectHtml('post'));
        const form = createForm({
            id: 'f',
            fields: [{
                name: 'post',
                fetch: { makeUrl: () => '/posts' },
                select: { postProcessData: (_el, data: any[]) => data.map(p => ({ value: String(p.id), text: p.title })) },
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
        expect(afterUpdate).toHaveBeenCalledWith(field('b'), { a: '1' }, 'a');
    });

    it('passes the html element, the data and the subject name to the field hooks', async () => {
        const beforeUpdate = vi.fn(() => true);
        const updateStatus = vi.fn();
        mountForm('f', '<input name="a" value="1"><input name="b">');
        const form = createForm({
            id: 'f',
            fields: [{ name: 'b', behavior: { beforeUpdate, updateStatus } }],
            rules: [{ name: 'a', update: ['b'] }],
        });

        await form.notify('a');

        expect(beforeUpdate).toHaveBeenCalledWith(field('b'), { a: '1' }, 'a');
        expect(updateStatus).toHaveBeenCalledWith(field('b'), { a: '1' }, 'a');
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
});
