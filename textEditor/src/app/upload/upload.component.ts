import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule]
})
export class UploadComponent {
  // constructor(private http: HttpClient) {}
  
  // fileName = '';

  public onFileSelected(event: any) {
    // const file:File = event.target.files[0];

    // if (file) {
    //     this.fileName = file.name;
    //     const formData = new FormData();
    //     formData.append("thumbnail", file);
    //     const upload$ = this.http.post("/api/thumbnail-upload", formData);
    //     upload$.subscribe();
    // }
  }

}
