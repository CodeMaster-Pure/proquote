import {Component, EventEmitter, Input, OnInit, Output, HostListener} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {carData, CarYearData, personData} from "../../home/models";
import * as configs from "../../../../config";
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-page-seven',
  templateUrl: './page-seven.component.html',
  styleUrls: ['./page-seven.component.scss']
})
export class PageSevenComponent implements OnInit {

  @Output() setCarData: EventEmitter<object> = new EventEmitter<object>();
    @Output() onCar: EventEmitter<any> = new EventEmitter<any>();
  @Input('addressData') public addressData: object;
  @Input('personData') public personData: personData[] = [];
  public CarTypeData: object = configs.car_types;
  public CarTypeMostData: object = configs.car_most;
  public CarYearData: CarYearData[] = [];

  constructor(public commonService: CommonService) {
  }

  public isMobile: boolean;
  public email: string;
  public phone: string;
  public carData: carData[] = [{year: '', type: '', model: ''}];
  currentyear : number;

  isShowYearDiv : boolean = false;

  ngOnInit() {
    this.currentyear = (new Date()).getFullYear();
    this.CarYearData = this.commonService.getCarYearData();
  }

  addCar(year) {
    console.log(year);
    var tmp : string = year;
    
    this.isShowYearDiv = false;

    if (this.carData.length < 4) {
      this.carData[this.carData.length] = {year: tmp, type: '', model: ''};
    }
  };

  deleteCar(key) {
    if(this.carData.length>1){
      this.carData.splice(key, 1);
    }
  }

  addPerson() {
    if (this.personData.length < 5) {
      this.personData[this.personData.length] = {first_name: '', last_name: '', birthday: '', license: ''};
    }
  };

  deletePerson(key) {
    this.personData.splice(key, 1);
  }

  next() {
    this.setCarData.emit(this.carData);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = window.innerWidth < 769;
    console.log('page auto car is mobile:'+this.isMobile);
  }
    ngAfterViewInit(): void {
      this.isMobile = window.innerWidth < 769;
    }

    showDiv(){
      this.isShowYearDiv = !this.isShowYearDiv;
    }

    setCarType(index,selectedCar){
      this.carData.length
      console.log('this' + selectedCar);
      this.carData[index]['type'] = selectedCar;
      // this.carData[index]['type'] = cartype;
    }
}


