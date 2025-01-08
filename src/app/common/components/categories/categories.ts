import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    contentChildren,
    ElementRef,
    inject,
    input,
} from '@angular/core';
import { FitTextDirective } from '../../directives';

/**
 * A container for a set of categories. Handles any number of items and takes
 * care of resizing the elements so they all fit neatly on-screen.
 */
@Component({
    selector: 'categories',
    imports: [CommonModule, FitTextDirective],
    templateUrl: './categories.html',
    styleUrl: './categories.scss',
})
export class CategoryList {
    protected categories = contentChildren(CategoryListItem);
}

/**
 * A single category.
 *
 * TODO: implement styling options
 */
@Component({
    selector: 'category',
    template: '<ng-content />',
})
export class CategoryListItem {
    private _element = inject(ElementRef);
    public readonly text = computed(() => {
        if (this._element) {
            return this._element.nativeElement.innerText;
        } else {
            return '';
        }
    });
    public readonly selected = input.required<boolean>();
}
