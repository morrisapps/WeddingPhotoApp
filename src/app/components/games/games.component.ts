import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    MatCardModule
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent {

  @ViewChild('rootDiv', { read: ElementRef }) rootDiv!:ElementRef;

  constructor (
    private _renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    // set root div height minus 20 px margin
    this._renderer.setStyle(this.rootDiv.nativeElement, 'min-height', 'calc(100% - 20px)');
  }

}
