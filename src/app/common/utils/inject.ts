import { assertInInjectionContext, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/**
 * Injects any provided route data directly into the component and makes it
 * available as a Signal. A shortcut to skip getting the `Observable` from
 * `ActivatedRoute` and subscribing to it.
 */
export function injectRouteData<T>(): Signal<T> {
    assertInInjectionContext(injectRouteData);
    const route = inject(ActivatedRoute);
    const data = route.data;
    return toSignal(data) as Signal<T>;
}
