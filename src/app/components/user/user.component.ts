import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  constructor(private cookieService: CookieService) {}

  form: FormGroup = new FormGroup({
    user: new FormControl(''),
  });

  submit() {
    if (this.form.valid) {
      // Utilize cookie service to store user name
      this.cookieService.set('User', this.form.value.user);
      console.log(this.cookieService.get('User'))
      console.log(this.form.value)
      console.log(this.form.value.user)
      this.submitEM.emit(this.form.value);
    }
  }
  //@Input() error: string | null;

  @Output() submitEM = new EventEmitter();
}
