import { Component, ElementRef, ViewChild, Input, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoInformation } from '../../interfaces/photo-information';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PhotoService } from '../../services/photo.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  animations: [
    trigger('shake', [
      state('0', style({})),
      state('1', style({})),
      transition('0 => 1', animate('800ms ease-out', keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateY(-2px) scale(1.2)', offset: 0.25 }),
        style({ transform: 'translateY(-2px) rotate(17deg) scale(1.2)', offset: 0.35 }),
        style({ transform: 'translateY(-2px) rotate(-17deg) scale(1.2)', offset: 0.55 }),
        style({ transform: 'translateY(-2px) rotate(17deg) scale(1.2)', offset: 0.65 }),
        style({ transform: 'translateY(-2px) rotate(-17deg) scale(1.2)', offset: 0.75 }),
        style({ transform: 'translateY(0) rotate(0) scale(1.0)', offset: 1 }),
      ])))
    ])
  ],
  template: `
  <div #photoDiv class="photo-div">
    <section>
      <mat-card #matCard >

        <div id="photoContainer" #photoContainer class="photo-container">
          <div [hidden]="!imgLoaded">
            <img [hidden]="!imgLoaded" #photo class="listing-photo" id="photo" src="https://morrisapps.ddns.net/photos/thumbs/{{photoInformation.id}}.jpg"
              [name]="[photoInformation.id]" (load)="onLoad()">
          </div>
          <button mat-fab class="remove-button" *ngIf="isRemovable" (click)="remove()" style="width: 50px; height: 50px; background-color: red">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
        <mat-card-content>
          <mat-card-subtitle style="margin-top:10px; padding-top: 5px;">Photographer: {{photoInformation.author}}</mat-card-subtitle>
        </mat-card-content>
        <mat-card-actions style="margin-top: -40px;">
          <mat-card-subtitle *ngIf="this.photoInformation.likes > 0" style="margin-left:8px; margin-top: 30px" >Likes:</mat-card-subtitle>
          <mat-card-subtitle [@shake]="this.likePressed" *ngIf="this.photoInformation.likes > 0" style="margin-left:3px; margin-top: 30px" >{{photoInformation.likes}}</mat-card-subtitle>
          <span style="flex: 1 1 auto;"></span>
          <div class="circle-div" style="margin-right: 2%;">
            <button mat-fab (click)="updateLikes()" class="circle-button">
              <mat-icon #likeIcon>favorite</mat-icon>
            </button>
          </div>
          <div class="circle-div">
            <button mat-fab id="save" (click)="download()" class="circle-button">
              <mat-icon>get_app</mat-icon>
            </button>
          </div>

        </mat-card-actions>
      </mat-card>
    </section>
    <mat-spinner *ngIf="!imgLoaded" class="center-spinner"></mat-spinner>
  </div>


`,
  styleUrl: './photo-card.component.css'
})
export class PhotoCardComponent {
  @Input() photoInformation!: PhotoInformation;

  PhotoService: PhotoService = inject(PhotoService);

  imgLoaded: boolean;
  likePressed: boolean;

  isRemovable: boolean = false;

  photoHeight: string;

  @ViewChild('matCard', { read: ElementRef }) matCard!:ElementRef;
  @ViewChild('photoContainer', { read: ElementRef }) photoContainer!:ElementRef;
  @ViewChild('photoDiv', { read: ElementRef }) photoDiv!:ElementRef;
  @ViewChild('photo', { read: ElementRef }) photo!:ElementRef;
  @ViewChild('likeIcon', { read: ElementRef }) likeIcon!:ElementRef;

  constructor(
    private _dialog: MatDialog,
    private _router: Router,
    private _uploadService: FileuploadService,
    private _snackBar: MatSnackBar,
  ) {
    this.imgLoaded = false
    this.likePressed = false
    this.photoHeight = ""
  }

  onLoad() {
    // Set photo container's height to auto so that it sizes to image
    this.photoContainer.nativeElement?.style.setProperty('height', "auto")

    this.imgLoaded = true
  }


  remove() {
    // Prompt dialog to verify if user wants to remove this picture
    this._dialog.open(DialogComponent, {
      data: {
        title: "Delete this picture?",
        message: "Do you want to delete this picture and stop it from displaying in the gallery and on the venue screens?",
        closeButton: "Cancel",
        closeButtonColor: "#EBEBEB",
        closeButtonTextColor: "Black",
        yesButton: "Delete!",
        yesButtonColor: "red",
        yesButtonTextColor: "white"
      }
    }).afterClosed().subscribe(async result => {

      if (result) {
        // Remove picture from JSON server
        this.PhotoService.remove(this.photoInformation.id).then(async () => {
          // Remove picture and thumbnail
          (await this._uploadService.removeFile(this.photoInformation.id))
          .subscribe(async (res: any) => {
            // Refresh gallery
            this._router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
              this._router.navigate(['/gallery'])
              this._snackBar.open("Photo deleted from gallery!", "", {
                duration: 4000,
                panelClass: 'upload-snackbar',
                verticalPosition: 'top'
              });
            })
          })
        })
      }
    });
  }

  updateLikes() {
    // Check if likes are null, if they are set to zero so that it can be incremented on.
    if (this.photoInformation.likes == null || this.photoInformation.likes == undefined) {
      this.photoInformation.likes = 0
    }
    // Get localStorage by photo name. If present, then has already liked.
    let isLiked = localStorage.getItem(this.photoInformation.id+"like")

    this.likePressed = true
    setTimeout(() => {
      this.likePressed = false
    }, 800);

    if (isLiked != "true") {
      // Add Like
      this.photoInformation.likes += 1
      this.PhotoService.patchLikes(this.photoInformation.id, true)
      // Flag localStorage as this photo has been liked.
      localStorage.setItem(this.photoInformation.id+"like", "true")
      // Set icon to represent change
      this.likeIcon.nativeElement.textContent = "favorite"
    } else {
      // Remove Like
      if (this.photoInformation.likes > 0) {
        this.photoInformation.likes -= 1
        this.PhotoService.patchLikes(this.photoInformation.id, false)
        // Flag localStorage as this photo has been liked.
        localStorage.setItem(this.photoInformation.id+"like", "false")
        // Set icon to represent change
        this.likeIcon.nativeElement.textContent = "favorite_border"
      }
    }

  }

  download() {
    const a = document.createElement('a')
    a.href = "http://morrisapps.ddns.net/photos/full/"+this.photoInformation.id+".jpg"
    a.download = this.photoInformation.id+"-full.jpg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }


  ngAfterViewInit(){
    // set Material Card size while loading photo
    if (this.photoInformation.height != 0 && this.photoInformation.height != null && this.photoInformation.width != 0 && this.photoInformation.width != null) {
      // Set height using photoInformation
      let height = (this.matCard.nativeElement.clientWidth * this.photoInformation.height / this.photoInformation.width)
      this.photoContainer.nativeElement?.style.setProperty('height',  height+"px")
    } else {
      // Default size if no photoInformation
      this.photoContainer.nativeElement?.style.setProperty('height', '400px')
    }

    // Set initial liked icon
    let isLiked = localStorage.getItem(this.photoInformation.id+"like")
    if (isLiked == "true") {
      this.likeIcon.nativeElement.textContent = "favorite"
    } else {
      this.likeIcon.nativeElement.textContent = "favorite_border"
    }

  }

  ngOnInit(){
    // Set removable flag if user has taken this photo and is still within their localStorage.
    if (localStorage.getItem(this.photoInformation.id) == "true" || localStorage.getItem("admin") == "true") {
      this.isRemovable = true;
    } else {
      this.isRemovable = false;
    }

  }
}
