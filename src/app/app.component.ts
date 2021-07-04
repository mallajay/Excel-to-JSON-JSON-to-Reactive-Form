import { WidgetUtilService } from './widgetUtil/widget-util.service';
import { Component, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'jsontoform';

  dynamicForm: FormGroup;

  excelAuctionFile: File[] = [];
  auctionJsonData: any = [];
  auctionFinalData: any = [];
  showExcelData: boolean = false;

  currentDate: any;
  currentMillisecond: any;
  currentTime: any;
  minimumCurrentTime: any;

  selectedStartDate: any;
  @ViewChild('StartDate', { read: MatInput }) StartDate: MatInput;

  selectedEndDate: any;
  @ViewChild('EndDate', { read: MatInput }) EndDate: MatInput;

  auctionStartDateError = [false];
  auctionEndDateError = [false];

  get f() {
    return this.dynamicForm.controls;
  }

  get t() {
    return this.f.auction as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private widgetUtilService: WidgetUtilService
  ) {
    this.getCurrentTime();
  }

  ngOnInit() {
    this.initForm();
  }

  onSubmit(i) {
    const StartDate = this.dynamicForm.value.auction[i].StartDate;
    const StartTime = this.dynamicForm.value.auction[i].StartTime;

    const EndDate = this.dynamicForm.value.auction[i].EndDate;
    const EndTime = this.dynamicForm.value.auction[i].EndTime;

    const currentDateMillisec = moment(this.currentDate)
      .startOf('day')
      .valueOf();

    const auctionStartDateMillieSec = moment(StartDate)
      .startOf('day')
      .valueOf();

    const auctionEndDateMilliSec = moment(EndDate).startOf('day').valueOf();

    if (auctionStartDateMillieSec < currentDateMillisec) {
      this.auctionStartDateError[i] = true;
      return;
    }

    if (auctionEndDateMilliSec < auctionStartDateMillieSec) {
      this.auctionEndDateError[i] = true;
      return;
    }

    this.auctionStartDateError[i] = false;
    this.auctionEndDateError[i] = false;

    console.log('Index', i);
    console.log('this.auctionFinalData', this.auctionFinalData[i]);
    console.log('this.dynamicForm', this.dynamicForm.value.auction[i]);
  }

  importAuction() {
    // Check Other Condition
    this.showExcelData = true;
  }

  onExcelSheetImport(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];

    this.excelAuctionFile = file;

    console.log('this.excelAuctionFile', this.excelAuctionFile);

    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });

      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});

      this.auctionJsonData = jsonData.Sheet1;

      for (let aution of this.auctionJsonData) {
        this.replaceKeys(aution);
        this.auctionFinalData.push(aution);
      }

      console.log('this.auctionFinalData', this.auctionFinalData);
      this.initAuctionFrom();
    };

    reader.readAsBinaryString(file);
  }

  removeSpace(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  remove(id) {
    this.t.removeAt(id);
    this.auctionFinalData.splice(id, 1);
  }

  validateStartDate(e) {
    this.selectedStartDate = e.value;
    this.EndDate.value = '';

    if (this.currentDate.getDate() === this.selectedStartDate.getDate()) {
      this.minimumCurrentTime = this.currentTime;
    } else {
      this.minimumCurrentTime = '0:0';
    }

    var selectedMilliSec = moment(this.selectedStartDate)
      .startOf('day')
      .valueOf();
    var currentDate = moment().startOf('day').valueOf();
    if (currentDate > selectedMilliSec) {
      this.StartDate.value = '';
      this.widgetUtilService.longDangerToast(
        'Please Select Present or Future Date'
      );
      return;
    } else {
      // this.auctionFrom.get('StartTime').enable();
    }
  }

  validateEndDate(e) {
    if (this.selectedStartDate === undefined) {
      this.EndDate.value = '';
      this.widgetUtilService.longDangerToast('Please Select Start Date First');
      return;
    }
    this.selectedEndDate = e.value;

    var endMilliSec = moment(this.selectedEndDate).startOf('day').valueOf();
    var startMilliSec = moment(this.selectedStartDate).startOf('day').valueOf();

    if (endMilliSec < startMilliSec) {
      this.widgetUtilService.longDangerToast(
        'Please Select End Date Higher or Equal then Start Date'
      );
      this.EndDate.value = '';
      return;
    } else {
      // this.auctionFrom.get('EndTime').enable();
    }
  }

  private initForm() {
    this.dynamicForm = this.formBuilder.group({
      auction: new FormArray([]),
    });
  }

  private initAuctionFrom() {
    const numberOfAuction = this.auctionFinalData.length || 0;
    if (this.t.length < numberOfAuction) {
      for (let i = this.t.length; i < numberOfAuction; i++) {
        const auctionStartDate = this.auctionFinalData[i].StartDate;
        const auctionStartTime = this.auctionFinalData[i].StartTime;
        const startMilisec = new Date(
          this.returnUnixValue(auctionStartDate, auctionStartTime)
        );

        const endStartDate = this.auctionFinalData[i].EndDate;
        const endStartTime = this.auctionFinalData[i].EndTime;
        const endMilisec = new Date(
          this.returnUnixValue(endStartDate, endStartTime)
        );

        this.t.push(
          this.formBuilder.group({
            StartDate: [new Date(startMilisec), Validators.required],
            StartTime: [auctionStartTime, [Validators.required]],
            EndDate: [new Date(endMilisec), Validators.required],
            EndTime: [endStartTime, [Validators.required]],
          })
        );
      }
    }
  }

  private replaceKeys(object) {
    Object.keys(object).forEach(function (key) {
      var newKey = key.replace(/\s+/g, '');
      if (object[key] && typeof object[key] === 'object') {
        console.log('object[key]', object[key]);
        this.replaceKeys(object[key]);
      }
      if (key !== newKey) {
        object[newKey] = object[key];
        delete object[key];
      }
    });
  }

  private returnUnixValue(inputDate, inputTime) {
    var dateWithTime = [inputDate, inputTime].join(' ');
    // console.log('date Time', dateWithTime);
    var future_unix_2 = moment(dateWithTime, 'DD/MM/YYYY HH:mm a').unix();
    var unixTime = moment.unix(future_unix_2).valueOf();
    return unixTime;
  }

  private getCurrentTime() {
    this.currentDate = new Date();
    this.currentMillisecond = new Date(Date.now());
    this.currentTime = this.currentMillisecond.toLocaleTimeString(
      navigator.language,
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }
}
