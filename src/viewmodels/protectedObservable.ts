import * as ko from "knockout";

export interface KnockoutProtectedObservable<T> extends KnockoutObservable<T> {
    commit() : void;
    reset() : void;
}

export function protectedObservable(value: any) : KnockoutProtectedObservable<any> {
    let actual : KnockoutProtectedObservable<any> = ko.observable(value) as KnockoutProtectedObservable<any>;
    let cache = value;

    actual.commit = function() : void {
        cache = actual();
    };

    actual.reset = function() : void {
        actual(cache);
    };

    return actual;
}
