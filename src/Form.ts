import { UpdateData } from './FieldConfigurationTypes';

/**
 * An html form managed by the library, created by `makeForm`.
 *
 * `notify` and `manualUpdate` throw at once when the form has no field with the given name, and reject,
 * in this order of precedence, when the form was destroyed, is initialising, or is disabled.
 */
export interface Form {
    /**
     * Waits for the Initialisation of the form
     * @returns {Promise<void>} resolved when the Initialisation is complete, rejected if the form is destroyed first
     */
    ready(): Promise<void>;

    /**
     * Notifies the change of a field, which updates its observers and clears on cascade the fields beyond them
     * @param {string} subjectName the name of the changed field
     * @returns {Promise<void>} resolved when all updates are complete
     */
    notify(subjectName: string): Promise<void>;

    /**
     * Updates a single field with the given data, as a Manual Update: neither its observers nor the form hooks are involved
     * @param {UpdateData} data the data of the update
     * @param {string} subjectName the name of the field to update
     * @returns {Promise<void>} resolved when the field is updated
     */
    manualUpdate(data: UpdateData, subjectName: string): Promise<void>;

    /**
     * Destroys the form, so that a new one can be created for the same html form: removes its listeners,
     * unregisters it from getForm and aborts its remote calls in progress. Destroying it again does nothing.
     */
    destroy(): void;

    /**
     * Enables or disables the form. A disabled form ignores the changes of its fields, and its notify and manualUpdate reject;
     * the updates already running finish.
     * @param {boolean} enable true to enable the form, false to disable it
     */
    setEnabled(enable: boolean): void;

    /**
     * @returns {boolean} true if the form is enabled
     */
    isEnabled(): boolean;

    /**
     * @returns {string} the form id
     */
    getId(): string;
}
