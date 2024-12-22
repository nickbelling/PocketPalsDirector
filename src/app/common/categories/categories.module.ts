import { NgModule } from '@angular/core';
import { CategoryList, CategoryListItem } from './categories';

@NgModule({
    imports: [CategoryList, CategoryListItem],
    exports: [CategoryList, CategoryListItem],
})
export class CategoriesModule {}
