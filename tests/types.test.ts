import { describe, expectTypeOf, it } from 'vitest';
import { makeForm } from '@/index';
import type { CheckboxConfiguration, DynamicForm, FieldConfiguration, FormConfiguration, FormHooks, SelectConfiguration, UpdateData, UpdateRule, FieldHooks } from '@/index';

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
