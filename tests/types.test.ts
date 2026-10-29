import { describe, expectTypeOf, it } from 'vitest';
import { getForm, makeForm, RemoteCallError } from '@/index';
import type { CheckboxConfiguration, Form, InitialisationRule, SelectOption, FieldConfiguration, FormConfiguration, FormHooks, SelectConfiguration, UpdateData, UpdateRule, FieldHooks, FieldIoHooks } from '@/index';

// Type-level specification of the public api: these tests fail `npm run typecheck`, not `npm test`.

describe('form configuration type', () => {
    it('requires only the form id', () => {
        expectTypeOf<{ id: 'f' }>().toExtend<FormConfiguration>();
        // @ts-expect-error the id is required
        expectTypeOf<{}>().toExtend<FormConfiguration>();
    });

    it('is what makeForm accepts and makeForm returns a Form', () => {
        expectTypeOf(makeForm).parameter(0).toEqualTypeOf<FormConfiguration>();
        expectTypeOf(makeForm).returns.toEqualTypeOf<Form>();
        expectTypeOf(getForm).returns.toEqualTypeOf<Form | undefined>();
    });
});

describe('form type', () => {
    it('has only the methods of the Form', () => {
        expectTypeOf<keyof Form>().toEqualTypeOf<'ready' | 'notify' | 'manualUpdate' | 'destroy' | 'setEnabled' | 'isEnabled' | 'getId'>();
    });

    it('is no longer exported as DynamicForm', () => {
        // @ts-expect-error renamed Form in 4.0.0
        type Removed = import('@/index').DynamicForm;
        expectTypeOf<Removed>().toBeAny();
    });
});

describe('form hooks type', () => {
    it('accepts any subset of the form hooks', () => {
        expectTypeOf<{ id: 'f', behavior: { afterInit: () => void } }>().toExtend<FormConfiguration>();
    });

    it('gives form hooks a subject name that is never null', () => {
        expectTypeOf<FormHooks['beforeUpdate']>().parameter(0).toEqualTypeOf<string>();
        expectTypeOf<FormHooks['afterUpdate']>().parameter(0).toEqualTypeOf<string>();
    });
});

describe('field configuration type', () => {
    it('accepts select and checkbox configurations on any field', () => {
        const fields: FieldConfiguration[] = [
            { name: 'city', select: { clearOnParentVoid: false } },
            { name: 'privacy', checkbox: { booleanValue: true } },
        ];
        expectTypeOf({ id: 'f', fields }).toExtend<FormConfiguration>();
        expectTypeOf<FieldConfiguration['select']>().toEqualTypeOf<SelectConfiguration | undefined>();
        expectTypeOf<FieldConfiguration['checkbox']>().toEqualTypeOf<CheckboxConfiguration | undefined>();
    });

    it('rejects unknown keys', () => {
        // @ts-expect-error `dropdown` was renamed to `select` in 2.0.0
        const field: FieldConfiguration = { name: 'city', dropdown: {} };
        void field;
    });
});

describe('update data type', () => {
    it('lets hooks read field values without annotations', () => {
        const field: FieldConfiguration = {
            name: 'post',
            fetch: { makeUrl: (data) => `/posts?userId=${data.user}`, makeBody: (data) => data.user },
            behavior: { beforeUpdate: (_el, data) => data.user !== '' },
        };
        const rule: UpdateRule = { name: 'user', update: ['post'], externalData: (data) => ({ page: data.page }) };
        void field, rule;
        expectTypeOf<UpdateData>().toEqualTypeOf<Record<string, any>>();
    });

    it('builds the full fetch configuration from the Update Data', () => {
        expectTypeOf<NonNullable<FieldConfiguration['fetch']>['fullFetchConfig']>()
            .toEqualTypeOf<((data: UpdateData) => RequestInit) | undefined>();
        // @ts-expect-error fullFetchConfig is a function of the Update Data since 4.0.0
        const field: FieldConfiguration = { name: 'post', fetch: { fullFetchConfig: { method: 'POST' } } };
        void field;
    });

    it('gives externalData the subject name of its update rule', () => {
        expectTypeOf<NonNullable<UpdateRule['externalData']>>().parameter(1).toEqualTypeOf<string>();
    });

    it('gives field hooks a subject name that is null on manual updates', () => {
        expectTypeOf<NonNullable<FieldHooks['beforeUpdate']>>().parameter(2).toEqualTypeOf<string | null>();
        expectTypeOf<NonNullable<FieldHooks['updateStatus']>>().parameter(2).toEqualTypeOf<string | null>();
        expectTypeOf<NonNullable<FieldHooks['afterUpdate']>>().parameter(2).toEqualTypeOf<string | null>();
    });

    it('lets beforeUpdate stop the update, while afterUpdate returns nothing', () => {
        expectTypeOf<NonNullable<FieldHooks['beforeUpdate']>>().returns.toEqualTypeOf<boolean>();
        expectTypeOf<NonNullable<FieldHooks['afterUpdate']>>().returns.toEqualTypeOf<void>();
    });

    it('gives the updateStatus field hook the signal aborted when the form is destroyed', () => {
        expectTypeOf<NonNullable<FieldHooks['updateStatus']>>().parameter(3).toEqualTypeOf<AbortSignal>();
    });

    it('gives select.loadOptions the parameters of updateStatus, and the remote call as its Standard Behaviour', () => {
        type LoadOptions = NonNullable<SelectConfiguration['loadOptions']>;
        type UpdateStatus = NonNullable<FieldHooks['updateStatus']>;
        type WithoutStandard<P> = P extends [...infer Rest, unknown] ? Rest : never;
        expectTypeOf<WithoutStandard<Parameters<LoadOptions>>>().toEqualTypeOf<WithoutStandard<Parameters<UpdateStatus>>>();
        expectTypeOf<LoadOptions>().parameter(4).toEqualTypeOf<() => Promise<any>>();
    });

    it('exports RemoteCallError, an Error holding the failed response', () => {
        expectTypeOf<RemoteCallError>().toExtend<Error>();
        expectTypeOf<RemoteCallError['response']>().toEqualTypeOf<Response>();
    });
});

describe('package exports', () => {
    it('keeps the resolved configuration internal', async () => {
        // @ts-expect-error the configuration completed with defaults is not public
        type Resolved = import('@/index').ResolvedFormConfiguration;
        expectTypeOf<Resolved>().toBeAny();
    });

    it('does not export FieldHookElement, hooks receive a plain NodeListOf', () => {
        // @ts-expect-error hooks receive NodeListOf<FieldElement>
        type HookElement = import('@/index').FieldHookElement;
        expectTypeOf<HookElement>().toBeAny();
    });

    it('no longer exports the 3.x type names', () => {
        // @ts-expect-error renamed to FormHooks
        type Behavior = import('@/index').FormBehavior;
        // @ts-expect-error renamed to SelectConfiguration
        type Select = import('@/index').SelectSelectConfiguration;
        expectTypeOf<Behavior | Select>().toBeAny();
    });
});

describe('field hooks element type', () => {
    it('gives every hook the NodeList of form controls, so value needs no narrowing or cast', () => {
        const field: FieldConfiguration = {
            name: 'title',
            io: { get: (els) => els[0].value, set: (els, value) => { els[0].value = value; } },
            behavior: {
                clear: (els) => { els[0].value = ''; },
                beforeUpdate: (els) => els[0].value !== '',
                updateStatus: (els) => { els[0].disabled = false; },
                afterUpdate: (els) => els.length > 0,
            },
        };
        void field;
        type Controls = NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
        expectTypeOf<Parameters<NonNullable<FieldIoHooks['get']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<FieldIoHooks['set']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<FieldHooks['clear']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<FieldHooks['beforeUpdate']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<FieldHooks['updateStatus']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<FieldHooks['afterUpdate']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<SelectConfiguration['postProcessData']>>[0]>().toEqualTypeOf<Controls>();
        expectTypeOf<Parameters<NonNullable<SelectConfiguration['saveData']>>[0]>().toEqualTypeOf<Controls>();
    });

    it('no longer gives hooks the single element', () => {
        const field: FieldConfiguration = {
            name: 'title',
            // @ts-expect-error hooks receive the NodeList, even for a single element
            io: { get: (el) => el.value },
        };
        void field;
    });

    it('narrows the hooks to the element type of the field, which still fits in the form fields', () => {
        const city: FieldConfiguration<HTMLSelectElement> = {
            name: 'city',
            behavior: { clear: (els) => { els[0].options.length = 0; } },
            select: { saveData: (els) => { els[0].options.length = 0; } },
        };
        const privacy: FieldConfiguration<HTMLInputElement> = {
            name: 'privacy',
            io: { get: (els) => els[0].checked },
        };
        expectTypeOf({ id: 'f', fields: [city, privacy] }).toExtend<FormConfiguration>();
    });

    it('accepts hooks annotated with a narrower element, unchecked against the html', () => {
        // The price of declaring hooks as methods, which lets FieldConfiguration<HTMLSelectElement> fit in the form fields
        const field: FieldConfiguration = { name: 'city', behavior: { clear: (els: NodeListOf<HTMLSelectElement>) => { els[0].options.length = 0; } } };
        expectTypeOf({ id: 'f', fields: [field] }).toExtend<FormConfiguration>();
    });

    it('rejects properties the element does not have', () => {
        const field: FieldConfiguration<HTMLInputElement> = {
            name: 'privacy',
            // @ts-expect-error inputs have no options
            behavior: { clear: (els) => { els[0].options.length = 0; } },
        };
        void field;
    });
});

describe('field value type', () => {
    it('lets io hooks use the value without checks by default', () => {
        const field: FieldConfiguration = {
            name: 'tags',
            io: { set: (els, value) => { els[0].value = value.join(','); } },
        };
        void field;
    });

    it('checks the value against the type the field states', () => {
        const tags: FieldConfiguration<HTMLInputElement, string[]> = {
            name: 'tags',
            io: { get: () => ['a'], set: (_el, value) => { value.join(','); } },
        };
        expectTypeOf({ id: 'f', fields: [tags] }).toExtend<FormConfiguration>();
        // @ts-expect-error get must return the field value type
        const wrong: FieldConfiguration<HTMLInputElement, string[]> = { name: 'tags', io: { get: () => 'a' } };
        void wrong;
    });

    it('accepts any initial value', () => {
        expectTypeOf<InitialisationRule['value']>().toEqualTypeOf<unknown>();
        const init: InitialisationRule[] = [{ name: 'tags', value: ['a'] }, { name: 'privacy', value: true }];
        void init;
    });
});

describe('select options type', () => {
    it('lets postProcessData read the raw response and requires it to return options', () => {
        const post: FieldConfiguration = {
            name: 'post',
            select: { postProcessData: (_els, data) => data.map((p: { id: number, title: string }) => ({ value: p.id, text: p.title })) },
        };
        void post;
        expectTypeOf<SelectOption>().toEqualTypeOf<{ value: string | number, text: string }>();
        // @ts-expect-error options need a text
        const wrong: FieldConfiguration = { name: 'post', select: { postProcessData: () => [{ value: 1 }] } };
        void wrong;
    });

    it('gives saveData the options', () => {
        expectTypeOf<NonNullable<SelectConfiguration['saveData']>>().parameter(1).toEqualTypeOf<SelectOption[]>();
    });
});

describe('Widget integration types', () => {
    it('lets a field state a form-associated custom element as its element type', () => {
        class SlSelect extends HTMLElement { value = ''; }
        const country: FieldConfiguration<SlSelect, string> = {
            name: 'country',
            io: { get: (els) => els[0].value, set: (els, value) => { els[0].value = value; } },
        };
        expectTypeOf({ id: 'f', fields: [country] }).toExtend<FormConfiguration>();
    });

    it('gives each hook replacing a Standard Behaviour its standard, typed after the field value', () => {
        type Io = Required<FieldIoHooks<HTMLInputElement, string[]>>;
        type Hooks = Required<FieldHooks>;
        type Select = Required<SelectConfiguration>;
        expectTypeOf<Io['listen']>().parameter(2).toEqualTypeOf<() => () => void>();
        expectTypeOf<Io['get']>().parameter(1).toEqualTypeOf<() => string[]>();
        expectTypeOf<Io['set']>().parameter(2).toEqualTypeOf<() => void>();
        expectTypeOf<Hooks['clear']>().parameter(1).toEqualTypeOf<() => void>();
        expectTypeOf<Hooks['updateStatus']>().parameter(4).toEqualTypeOf<() => Promise<void>>();
        expectTypeOf<Select['postProcessData']>().parameter(2).toEqualTypeOf<() => any>();
        expectTypeOf<Select['saveData']>().parameter(2).toEqualTypeOf<() => void>();
    });

    it('lets io.listen subscribe to a Widget and return its unsubscribe function', () => {
        const widget = { on: (_cb: () => void) => () => {} };
        const country: FieldConfiguration = { name: 'country', io: { listen: (_els, onChange) => widget.on(onChange) } };
        void country;
        // @ts-expect-error io.listen must return the function that stops listening
        const wrong: FieldConfiguration = { name: 'country', io: { listen: (_els, onChange) => { widget.on(onChange); } } };
        void wrong;
    });
});
