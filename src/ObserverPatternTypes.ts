export interface Subject {
    notify: (subjectName: string) => Promise<void>,
    //attach: (observer: Observer) => void, // TODO
    //detach: (observer: Observer) => void // TODO
}

export interface Observer {
    update: (data: object, subjectName: string|null) => Promise<void>
}