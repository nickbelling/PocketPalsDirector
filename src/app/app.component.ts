import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BootstrapModule } from './common/bootstrap/bootstrap.module';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, BootstrapModule],
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {}
