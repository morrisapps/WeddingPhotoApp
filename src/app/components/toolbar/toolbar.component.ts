import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Toolbar overview
 */
@Component({
  selector: 'toolbar-component',
  styleUrl: 'toolbar.component.css',
  standalone: true,
  template: `
    <p>
      <mat-toolbar color="primary">
        <button mat-icon-button class="example-icon" aria-label="Example icon-button with menu icon">
          <mat-icon>menu</mat-icon>
        </button>
        <span>Granted Photography</span>
        <span class="example-spacer"></span>
        <button mat-icon-button class="example-icon favorite-icon" aria-label="Example icon-button with heart icon">
          <mat-icon>favorite</mat-icon>
        </button>
        <button mat-icon-button class="example-icon" aria-label="Example icon-button with share icon">
          <mat-icon>share</mat-icon>
        </button>
      </mat-toolbar>
    </p>
`,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
})
export class ToolbarComponent {

}
