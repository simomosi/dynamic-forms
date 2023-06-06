export interface Subject {
    notify: (subjectName: string) => Promise<void>,
    attach: (observer: Observer) => void,
    //detach: (observer: Observer) => void // TODO
}

export interface Observer {
    update: (data: object, subjectName: string|null) => Promise<void>,
    attach: (subject: Subject) => void,
    // detach: (subject: Subject) => void
}

/**
 * It may look like there is some confusion on the Observer pattern.
 * Actually I'm still thinking about who's gonna listen:
 * - each field for itself, or
 * - the form as a delegate
 */