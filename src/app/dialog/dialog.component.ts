import { Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly title = input<string>('');

  private dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  open() {
    this.dialogRef()?.nativeElement.showModal();
  }

  close() {
    this.dialogRef()?.nativeElement.close();
  }
}
