import { assertInInjectionContext, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

export function injectRouteData<T>(): Signal<T> {
    assertInInjectionContext(injectRouteData);
    const route = inject(ActivatedRoute);
    const data = route.data;
    return toSignal(data) as Signal<T>;
}
