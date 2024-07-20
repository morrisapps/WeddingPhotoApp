import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { GalleryInformation } from '../../interfaces/gallery-information';
import { DBService } from '../../services/db.service';
import { GalleryCardComponent } from "../gallery-card/gallery-card.component";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GalleryCardComponent,
    MatButtonModule,
],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent {

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  showMostLikes = false;
  mostLikes: GalleryInformation[] | undefined;

  DBService: DBService = inject(DBService);

  constructor (
    private _renderer: Renderer2
  ) {}

  async getMostLikes() {
    // Set mostLikes photos
    await this.DBService.getMostLikes().then((result) => {
      this.mostLikes = result as unknown as GalleryInformation[]
      this.showMostLikes = true
    })
  }

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this._renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }

}
