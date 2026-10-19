import { describe, expectTypeOf, it } from 'vitest';
import { makeForm } from '@/index';
import type { CheckboxConfiguration, DynamicForm, InitialisationRule, SelectOption, FieldConfiguration, FormConfiguration, FormHooks, SelectConfiguration, UpdateData, UpdateRule, FieldHooks } from '@/index';

// Type-level specification of the public api: these tests fail `npm run typecheck`, not `npm test`.

describe('form configuration type', () => {
    it('requires only the form id', () => {
        expectTypeOf<{ id: 'f' }>().toExtend<FormConfiguration>();
        // @ts-expect-error the id is required
        expectTypeOf<{}>().toExtend<FormConfiguration>();
    });

    it('is what makeForm accepts and makeForm returns a DynamicForm', () => {
        expectTypeOf(makeForm).parameter(0).toEqualTypeOf<FormConfiguration>();
        expectTypeOf(makeForm).returns.toEqualTypeOf<DynamicForm>();
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
});

describe('package exports', () => {
    it('keeps the resolved configuration internal', async () => {
        // @ts-expect-error the configuration completed with defaults is not public
        type Resolved = import('@/index').ResolvedFormConfiguration;
        expectTypeOf<Resolved>().toBeAny();
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
    it('gives inline hooks a form control, so value needs no cast', () => {
        const field: FieldConfiguration = {
            name: 'title',
            io: { get: (el) => el instanceof NodeList ? '' : el.value },
            behavior: { clear: (el) => { if (!(el instanceof NodeList)) el.value = ''; } },
        };
        void field;
        expectTypeOf<Parameters<NonNullable<FieldHooks['clear']>>[0]>()
            .toEqualTypeOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>();
    });

    it('narrows the hooks to the element type of the field, which still fits in the form fields', () => {
        const city: FieldConfiguration<HTMLSelectElement> = {
            name: 'city',
            behavior: { clear: (el) => { if (!(el instanceof NodeList)) el.options.length = 0; } },
            select: { saveData: (els) => { els[0].options.length = 0; } },
        };
        const privacy: FieldConfiguration<HTMLInputElement> = {
            name: 'privacy',
            io: { get: (els) => els instanceof NodeList ? els[0].checked : els.checked },
        };
        expectTypeOf({ id: 'f', fields: [city, privacy] }).toExtend<FormConfiguration>();
    });

    it('rejects properties the element does not have', () => {
        const field: FieldConfiguration<HTMLInputElement> = {
            name: 'privacy',
            // @ts-expect-error inputs have no options
            behavior: { clear: (el) => { if (!(el instanceof NodeList)) el.options.length = 0; } },
        };
        void field;
    });
});

describe('field value type', () => {
    it('lets io hooks use the value without checks by default', () => {
        const field: FieldConfiguration = {
            name: 'tags',
            io: { set: (el, value) => { if (!(el instanceof NodeList)) el.value = value.join(','); } },
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
