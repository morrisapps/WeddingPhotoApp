import { Component, inject, ElementRef, ViewChild, Renderer2 } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import  {MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from "../dialog/dialog.component";
import { ReactiveFormsModule } from '@angular/forms';
import { DBService } from '../../services/db.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from "@angular/platform-browser";
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-shoot',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
  <div #rootDiv class="root-div">
    <input hidden (change)="post()" #fileInput type="file" accept="image/*" capture="environment">

    <div [hidden]="!showCheck" style="width: 95vw; max-width: 400px;" class="center" #successDiv>
      <mat-card >
      <div class="success center-content" >
          <svg viewBox="0 0 130.2 130.2">
            <circle
              class="path circle"
              fill="none"
              stroke="#508a33"
              stroke-width="7"
              stroke-miterlimit="10"
              cx="65.1"
              cy="65.1"
              r="62.1"
            />
            <polyline
              class="path check"
              fill="none"
              stroke="#508a33"
              stroke-width="7"
              stroke-linecap="round"
              stroke-miterlimit="10"
              points="100.2,40.2 51.5,88.8 29.8,67.5"
            />
          </svg>
          <div style="padding-top: 4px; padding-left: 10px;">Saved to gallery!</div>
        </div>
        <img id="photoImg" #photoImg style="min-width: 100%; width: 100%; object-fit: cover; max-height: calc(70dvh - 100px);  overflow: hidden;"/>
        <mat-card-footer style="margin-top: 25px;">
          <div class="center-content">
            <div>
              <button mat-raised-button style="margin-bottom: 15px; background-color: #E4FFC4"  id="save" (click)="fileInput.click()" class="button">
                <mat-icon svgIcon="anotherphoto" inline="true" class="icon"></mat-icon>
                <span class="button-text">Take another!</span>
              </button>
              <button mat-raised-button style="background-color: #CDE0F3" [routerLink]="['/gallery']" class="button">
                <mat-icon svgIcon="viewgallery" inline="true" class="icon"></mat-icon>
                <span class="button-text">View in Gallery</span>
              </button>
            </div>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>

    <div [hidden]="hidden" style="width: 95vw; max-width: 400px;" class="center">
      <mat-card >
        <mat-card-title class="center-content">What's your name?</mat-card-title>
        <mat-card-content style="margin-bottom: 20px">
          <p class="center-content">
              <input style="width: 95%; height: 40px; font-size: 20px; text-align: center;" maxlength="20" #nameInput type="text" matInput placeholder="name" id="nameInput" (input)="NameInput($event)">
          </p>
        </mat-card-content>
        <mat-card-footer>
          <div class="center-content">
            <button #takePictureButton [hidden]="takeButtonDisabled" type="button" mat-raised-button (click)="fileInput.click()" id="takePictureButton" class="button" style="margin-left: 20px; margin-right: 20px; margin-bottom: 20px; width: 95vw; background-color: #E4FFC4;">
              <mat-icon svgIcon="camerapicture" inline="true" class="icon"></mat-icon>
              <span style="line-height: 0px;">Take a Picture!</span>
            </button>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>

    <mat-spinner class="center" [ngStyle]="{'top': 'calc( 50% - '+toolbarHeight+'px)'}" *ngIf="showSpinner"></mat-spinner>
  </div>
  `,
  styleUrl: './shoot.component.css'
})


export class ShootComponent {
  @ViewChild('nameInput', { read: ElementRef }) nameInput!:ElementRef;
  @ViewChild('fileInput', { read: ElementRef }) fileInput!:ElementRef;
  @ViewChild('photoImg', { read: ElementRef }) photoImg!:ElementRef;
  @ViewChild('successDiv', { read: ElementRef }) successDiv!:ElementRef;


  DBService: DBService = inject(DBService);
  photoBase64: string = "";

  hidden: boolean = false;
  showCheck = false;
  showSpinner: boolean = false;

  showUpload: boolean = false;

  uploadType: string = "";

  takeButtonDisabled: boolean = true;
  file?: File;
  date = new Date();

  req = new XMLHttpRequest();

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  toolbarHeight = "0"

  constructor(
    private _snackBar: MatSnackBar,
    private _uploadService: FileuploadService,
    private _renderer: Renderer2,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private _dialog: MatDialog
  ) {
    // Import svg icons
    this.matIconRegistry.addSvgIcon(
      'anotherphoto',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/anotherphoto.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'viewgallery',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/viewgallery.svg")
    );
    this.matIconRegistry.addSvgIcon(
      'camerapicture',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/camerapicture.svg")
    );

  }


  openSnackBar(message: string, action: string = "", timeout: number = 500, duration: number = 5000) {
    setTimeout(() => {
      this._snackBar.open(message, action, {
        duration: duration,
        panelClass: 'snackbar',
        verticalPosition: 'top'
      });
    }, timeout);
  }

  // Save picture
  async post() {
    const cameraFileInput = this.fileInput.nativeElement

    const fileExtensionlastIndex = cameraFileInput.files![0].name.lastIndexOf(".");
    const fileName = Date.now().toString()+cameraFileInput.files![0].name.slice(0, fileExtensionlastIndex);
    const fileExtension = cameraFileInput.files![0].name.slice(fileExtensionlastIndex);

    const file = cameraFileInput.files![0]

    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then(async (result) => {
      if (!result) {
        this.showCheck = false
        this.hidden = true
        this.showSpinner = true

        // Read the Blob as DataURL using the FileReader API
        const reader = new FileReader();

        reader.onloadend = async () => {
            // Get full file base 64
            const MEDIA_BASE_64 = reader.result as string

            // Save file using express multer (fileupload service)
            // Upload file
            (await this._uploadService.uploadFiles(MEDIA_BASE_64, fileName+fileExtension as string, file.type))
            .subscribe({
              next: (res) => {
                this.photoImg.nativeElement.onload = () => {
                  // Post to json server
                  this.DBService.post(fileName, fileExtension, file.type, this.photoImg.nativeElement.width, this.photoImg.nativeElement.height).then(async () => {
                    // Posted file to DB, stop spinner and show snackbar, remove from data service

                    // Set localStorage with photo name to flag that this user posted this file.
                    // Triggers delete button in gallery
                    localStorage.setItem(fileName, "true");

                    this.showSpinner = false
                    // Open snackbar with random success message
                    const successMessages = [
                      "Groovy Shot! 📸",
                      "Hey man, nice shot! 🤛😎",
                      "Psychedelic! ☮️✌️",
                      "Vibing photo! 🎨",
                      "🔭 Far out shot!! 👀",
                      "🌻 Flower power photo! 💐",
                      "Peace and Love 🫶☮️",
                      "☮️🌈 Hippy shot! 🌈☮️",
                      "Rad shooting! ✌️👍",
                      "Right on, man! 👍😎",
                      "🪩🕺💃",
                      "Oh, behave!",
                      "Fab",
                      "Gnarly",
                      "Groovy Baby!"
                    ]
                    this.openSnackBar(successMessages[Math.floor(Math.random()*successMessages.length)])

                    this.hidden = true
                    this.showCheck = true
                  })
                }
                this.photoImg.nativeElement.src = "https://granted.photos/photos/full/"+fileName+fileExtension
              },
              error: (res) => {
                this._dialog.open(DialogComponent, {
                  data: {
                    title: "Error",
                    message: "An issue occured when uploading this picture.<br>Please try again.",
                    button1: "Okay",
                    button1Color: "#fd7543",
                    button1TextColor: "White"
                  }
                })
                this.showSpinner = false
                this.showCheck = false
                this.hidden = false
              }
            })
        }

        // Compress file
        imageCompression(file, {
          maxSizeMB: 1
        })
        .then(function (compressedFile) {
          // Gather photo file as blob for reader
          var blob = compressedFile.slice(0, compressedFile.size, 'image/jpg');
          reader.readAsDataURL(blob);
        })
        .catch(function (error) {
          console.log("Failed to compress: "+error+"\nUsing uncompressed file.");
          // Attempt using un-compressed file
          var blob = file.slice(0, file.size, 'image/jpg');
          reader.readAsDataURL(blob);
        });

      }
    })
  }

  // User name form
  NameInput(event: any): void {
    let username = event.target.value
    // Sets user in storage
    localStorage.setItem('User', username)
    if (username) {
      // Makes take picture button not disabled
      this.takeButtonDisabled = false
    } else {
      this.takeButtonDisabled = true
    }
  }

  ngOnInit() {
    this.toolbarHeight = localStorage.getItem("toolbarHeight") as string

    if (localStorage.getItem('User')) {
      // Makes take picture button not disabled
      this.takeButtonDisabled = false
    }

  }

  ngAfterViewInit() {
    // When selecting name input, make all text highlighted
    let nameInput = document.getElementById("nameInput") as HTMLInputElement
    nameInput.addEventListener(`focus`, () => nameInput.select());

    if (localStorage.getItem('User')) {
      // Set input text to User name
      this._renderer.setProperty(this.nameInput.nativeElement, 'value', localStorage.getItem('User'));
    }
    // set root div height minus 20 px margin
    this._renderer.setStyle(this.rootDiv.nativeElement, 'height', 'calc(100dvh - '+this.toolbarHeight+'px - 20px)');

    // Set successDiv margin to best center
    this._renderer.setStyle(this.successDiv.nativeElement, 'margin-top', 'calc('+this.toolbarHeight+'px / 2)');
  }

}
