import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import { UploadComponent } from '../upload/upload.component';
import { DocumentsComponent } from "../documents/documents.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,
    RouterModule, UploadComponent, DocumentsComponent],
})
export class HeaderComponent {
  public title: string = 'Text Editor';
}
