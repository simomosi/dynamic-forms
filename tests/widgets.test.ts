import { beforeAll, describe, expect, it, vi } from 'vitest';
import $ from 'jquery';
import select2 from 'select2';
import Choices from 'choices.js';
import TomSelect from 'tom-select';
import flatpickr from 'flatpickr';
import { select2Field } from '../docs/configurations/widgets/select2.js';
import { choicesField } from '../docs/configurations/widgets/choices.js';
import { tomSelectField } from '../docs/configurations/widgets/tom-select.js';
import { flatpickrField } from '../docs/configurations/widgets/flatpickr.js';
import { createForm, field, mountForm, optionValues, probeField, selectHtml, stubFetch } from './helpers';

/**
 * The Widget recipes of the docs (docs/configurations/widgets), run against the real Widgets in jsdom
 * on a country → city form: a choice in the country Widget loads the cities, the city Widget offers them,
 * and emptying the country clears the city Widget.
 */

const cities = { '/cities?country=it': [{ value: 'rm', text: 'Roma' }, { value: 'mi', text: 'Milano' }] };
const makeUrl = (data: Record<string, string>) => `/cities?country=${data.country}`;

describe('select2 recipe', () => {
    beforeAll(() => {
        Object.assign(globalThis, { $, jQuery: $ });
        (select2 as unknown as (root: Window, jQuery: typeof $) => void)(window, $);
    });

    /** The texts select2 offers in the open dropdown of `name` */
    const offered = (name: string) => {
        $(`[name=${name}]`).select2('open');
        const texts = $('.select2-results__option').map((_i, el) => $(el).text()).get();
        $(`[name=${name}]`).select2('close');
        return texts;
    };
    const shown = (name: string) => $(`[name=${name}]`).next('.select2').find('.select2-selection__rendered').text();

    it('updates the Observers on a choice, offers the loaded Options, and shows a Clear', async () => {
        stubFetch(cities);
        mountForm('f', selectHtml('country', { it: 'Italia' }) + selectHtml('city'));
        $('[name=country], [name=city]').select2();
        createForm({
            id: 'f',
            fields: [select2Field('country'), select2Field('city', { fetch: { makeUrl } })],
            rules: [{ name: 'country', update: ['city'] }],
        });

        $('[name=country]').val('it').trigger('change'); // what select2 does on a user's choice
        await vi.waitFor(() => expect(optionValues('city')).toEqual(['', 'rm', 'mi']));
        await vi.waitFor(() => expect(offered('city')).toEqual(['', 'Roma', 'Milano']));

        $('[name=city]').val('mi').trigger('change');
        expect(shown('city')).toBe('Milano');
        $('[name=country]').val('').trigger('change');
        await vi.waitFor(() => expect(shown('city')).toBe(''));
    });
});

describe('Choices.js recipe', () => {
    beforeAll(() => {
        // Missing in jsdom, used by Choices to pick the dropdown position
        window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    });

    /** Picks the choice of `value` with the mouse, as a user does */
    const pick = (choices: Choices, value: string) => {
        choices.showDropdown();
        choices.containerOuter.element.querySelector(`[data-choice][data-value="${value}"]`)!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    };
    const offered = (choices: Choices) => Array.from(choices.choiceList.element.querySelectorAll('[data-choice]')).map(el => el.getAttribute('data-value'));
    const shown = (choices: Choices) => choices.getValue(true) ?? '';

    it('updates the Observers on a choice, offers the loaded Options, and shows a Clear', async () => {
        stubFetch(cities);
        mountForm('f', selectHtml('country', { it: 'Italia' }) + selectHtml('city'));
        const country = new Choices('[name=country]', { removeItemButton: true });
        const city = new Choices('[name=city]');
        createForm({
            id: 'f',
            fields: [choicesField('country', country), choicesField('city', city, { fetch: { makeUrl } })],
            rules: [{ name: 'country', update: ['city'] }],
        });

        pick(country, 'it');
        await vi.waitFor(() => expect(offered(city)).toEqual(expect.arrayContaining(['rm', 'mi'])));

        pick(city, 'mi');
        expect(shown(city)).toBe('mi');
        country.containerOuter.element.querySelector('[data-button]')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); // the user removes the choice
        await vi.waitFor(() => expect(shown(city)).toBe(''));
        expect(offered(city)).not.toContain('mi');
    });
});

describe('Tom Select recipe', () => {
    /** Picks the option of `value` in the dropdown with the mouse, as a user does */
    const pick = (tomSelect: TomSelect, value: string) => {
        tomSelect.open();
        tomSelect.refreshOptions(false); // renders the options in the dropdown
        (tomSelect.dropdown_content.querySelector(`[data-value="${value}"]`) as HTMLElement).click();
    };
    const offered = (tomSelect: TomSelect) => Object.keys(tomSelect.options).filter(value => value !== '');

    it('updates the Observers on a choice, offers the loaded Options, and shows a Clear', async () => {
        stubFetch(cities);
        mountForm('f', selectHtml('country', { it: 'Italia' }) + selectHtml('city'));
        const country = new TomSelect('[name=country]', {});
        const city = new TomSelect('[name=city]', {});
        createForm({
            id: 'f',
            fields: [tomSelectField('country'), tomSelectField('city', { fetch: { makeUrl } })],
            rules: [{ name: 'country', update: ['city'] }],
        });

        pick(country, 'it');
        await vi.waitFor(() => expect(offered(city)).toEqual(['rm', 'mi']));

        pick(city, 'mi');
        expect(city.getValue()).toBe('mi');
        country.clear(); // what its clear and remove buttons do for the user
        await vi.waitFor(() => expect(city.getValue()).toBe(''));
        expect(offered(city)).toEqual([]);
    });
});

describe('flatpickr recipe', () => {
    it('shows the init value, updates the Observers on a pick, and shows a Clear', async () => {
        const middle = probeField('middle');
        const slots = probeField('slots');
        mountForm('f', '<input name="type">' + middle.html + '<input name="date">' + slots.html);
        const picker = flatpickr(field('date'), {}) as flatpickr.Instance;
        const form = createForm({
            id: 'f',
            fields: [middle.config, flatpickrField('date'), slots.config],
            rules: [{ name: 'type', update: ['middle'] }, { name: 'middle', update: ['date'] }, { name: 'date', update: ['slots'] }],
            init: [{ name: 'date', value: '2026-10-22' }],
        });
        await form.ready();
        expect(picker.selectedDates.map(date => picker.formatDate(date, 'Y-m-d'))).toEqual(['2026-10-22']);

        picker.open();
        (picker.daysContainer!.querySelector('[aria-label="October 23, 2026"]') as HTMLElement).click(); // the user picks a day
        await vi.waitFor(() => expect(slots.updates.at(-1)?.data).toEqual({ date: '2026-10-23' }));

        const updatesBeforeClear = slots.updates.length;
        await form.notify('type'); // its Cascade Clear clears the date
        expect(picker.selectedDates).toEqual([]);
        expect(field('date').value).toBe('');
        expect(slots.updates).toHaveLength(updatesBeforeClear); // flatpickr's change on clear() starts no Update
    });
});
