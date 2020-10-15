import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {questionsData} from '../../home/models';
import {ApiService} from "../../api-service";
import {CommonService} from "../../services/common.service";
import * as configs from "../../config/config";
import {Ng4LoadingSpinnerService} from "ng4-loading-spinner";

@Component({
  selector: 'app-page-ten',
  templateUrl: './page-ten.component.html',
  styleUrls: ['./page-ten.component.scss']
})
export class PageTenComponent implements OnInit {
  @Output() setQuestions: EventEmitter<object> = new EventEmitter<object>();
  public questionData;
  public apiData: object;
  public floodData: object;
  public havenLifePricing:number;
  public havenLifeAmount:number;
  public floodzone : string = "";
  public buildingCoverage : string = "";
    public total_data;

    agentInfo : object;


  constructor(public apiService: ApiService, public commonService: CommonService, private spinnerService: Ng4LoadingSpinnerService) {
  }

  ngOnInit() {
    this.setInitData();
    this.getPrices();
    // this.callAPI();
      let info = configs['agentsInfo'][location.href.split('/').pop()];
      if (info == undefined) {
          info = configs['agentsInfo']['pete'];
      }
      this.agentInfo = info;
  }

  setInitData() {

    
      this.total_data = this.commonService.getItem('total_data');
    const data = this.commonService.getItem('api_data');
    this.floodData = data['neptuneflood'];
    

    let coverageAmount;
    try {
      let tmpstr : string = this.total_data['zillowData']['estimate'];
      tmpstr = tmpstr.replace(',','');
      let estimate : number = Number(tmpstr);
      if (estimate * 0.8 > 25000) coverageAmount = estimate * 0.8;
      else coverageAmount = 25000;
      if (coverageAmount > 500000) coverageAmount = 500000;
    } catch (e) {
      coverageAmount = 25000;
    }

    if(!this.floodData){
     this.floodzone = '';
     this.buildingCoverage = coverageAmount;
    } else {
      this.floodzone = this.floodData['application']['floodZone'];
      this.buildingCoverage = this.floodData['application']['buildingCoverage'];
    }

    this.questionData = this.commonService.extractData('questionData');

    
    // console.log(this.questionData);
  }
  getPrices(){
    this.apiData = this.commonService.getPricing();
    console.log('this is api data');
    console.log(this.apiData);
    setInterval(() => {
      this.apiData = this.commonService.getPricing();
    }, 1000);
    try{
      const api_data = this.commonService.getItem('api_data');
      this.havenLifePricing = api_data.havenlife.quotes[0].monthlyRate;
      this.havenLifeAmount=api_data.havenlife.quotes[0].coverageAmount;

    }catch (e) {
      this.havenLifePricing = 33;
    }
    this.havenLifePricing = Math.round(this.havenLifePricing);

  }
  choose(key, value) {
    this.questionData[key] = value;
  }

  submitLifeForm() {
    document.forms[0].submit();
  }

  next() {
    this.setQuestions.emit(this.questionData);
  }

  callAPI() {
      const zillowData = this.commonService.extractData('zillowData');
      const address = this.commonService.extractData('addressData');
      const personData = this.commonService.extractData('personData');
      const carData = this.commonService.extractData('carData');
      const curYear = (new Date()).getFullYear();
      const yearData = {
          ac_year: curYear,
          electric_year: curYear,
          plumbing_year: curYear,
          roof_year: curYear
      };
      const isMailingSameAsProperty = this.commonService.extractData('isMailingSameAsProperty');
      const email = this.commonService.extractData('email');
      const phone = this.commonService.extractData('phone');
      if (zillowData.estimate == null) {
          zillowData.estimate = '';
      }
      const data = {
          email, phone,
          yearBuilt: zillowData.built_year,
          address, personData, carData,
          isMailingSameAsProperty,
          ac_year: yearData.ac_year,
          electric_year: yearData.electric_year,
          plumbing_year: yearData.plumbing_year,
          roof_year: yearData.roof_year,
          sqft: zillowData.square,
          estimate: zillowData.estimate.replace(',', ''),
          mailing_address: address,
          roof_status: 'peaked',
          is_basement: true,
          building_type: 1,
          foundation_type: 1,
          exterior_type: 1,
          construction_type: 1,
          roof_type: 1
      };
      this.apiService.getNeptuneFlood(data).subscribe(neptuneflood => {
          this.commonService.setAPIData('neptuneflood', neptuneflood);
          const data = this.commonService.getItem('api_data');
          this.floodData = data['neptuneflood'];
          console.log('neptuneflood', neptuneflood);
      });
  }

}
