import { CommonModule } from '@angular/common';
import {
    Component,
    contentChildren,
    input,
    TemplateRef,
    viewChild,
} from '@angular/core';

@Component({
    selector: 'categories',
    imports: [CommonModule],
    templateUrl: './categories.html',
    styleUrl: './categories.scss',
})
export class CategoryList {
    protected categories = contentChildren(CategoryListItem);
}

@Component({
    selector: 'category',
    template: '<ng-template><ng-content /></ng-template>',
})
export class CategoryListItem {
    public template = viewChild(TemplateRef);
    public readonly selected = input.required<boolean>();
}
