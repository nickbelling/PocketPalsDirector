import { CommonModule } from '@angular/common';
import {
    Component,
    contentChildren,
    input,
    TemplateRef,
    viewChild,
} from '@angular/core';

/**
 * A container for a set of categories. Handles any number of items and takes
 * care of resizing the elements so they all fit neatly on-screen.
 */
@Component({
    selector: 'categories',
    imports: [CommonModule],
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
    template: '<ng-template><ng-content /></ng-template>',
})
export class CategoryListItem {
    public template = viewChild(TemplateRef);
    public readonly selected = input.required<boolean>();
}
