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
import { DBService } from '../../services/db.service';
import { FileuploadService } from '../../services/fileupload/fileupload.service';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';


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
    MatGridListModule
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
  <div #photoDiv class="gallery-div">
    <section>
      <mat-card #matCard>
        <div id="galleryContainer" #galleryContainer class="gallery-container">
          <!-- <video width="320" height="240" controls preload="metadata">
            <source src="https://granted.photos/videos/test.mp4#t=10.1" type="video/mp4">
          Your browser does not support the video tag.
          </video> -->
          <div [hidden]="!imgLoaded">
            <img [hidden]="!imgLoaded" #gallery class="listing-gallery" id="gallery" src="https://granted.photos/photos/thumbs/{{galleryInformation.id}}"
              [name]="[galleryInformation.id]" (load)="onLoad()">
            <!-- If cookie is present, then this user is either the author or admin and show delete button -->
            @if (getLocalStorage().getItem(this.galleryInformation.id) == "true" || getLocalStorage().getItem("adminDelete") == "true") {
              <button mat-fab class="remove-button" (click)="remove()" style="width: 50px; height: 50px; background-color: red">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </div>
        </div>
        <div style="position: relative; margin-top: -20px;">
          <div [style.visibility]="(isServerOperation) ? 'hidden' : 'visible' ">
            <!-- If cookie is present, then enable contest buttons -->
            @if (getLocalStorage().getItem("adminWinnerSelect") == "true" && !this.galleryInformation.isTemplate) {
              <mat-grid-list cols="2" rowHeight="50px" style="margin-left: -20px; margin-top: 40px;">
                <mat-grid-tile>
                  <button mat-raised-button #bestGroomBride class="contest-button" (click)="setBestGroomBride()" style="width: 120px; height: 30px;">
                    Best Groom & Bride
                  </button>
                </mat-grid-tile>
                <mat-grid-tile>
                  <button mat-raised-button #bestPhotoBooth class="contest-button" (click)="setBestPhotoBooth()" style="width: 120px; height: 30px;">
                    Best Photo Booth
                  </button>
                </mat-grid-tile>
                <mat-grid-tile>
                  <button mat-raised-button #goofiestPhoto class="contest-button" (click)="setGoofiestPhoto()" style="width: 120px; height: 30px;">
                    Goofiest Photo
                  </button>
                </mat-grid-tile>
                <mat-grid-tile>
                  <button mat-raised-button #grooviestPhoto class="contest-button" (click)="setGrooviestPhoto()" style="width: 120px; height: 30px;">
                    Grooviest Photo
                  </button>
                </mat-grid-tile>
              </mat-grid-list>
            }
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
                  <p class="center-content" style="margin-bottom: 5px; margin-top: 15px;">Be the first to comment!</p>
                }
                @if (this.galleryInformation.comments.length > 0) {
                  <div style="max-height: 150px;">
                    <div class="center-content" style="width:100%">
                      <button mat-stroked-button *ngIf="showMore" class="comment-more" (click)="commentsScrollToNext()">More</button>
                    </div>
                    <p *ngFor="let galleryComment of this.galleryInformation.comments" class="comment-p">
                      <span>
                        <strong>{{galleryComment.author}}</strong>
                        <span style="margin-left: 5px;">{{galleryComment.comment}}</span>
                      </span>
                      <br>
                      <!-- If cookie is present, then this user is either the author or admin and show delete -->
                      @if (getLocalStorage().getItem(galleryComment.id) == "true" || getLocalStorage().getItem("adminDelete") == "true") {
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

  DBService: DBService = inject(DBService);

  imgLoaded: boolean;
  likePressed: boolean;

  isServerOperation: boolean = false;

  showMore: boolean = false;

  galleryHeight: string;

  newComment: string = "";

  @ViewChild('matCard', { read: ElementRef }) matCard!:ElementRef;
  @ViewChild('galleryContainer', { read: ElementRef }) galleryContainer!:ElementRef;
  @ViewChild('likeIcon', { read: ElementRef }) likeIcon!:ElementRef;
  @ViewChild('commentsDiv', { read: ElementRef }) commentsDiv!:ElementRef;

  @ViewChild('bestGroomBride', { read: ElementRef }) bestGroomBride!:ElementRef;
  @ViewChild('bestPhotoBooth', { read: ElementRef }) bestPhotoBooth!:ElementRef;
  @ViewChild('goofiestPhoto', { read: ElementRef }) goofiestPhoto!:ElementRef;
  @ViewChild('grooviestPhoto', { read: ElementRef }) grooviestPhoto!:ElementRef;

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

  setBestGroomBride() {
    this.DBService.getContestWinners().then((result) => {
      // Determine if this media is already selected as winner
      if (!(result.bestGroomBride.filter(value => value.id == this.galleryInformation.id).length > 0)) {
        result.bestGroomBride.push(this.galleryInformation)

        this.DBService.patchContests("bestGroomBride", result.bestGroomBride).then(() => {

          this.bestGroomBride.nativeElement?.style.setProperty('background-color', '#6AC755')
        })
      } else {
        // Already selected, so now remove this media
        let deleteIndex = result.bestGroomBride.findIndex(x => x.id === this.galleryInformation.id);
        result.bestGroomBride.splice(deleteIndex, 1)
        this.DBService.patchContests("bestGroomBride", result.bestGroomBride).then(() => {

          this.bestGroomBride.nativeElement?.style.setProperty('background-color', 'white')
        })
      }
    })
  }

  setBestPhotoBooth() {
    this.DBService.getContestWinners().then((result) => {
      // Determine if this media is already selected as winner
      if (!(result.bestPhotoBooth.filter(value => value.id == this.galleryInformation.id).length > 0)) {
        result.bestPhotoBooth.push(this.galleryInformation)

        this.DBService.patchContests("bestPhotoBooth", result.bestPhotoBooth).then(() => {

          this.bestPhotoBooth.nativeElement?.style.setProperty('background-color', '#6AC755')
        })
      } else {
        // Already selected, so now remove this media
        let deleteIndex = result.bestPhotoBooth.findIndex(x => x.id === this.galleryInformation.id);
        result.bestPhotoBooth.splice(deleteIndex, 1)
        this.DBService.patchContests("bestPhotoBooth", result.bestPhotoBooth).then(() => {

          this.bestPhotoBooth.nativeElement?.style.setProperty('background-color', 'white')
        })
      }
    })
  }

  setGoofiestPhoto() {
    this.DBService.getContestWinners().then((result) => {
      // Determine if this media is already selected as winner
      if (!(result.goofiestPhoto.filter(value => value.id == this.galleryInformation.id).length > 0)) {
        result.goofiestPhoto.push(this.galleryInformation)

        this.DBService.patchContests("goofiestPhoto", result.goofiestPhoto).then(() => {

          this.goofiestPhoto.nativeElement?.style.setProperty('background-color', '#6AC755')
        })
      } else {
        // Already selected, so now remove this media
        let deleteIndex = result.goofiestPhoto.findIndex(x => x.id === this.galleryInformation.id);
        result.goofiestPhoto.splice(deleteIndex, 1)
        this.DBService.patchContests("goofiestPhoto", result.goofiestPhoto).then(() => {

          this.goofiestPhoto.nativeElement?.style.setProperty('background-color', 'white')
        })
      }
    })
  }

  setGrooviestPhoto() {
    this.DBService.getContestWinners().then((result) => {
      // Determine if this media is already selected as winner
      if (!(result.grooviestPhoto.filter(value => value.id == this.galleryInformation.id).length > 0)) {
        result.grooviestPhoto.push(this.galleryInformation)

        this.DBService.patchContests("grooviestPhoto", result.grooviestPhoto).then(() => {

          this.grooviestPhoto.nativeElement?.style.setProperty('background-color', '#6AC755')
        })
      } else {
        // Already selected, so now remove this media
        let deleteIndex = result.grooviestPhoto.findIndex(x => x.id === this.galleryInformation.id);
        result.grooviestPhoto.splice(deleteIndex, 1)
        this.DBService.patchContests("grooviestPhoto", result.grooviestPhoto).then(() => {

          this.grooviestPhoto.nativeElement?.style.setProperty('background-color', 'white')
        })
      }
    })
  }

  getAllContests() {
    this.DBService.getContestWinners().then((result) => {
      // Determine if this media is already selected as winner
      if (result.bestGroomBride != undefined && result.bestGroomBride.filter(value => value.id == this.galleryInformation.id).length > 0) {
        this.bestGroomBride.nativeElement?.style.setProperty('background-color', '#6AC755')
      }
      if (result.bestPhotoBooth != undefined && result.bestPhotoBooth.filter(value => value.id == this.galleryInformation.id).length > 0) {
        this.bestPhotoBooth.nativeElement?.style.setProperty('background-color', '#6AC755')
      }
      if (result.goofiestPhoto != undefined && result.goofiestPhoto.filter(value => value.id == this.galleryInformation.id).length > 0) {
        this.goofiestPhoto.nativeElement?.style.setProperty('background-color', '#6AC755')
      }
      if (result.grooviestPhoto != undefined &&  result.grooviestPhoto.filter(value => value.id == this.galleryInformation.id).length > 0) {
        this.grooviestPhoto.nativeElement?.style.setProperty('background-color', '#6AC755')
      }
    })
  }

  commentsScrollToBottom() {
    const maxScroll = this.commentsDiv?.nativeElement.scrollHeight;
    this.commentsDiv?.nativeElement.scrollTo({ top: maxScroll })
  }

  commentsScrollToNext() {
    this.commentsDiv?.nativeElement.scrollTo({ top: this.commentsDiv?.nativeElement.scrollTop + 60, behavior: "smooth" })
  }

  deleteComment(id: string) {
    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then((result) => {
      if (!result) {
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
            let error = false
            this.isServerOperation = true
            // Get updated information before deletion
            this.DBService.getPhotoById(this.galleryInformation.id).then((updatedGalleryInformation: GalleryInformation | undefined) => {
              if (updatedGalleryInformation !== undefined) {
                if (updatedGalleryInformation.id !== undefined) {
                  this.galleryInformation = updatedGalleryInformation

                  let deleteIndex = this.galleryInformation.comments.findIndex(x => x.id === id);
                  this.galleryInformation.comments.splice(deleteIndex, 1)

                  this.DBService.patchComments(this.galleryInformation.id, this.galleryInformation.comments).then(async () => {
                    // Removes cookie flag for this comment
                    localStorage.removeItem(id)

                    // Wait half a second before hidding spinner. Prevents flashing
                    setTimeout(() => {
                      this.isServerOperation = false
                    }, 500);
                  })
                } else {
                  error = true
                }
              } else {
                error = true
              }
            }).then(() => {
              // Show Error dialog to user
              if (error) {
                this._dialog.open(DialogComponent, {
                  data: {
                    title: "Error",
                    message: "An error occured and could not delete this comment.<br>Try refreshing the page and trying again.",
                    button1: "Okay",
                    input: false
                  }
                })
              }
            })
          }
        });
      }
    })
  }

  // Used only to return localStorage into angular template
  getLocalStorage() {
    return localStorage
  }

  async patchComment() {
    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then(async (result) => {
      if (!result) {
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

        this.isServerOperation = true
        let error = false

        if (this.galleryInformation.comments == undefined) {
          this.galleryInformation.comments = []
        } else {
          // updated galleryInformation
          this.DBService.getPhotoById(this.galleryInformation.id).then((updatedGalleryInformation: GalleryInformation | undefined) => {
            if (updatedGalleryInformation !== undefined) {
              if (updatedGalleryInformation.id !== undefined) {
                // Force comments to be present
                if (updatedGalleryInformation.comments == undefined) {
                  updatedGalleryInformation.comments = []
                }
                this.galleryInformation = updatedGalleryInformation
                this.galleryInformation.comments.push(galleryComment)

                this.DBService.patchComments(this.galleryInformation.id, this.galleryInformation.comments).then(async () => {
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
              } else {
                error = true
              }
            } else {
              error = true
            }
          }).then(() => {
            // Show Error dialog to user
            if (error) {
              this._dialog.open(DialogComponent, {
                data: {
                  title: "Error",
                  message: "An error occured and could not update this comment.<br>Try refreshing the page and trying again.",
                  button1: "Okay",
                  input: false
                }
              })
            }
          })
        }
      }
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
    // Check if uploading is disabled
    this.DBService.checkIfStopDB().then(async (result) => {
      if (!result) {
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
            this.DBService.remove(this.galleryInformation.id).then(async () => {
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
    })
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
      this.DBService.patchLikes(this.galleryInformation.id, true)
      // Flag localStorage as this gallery has been liked.
      localStorage.setItem(this.galleryInformation.id+"like", "true")
      // Set icon to represent change
      this.likeIcon.nativeElement.textContent = "favorite"
    } else {
      // Remove Like
      if (this.galleryInformation.likes > 0) {
        this.galleryInformation.likes -= 1
        this.DBService.patchLikes(this.galleryInformation.id, false)
        // Flag localStorage as this card has been liked.
        localStorage.setItem(this.galleryInformation.id+"like", "false")
        // Set icon to represent change
        this.likeIcon.nativeElement.textContent = "favorite_border"
      }
    }
  }

  // updateBestGroomBride() {

  //   if (this.galleryInformation.bestGroomBride != true) {
  //     this.DBService.patchAny(this.galleryInformation.id, "bestGroomBride", true)
  //   } else {
  //     this.DBService.patchAny(this.galleryInformation.id, "bestGroomBride", false)
  //   }


  //   // Check if likes are null, if they are set to zero so that it can be incremented on.
  //   if (this.galleryInformation.likes == null || this.galleryInformation.likes == undefined) {
  //     this.galleryInformation.likes = 0
  //   }
  //   // Get localStorage by card name. If present, then has already liked.
  //   let isLiked = localStorage.getItem(this.galleryInformation.id+"like")

  //   this.likePressed = true
  //   setTimeout(() => {
  //     this.likePressed = false
  //   }, 800);

  //   if (isLiked != "true") {
  //     // Add Like
  //     this.galleryInformation.likes += 1
  //     this.DBService.patchLikes(this.galleryInformation.id, true)
  //     // Flag localStorage as this gallery has been liked.
  //     localStorage.setItem(this.galleryInformation.id+"like", "true")
  //     // Set icon to represent change
  //     this.likeIcon.nativeElement.textContent = "favorite"
  //   } else {
  //     // Remove Like
  //     if (this.galleryInformation.likes > 0) {
  //       this.galleryInformation.likes -= 1
  //       this.DBService.patchLikes(this.galleryInformation.id, false)
  //       // Flag localStorage as this card has been liked.
  //       localStorage.setItem(this.galleryInformation.id+"like", "false")
  //       // Set icon to represent change
  //       this.likeIcon.nativeElement.textContent = "favorite_border"
  //     }
  //   }

  // }

  download() {
    const a = document.createElement('a')
    a.href = "https://granted.photos/photos/full/"+this.galleryInformation.id
    a.download = this.galleryInformation.id
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

    this.getAllContests()

  }

  ngOnInit(){
    if (this.galleryInformation.comments == undefined) {
      this.galleryInformation.comments = []
    }
  }
}
