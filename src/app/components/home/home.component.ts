import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <mat-card class="card-home-style">
    <div class="center">
      <div class="btn-group-vertical">
        <button mat-raised-button [routerLink]="['/']" class="btn-home-style">
          <mat-icon class="mr-2">filter_2</mat-icon>Home
        </button>
        <button mat-raised-button [routerLink]="['/shoot']" class="btn-home-style">
          <mat-icon class="mr-2">filter_2</mat-icon>Take a photo!
        </button>
        <button mat-raised-button [routerLink]="['/gallery']" class="btn-home-style">
          <mat-icon class="mr-2">filter_2</mat-icon>Gallery
        </button>
      </div>
    </div>
    </mat-card>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
