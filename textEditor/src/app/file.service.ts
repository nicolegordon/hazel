import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {}

  private unsub: Subject<void> = new Subject();
  public files: any[] = [];
  public versions: any[] = [];
  public currentFileSrc: BehaviorSubject<any> = new BehaviorSubject({name: '', text: ''});
  public currentFile$: Observable<any> = this.currentFileSrc.asObservable();

  ngOnDestroy() {
    this.unsub.next()
  }

  public uploadFile(event: any): void {
    if (event.target) {
      const files: FileList = event.target.files;
      const filesArr: File[] = Array.from(files)
      filesArr.forEach((file: File) => {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          this.http.post("http://localhost:3000/api/file-upload", formData)
            .pipe(
              takeUntil(this.unsub))
              .subscribe((fileObj: any) => {
              this.files = fileObj.allFiles;
              this.currentFileSrc.next(fileObj.currentFile);
              if (fileObj.currentFile.name != "") {
                this.getVersions(fileObj.currentFile.name);
              }
            });
      }
      });
    }
  }

  public getFiles(): void {
    this.http.get("http://localhost:3000/api/files")
      .pipe(
        takeUntil(this.unsub))
        .subscribe((files: any) => {
        this.files = files;
      });
  }

  public getRecentFile(): void {
    this.http.get("http://localhost:3000/api/recent-file")
      .pipe(
        takeUntil(this.unsub))
        .subscribe((file: any) => {
          if (file != null) {
            this.currentFileSrc.next(file);
            this.getVersions(file.name);
          }
      });
  }

  public openFile(file: any): void {
    this.http.get("http://localhost:3000/api/open-file/" + file)
      .pipe(
        takeUntil(this.unsub))
        .subscribe((currentFile: any) => {
          this.currentFileSrc.next(currentFile);
          if (currentFile.name != "") {
            this.getVersions(currentFile.name);
          }
      });
  }

  public saveChanges(file: any): void {
    this.http.post("http://localhost:3000/api/save-file", file)
    .pipe(
      takeUntil(this.unsub))
      .subscribe((res: any) => {
        if (file.name != "") {
          this.getVersions(file.name);
        }
    });
  }

  public getVersions(file: any): void {
    this.http.get("http://localhost:3000/api/versions/" + file)
      .pipe(
        takeUntil(this.unsub))
        .subscribe((versions: any) => {
          this.versions = versions;
      });
  }

  public openVersion(fileDatetime: any): void {
    const data = {datetime: fileDatetime}
    this.http.post("http://localhost:3000/api/open-version", data)
      .pipe(
        takeUntil(this.unsub))
        .subscribe((file: any) => {
          if (file != null) {
            this.currentFileSrc.next(file);
          }
      });
  }

}
