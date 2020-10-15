import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-page-five',
  templateUrl: './page-five.component.html',
  styleUrls: ['./page-five.component.scss']
})
export class PageFiveComponent implements OnInit {

  @Output() setDiscountData: EventEmitter<object> = new EventEmitter<object>();
  @Output() setSelectedDiscount: EventEmitter<any> = new EventEmitter<any>();
  @Input('addressData') public addressData: object;

  discountsStr = "";
  constructor(public commonService: CommonService) {
  }

  // if roof_shape is set to true, roof is peaked. otherwise flat.
  public discountsData = {
    roof_shape: false,
    dog: false,
    pool: false,
    alarm: false,
    bundle: false,
    claim_free: false,
    life_ins: false,
    smoke_detector: false,
    good_credit: false,
      startdate: ''
  };

  ngOnInit() {
  }


  next() {



    if(typeof this.discountsData.roof_shape !== 'boolean'){
      this.commonService.modalOpen('Error', 'Please select the roof shape option!');
      return;
    }
    if(typeof this.discountsData.claim_free !== 'boolean'){
      this.commonService.modalOpen('Error', 'Please select the basement option!');
      return;
    }
    if(typeof this.discountsData.dog !== 'boolean'){
      this.commonService.modalOpen('Error', 'Please select the dog option!');
      return;
    }
    if(typeof this.discountsData.pool !== 'boolean'){
      this.commonService.modalOpen('Error', 'Please select the pool option!');
      return;
    }
    this.setDiscountData.emit(this.discountsData);
  }

  clickAlarm(){
    this.discountsData.alarm = !this.discountsData.alarm;
    if (this.discountsData.alarm) {
      if (!this.discountsStr.includes("alarm")) {
        this.discountsStr = this.discountsStr + "alarm ";
      }
    } else {
      if (this.discountsStr.includes("alarm")) {
        this.discountsStr = this.discountsStr.replace("alarm", "");
      }
	}
	this.setSelectedDiscount.emit(this.discountsStr);
  }

  clickBundle(){
    this.discountsData.bundle = !this.discountsData.bundle;
    if (this.discountsData.bundle) {
      if (!this.discountsStr.includes("bundle")) {
        this.discountsStr = this.discountsStr + "bundle ";
      }
    } else {
      if (this.discountsStr.includes("bundle")) {
        this.discountsStr = this.discountsStr.replace("bundle", "");
      }
	}
	this.setSelectedDiscount.emit(this.discountsStr);
  }

  clickLife_ins(){
    this.discountsData.life_ins = !this.discountsData.life_ins;
    if (this.discountsData.life_ins == true) {
      if (!this.discountsStr.includes("life ins")) {
        this.discountsStr = this.discountsStr + "life ins ";
      }
    } else {
      if (this.discountsStr.includes("life ins")) {
        this.discountsStr = this.discountsStr.replace("life ins", "");
      }
	}
	this.setSelectedDiscount.emit(this.discountsStr);
  }

  clickSmoke_detector(){
    this.discountsData.smoke_detector = !this.discountsData.smoke_detector;
    if (this.discountsData.smoke_detector == true) {
      if (!this.discountsStr.includes("smoke detector")) {
        this.discountsStr = this.discountsStr + "smoke detector ";
      }
    } else {
      if (this.discountsStr.includes("smoke detector")) {
        this.discountsStr = this.discountsStr.replace("smoke detector", "");
      }
	}
	this.setSelectedDiscount.emit(this.discountsStr);
  }

  clickGood_credit(){
    this.discountsData.good_credit = !this.discountsData.good_credit;
    if (this.discountsData.good_credit == true) {
      if (!this.discountsStr.includes("good credit")) {
        this.discountsStr = this.discountsStr + "good credit ";
      }
    } else {
      if (this.discountsStr.includes("good credit")) {
        this.discountsStr = this.discountsStr.replace("good credit", "");
      }
	}
	this.setSelectedDiscount.emit(this.discountsStr);
  }
}
