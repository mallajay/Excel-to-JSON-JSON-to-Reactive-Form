import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class WidgetUtilService {
  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>;

  constructor(private _snackBar: MatSnackBar, public dialog: MatDialog) {}

  presentToast(message) {
    this._snackBar.open(message, '', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  presentLongTost(message) {
    this._snackBar.open(message, '', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 6000,
    });
  }

  dangerToast(message) {
    this._snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['red-snackbar'],
    });
  }

  longDangerToast(message) {
    this._snackBar.open(message, '', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['red-snackbar'],
    });
  }
}
