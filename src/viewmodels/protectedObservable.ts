import * as ko from "knockout";

export interface KnockoutProtectedObservable<T> extends KnockoutObservable<T> {
    commit() : void;
    reset() : void;
}

export function protectedObservable(value: any) : KnockoutProtectedObservable<any> {
    let current : KnockoutProtectedObservable<any> = ko.observable(value) as KnockoutProtectedObservable<any>;
    let original = value;

    current.commit = function() : void {
        original = current();
    };

    current.reset = function() : void {
        current(original);
    };

    return current;
}
