import { Component } from '@angular/core';
import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public fileService: FileService) {}
  title = 'textEditor';
  ngOnInit() {
    this.fileService.getFiles();
    this.fileService.getRecentFile();
  }
}
