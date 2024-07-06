import { Component, ElementRef, ViewChild, Input, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryInformation } from '../../interfaces/gallery-information';
import { GalleryComment } from '../../interfaces/gallery-comment';
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
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { InfiniteScrollDirective } from "ngx-infinite-scroll";


@Component({
  selector: 'app-gallery-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    InfiniteScrollDirective
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
      <mat-card #matCard>
        <div id="galleryContainer" #galleryContainer class="gallery-container">
          <div [hidden]="!imgLoaded">
            <img [hidden]="!imgLoaded" #gallery class="listing-gallery" id="gallery" src="https://morrisapps.ddns.net/photos/thumbs/{{galleryInformation.id}}.jpg"
              [name]="[galleryInformation.id]" (load)="onLoad()">
            <!-- If cookie is present, then this user is either the author or admin and show delete button -->
            @if (getLocalStorage().getItem(this.galleryInformation.id) == "true" || getLocalStorage().getItem("admin") == "true") {
              <button mat-fab class="remove-button" (click)="remove()" style="width: 50px; height: 50px; background-color: red">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </div>
        </div>
        <div style="position: relative; margin-top: -20px;">
          <div [style.visibility]="(isServerOperation) ? 'hidden' : 'visible' ">
            <mat-card-content>
              <mat-card-subtitle style="margin-top:10px; padding-top: 5px;">Photographer: {{galleryInformation.author}}</mat-card-subtitle>
            </mat-card-content>
            <mat-card-actions style="margin-top: -40px;">
              <mat-card-subtitle *ngIf="this.galleryInformation.likes > 0" style="margin-left:8px; margin-top: 30px" >Likes:</mat-card-subtitle>
              <mat-card-subtitle [@shake]="this.likePressed" *ngIf="this.galleryInformation.likes > 0" style="margin-left:3px; margin-top: 30px" >{{galleryInformation.likes}}</mat-card-subtitle>
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
            <mat-card-actions style="margin-top: -10px;">
              <div #commentsDiv class="scroll-div" style="margin-left: 3px; width:100%; z-index: 2;">
                @if (this.galleryInformation.comments.length == 0) {
                  <p class="center-content" style="margin-bottom: 5px; margin-top: 5px;">Be the first to comment!</p>
                }
                @if (this.galleryInformation.comments.length > 0) {
                  <div style="max-height: 150px;">
                    <div class="center-content" style="width:100%">
                      <button mat-stroked-button *ngIf="showMore" class="comment-more" (click)="commentsScrollToNext()">More</button>
                    </div>
                    <p *ngFor="let galleryComment of this.galleryInformation.comments" class="comment-p">
                      <span>
                        <strong>{{galleryComment.author}}</strong>
                        {{galleryComment.comment}}
                      </span>
                      <br>
                      <!-- If cookie is present, then this user is either the author or admin and show delete -->
                      @if (getLocalStorage().getItem(galleryComment.id) == "true" || getLocalStorage().getItem("admin") == "true") {
                        <span>
                          <a href="javascript:void(0);" (click)="deleteComment(galleryComment.id)">
                            Delete
                          </a>
                        </span>
                      }

                    </p>
                  </div>
                }
              </div>
            </mat-card-actions>
            <mat-card-actions style="margin-bottom: -5px; margin-top: -20px;">
              <mat-form-field style="width: 100%; z-index: 0">
                <mat-label>Add a comment</mat-label>
                <input matInput maxlength="100" #comment type="text" [(ngModel)]="newComment">
                  <button matSuffix mat-icon-button (click)="patchComment()" color="accent" [disabled]="newComment.length == 0">
                    <mat-icon >send</mat-icon>
                  </button>
                  <!-- @if (newComment) {
                    <mat-hint align="start"><strong>Don't disclose personal info</strong> </mat-hint>
                  } -->
                  @if (newComment) {
                    <mat-hint align="end">{{comment.value.length}} / 100</mat-hint>
                  }
              </mat-form-field>
            </mat-card-actions>
          </div>
          <!-- Database operation spinner -->
          <mat-spinner *ngIf="isServerOperation" class="center-spinner" color="accent" style="top: calc(50% - 40px); left: calc(50% - 30px); z-index: 2;" [diameter]="60"/>
        </div>

      </mat-card>
    </section>
    <!-- Image loading spinner -->
    <mat-spinner *ngIf="!imgLoaded" class="center-spinner"/>
  </div>


`,
  styleUrl: './gallery-card.component.css'
})
export class GalleryCardComponent {
  @Input() galleryInformation!: GalleryInformation;

  PhotoService: PhotoService = inject(PhotoService);

  imgLoaded: boolean;
  likePressed: boolean;

  isServerOperation: boolean = false;

  showMore: boolean = false;

  galleryHeight: string;

  newComment: string = "";

  @ViewChild('matCard', { read: ElementRef }) matCard!:ElementRef;
  @ViewChild('galleryContainer', { read: ElementRef }) galleryContainer!:ElementRef;
  @ViewChild('galleryDiv', { read: ElementRef }) galleryDiv!:ElementRef;
  @ViewChild('gallery', { read: ElementRef }) gallery!:ElementRef;
  @ViewChild('likeIcon', { read: ElementRef }) likeIcon!:ElementRef;
  @ViewChild('commentsDiv', { read: ElementRef }) commentsDiv!:ElementRef;

  constructor(
    private _dialog: MatDialog,
    private _router: Router,
    private _uploadService: FileuploadService,
    private _snackBar: MatSnackBar,
  ) {
    this.imgLoaded = false
    this.likePressed = false
    this.galleryHeight = ""
  }

  onLoad() {
    // Set gallery container's height to auto so that it sizes to image
    this.galleryContainer.nativeElement?.style.setProperty('height', "auto")

    this.imgLoaded = true

    this.checkMoreScroll()

    // Set scroll event for comments
    this.commentsDiv?.nativeElement.addEventListener("scroll", () => {
      // Check if more element should be visible
      this.checkMoreScroll()
    });
  }

  commentsScrollToBottom() {
    const maxScroll = this.commentsDiv?.nativeElement.scrollHeight;
    this.commentsDiv?.nativeElement.scrollTo({ top: maxScroll })
  }

  commentsScrollToNext() {
    this.commentsDiv?.nativeElement.scrollTo({ top: this.commentsDiv?.nativeElement.scrollTop + 60, behavior: "smooth" })
  }

  deleteComment(id: string) {
    // Prompt dialog to verify if user wants to remove this comment
    this._dialog.open(DialogComponent, {
      data: {
        title: "Delete this Comment?",
        message: "Are you sure you want to delete this comment?",
        button1: "Cancel",
        button1Color: "#EBEBEB",
        button1TextColor: "Black",
        button2: "Delete!",
        button2Color: "red",
        button2TextColor: "white",
        input: false
      }
    }).afterClosed().subscribe(async result => {
      if (result.button2) {
        let deleteIndex = this.galleryInformation.comments.findIndex(x => x.id === id);
        this.galleryInformation.comments.splice(deleteIndex, 1)

        this.isServerOperation = true

        this.PhotoService.patchComments(this.galleryInformation.id, this.galleryInformation.comments).then(async () => {
          // Removes cookie flag for this comment
          localStorage.removeItem(id)

          // Wait half a second before hidding spinner. Prevents flashing
          setTimeout(() => {
            this.isServerOperation = false
          }, 500);
        })
      }
    });
  }

  // Used only to return localStorage into angular template
  getLocalStorage() {
    return localStorage
  }

  async patchComment() {
    let date = new Date()
    let dformat = [date.getMonth()+1,
      date.getDate(),
      date.getFullYear()].join('/') + ' ' +
     [date.getHours(),
      date.getMinutes(),
      date.getSeconds()].join(':') + '-' +
      date.getMilliseconds();

    await this.setUserName()

    const galleryComment = { id: dformat, comment: this.newComment, author: localStorage.getItem('User') } as GalleryComment
    if (this.galleryInformation.comments == undefined) {
      this.galleryInformation.comments = []
    }
    this.galleryInformation.comments.push(galleryComment)

    this.isServerOperation = true

    this.PhotoService.patchComments(this.galleryInformation.id, this.galleryInformation.comments).then(async () => {
      // Forces a new reference for the array object and triggers viewport to refresh
      this.galleryInformation.comments = [...this.galleryInformation.comments]

      // Sets cookie with id of comment. Triggers delete button if cookie is found on view.
      localStorage.setItem(dformat,"true")

      this.commentsScrollToBottom()
      this.newComment = ""

      // Wait half a second before hidding spinner. Prevents flashing
      setTimeout(() => {
        this.isServerOperation = false
      }, 500);
    })
  }

  async setUserName() {
    return new Promise<void>((resolve, reject) => {
      // Get user
      let user = localStorage.getItem('User')
      if (user == undefined || user == "" || user == "Anonymous") {
        // Prompt dialog to verify if user wants to enter name
        this._dialog.open(DialogComponent, {
          data: {
            title: "Enter a name?",
            message: 'Do you want to enter your name for this comment?</br>Or, you can stay "Anonymous".',
            button1: "Ok",
            button1Color: "#fd7543",
            button1TextColor: "White",
            button1Width: "125px",
            button2: "Anonymous",
            button2Color: "#f9f9f9",
            button2TextColor: "Black",
            input: true,
            inputPlaceHolder: "Name"
          }
        }).afterClosed().subscribe(async result => {
          if (result.input !== '' && result.input !== null && result.input !== false && result.input !== 'undefined') {
            localStorage.setItem('User', result.input)
            resolve()
          } else {
            localStorage.setItem('User', 'Anonymous')
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  commentScrollEvent(event: any) {
    this.checkMoreScroll()
  }

  checkMoreScroll() {
    // Check if scrollbar for comments is shown, if so enable more element
    let commentsDivElement = this.commentsDiv?.nativeElement
    if (commentsDivElement.scrollHeight > commentsDivElement.clientHeight) {
      if (commentsDivElement.scrollTop +10 >= (commentsDivElement.scrollHeight - commentsDivElement.offsetHeight)) {
        this.showMore = false
      } else {
        this.showMore = true
      }
    }
  }

  remove() {
    // Prompt dialog to verify if user wants to remove this picture
    this._dialog.open(DialogComponent, {
      data: {
        title: "Delete this picture?",
        message: "Do you want to delete this picture and stop it from displaying in the gallery and on the venue screens?",
        button1: "Cancel",
        button1Color: "#EBEBEB",
        button1TextColor: "Black",
        button2: "Delete!",
        button2Color: "red",
        button2TextColor: "white",
        input: false
      }
    }).afterClosed().subscribe(async result => {
      if (result.button2) {
        // Remove picture from JSON server
        this.PhotoService.remove(this.galleryInformation.id).then(async () => {
          // Remove picture and thumbnail
          (await this._uploadService.removeFile(this.galleryInformation.id))
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
    if (this.galleryInformation.likes == null || this.galleryInformation.likes == undefined) {
      this.galleryInformation.likes = 0
    }
    // Get localStorage by card name. If present, then has already liked.
    let isLiked = localStorage.getItem(this.galleryInformation.id+"like")

    this.likePressed = true
    setTimeout(() => {
      this.likePressed = false
    }, 800);

    if (isLiked != "true") {
      // Add Like
      this.galleryInformation.likes += 1
      this.PhotoService.patchLikes(this.galleryInformation.id, true)
      // Flag localStorage as this gallery has been liked.
      localStorage.setItem(this.galleryInformation.id+"like", "true")
      // Set icon to represent change
      this.likeIcon.nativeElement.textContent = "favorite"
    } else {
      // Remove Like
      if (this.galleryInformation.likes > 0) {
        this.galleryInformation.likes -= 1
        this.PhotoService.patchLikes(this.galleryInformation.id, false)
        // Flag localStorage as this card has been liked.
        localStorage.setItem(this.galleryInformation.id+"like", "false")
        // Set icon to represent change
        this.likeIcon.nativeElement.textContent = "favorite_border"
      }
    }

  }

  download() {
    const a = document.createElement('a')
    a.href = "https://morrisapps.ddns.net/photos/full/"+this.galleryInformation.id+".jpg"
    a.download = this.galleryInformation.id+"-full.jpg"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }


  ngAfterViewInit(){
    // set Material Card size while loading photo
    if (this.galleryInformation.height != 0 && this.galleryInformation.height != null && this.galleryInformation.width != 0 && this.galleryInformation.width != null) {
      // Set height using galleryInformation
      let height = (this.matCard.nativeElement.clientWidth * this.galleryInformation.height / this.galleryInformation.width)
      this.galleryContainer.nativeElement?.style.setProperty('height',  height+"px")
    } else {
      // Default size if no galleryInformation
      this.galleryContainer.nativeElement?.style.setProperty('height', '400px')
    }

    // Set initial liked icon
    let isLiked = localStorage.getItem(this.galleryInformation.id+"like")
    if (isLiked == "true") {
      this.likeIcon.nativeElement.textContent = "favorite"
    } else {
      this.likeIcon.nativeElement.textContent = "favorite_border"
    }

  }

  ngOnInit(){
    if (this.galleryInformation.comments == undefined) {
      this.galleryInformation.comments = []
    }
  }
}
