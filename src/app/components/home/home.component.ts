import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


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
  <img class="horizontal-center" src="../assets/weddingmotelgraphic.webp"><img>

    <div class="btn-group-vertical">
      <button mat-raised-button [routerLink]="['/shoot']" class="btn-home-style">
        <mat-icon svgIcon="camera" inline="true" class="mat-icon"></mat-icon>
        <span class="button-text">Take a photo!</span>
      </button>
      <button mat-raised-button [routerLink]="['/upload']" class="btn-home-style">
        <mat-icon svgIcon="upload" inline="true" class="mat-icon"></mat-icon>
        <span class="button-text">Upload to Gallery</span>
      </button>
      <button mat-raised-button [routerLink]="['/gallery']" class="btn-home-style">
        <mat-icon svgIcon="gallery" inline="true" class="mat-icon"></mat-icon>
        <span class="button-text">Gallery</span>
      </button>
    </div>
  `,
  styleUrl: './home.component.css'
})

export class HomeComponent {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer){
    this.matIconRegistry.addSvgIcon(
      'camera',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/camera.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'upload',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/upload.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'gallery',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/gallery.svg")
    );
  }
}
