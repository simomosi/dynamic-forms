import { FormBehavior } from "./FormConfigurationTypes";

export class FormConfigurationFixer {
    public fixBehavior(formBehavior: FormBehavior|undefined): FormBehavior {
        const behavior = formBehavior ?? {};
        behavior.beforeInit = behavior.beforeInit ?? (() => {});
        behavior.afterInit = behavior.afterInit ?? (() => {});
        behavior.beforeUpdate = behavior.beforeUpdate ?? ((subjectName) => true);
        behavior.afterUpdate = behavior.afterUpdate ?? ((subjectName) => {});
        return behavior;
    }
}