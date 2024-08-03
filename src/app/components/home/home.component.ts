import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DBService } from '../../services/db.service';
import { AdminInformation } from '../../interfaces/admin-information';


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

  DBService: DBService = inject(DBService);

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private renderer: Renderer2,
    private _dialog: MatDialog,
    private _router: Router
    ){
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
    this.renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100dvh - '+this.toolbarHeight+'px - 20px)');

    // Check if should show stream or Kahoot dialog
    this.DBService.getAdmin().then((adminInfo: AdminInformation | any) => {
      if (adminInfo.showKahoot) {
        // Prompt dialog to verify if user wants to remove this comment
        this._dialog.open(DialogComponent, {
          data: {
            title: "Play Kahoot!",
            message: 'Kahoot is now opened for players to join!<br>Please join by clicking "Play Kahoot!"',
            button1: "Play Kahoot!",
            button1Color: "#fd7543",
            button1TextColor: "White",
            button2: "No Thanks",
            button2Color: "#f9f9f9",
            button2TextColor: "Black",
            input: false
          }
        }).afterClosed().subscribe(result => {
          if (result.button1 !== '' && result.button1 !== null && result.button1 !== false && result.button1 !== 'undefined') {
             // Utilize kahoot pin from admin info
            window.open('https://kahoot.it/?pin='+adminInfo.kahootPin+'&refer_method=link', "_blank");
          }
        })
      }

      if (adminInfo.showStream) {
        // Prompt dialog to verify if user wants to remove this comment
        this._dialog.open(DialogComponent, {
          data: {
            title: "Watch the Wedding Ceremony!",
            message: 'Our Wedding is taking place now!<br>Please watch our ceremony stream by clicking "Watch Stream"',
            button1: "Watch Stream",
            button1Color: "#fd7543",
            button1TextColor: "White",
            button2: "No Thanks",
            button2Color: "#f9f9f9",
            button2TextColor: "Black",
            input: false
          }
        }).afterClosed().subscribe(result => {
          if (result.button1 !== '' && result.button1 !== null && result.button1 !== false && result.button1 !== 'undefined') {
            this._router.navigateByUrl('/stream')
          }
        })
      }

    })
  }
}
