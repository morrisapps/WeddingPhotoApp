import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
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

  <div #rootDiv class="root-div" >
    <img style="max-width: 95%;" class="center" src="../assets/weddingmotelgraphic.png"><img>
    <div class="footer">
      <div class="btn-group-vertical">
        <button mat-raised-button [routerLink]="['/shoot']" class="btn-home-style">
          <mat-icon svgIcon="camera" inline="true" class="mat-icon"></mat-icon>
          <span style="line-height: 0px;" class="button-text">Take a photo!</span>
        </button>
        <button mat-raised-button [routerLink]="['/upload']" class="btn-home-style">
          <mat-icon svgIcon="upload" inline="true" class="mat-icon"></mat-icon>
          <span style="line-height: 0px;" class="button-text">Upload Photos</span>
        </button>
        <button mat-raised-button [routerLink]="['/gallery']" class="btn-home-style">
          <mat-icon svgIcon="gallery" inline="true" class="mat-icon"></mat-icon>
          <span style="line-height: 0px;" class="button-text">Gallery</span>
        </button>
      </div>
    </div>
  </div>



  `,
  styleUrl: './home.component.css'
})

export class HomeComponent {
  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  toolbarHeight = localStorage.getItem("toolbarHeight")

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private renderer: Renderer2){
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

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }
}
