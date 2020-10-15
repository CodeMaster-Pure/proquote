import {Component, EventEmitter, OnInit, Output, HostListener} from '@angular/core';
import {questionsData} from '../../home/models';
import {CommonService} from "../../services/common.service";
import * as configs from "../../../../config";
import {HomeComponent} from "../../home/home.component";


@Component({
    selector: 'app-page-eight',
    templateUrl: './page-eight.component.html',
    styleUrls: ['./page-eight.component.scss']
})
export class PageEightComponent implements OnInit{
    @Output() setQuestions: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onNext: EventEmitter<any> = new EventEmitter<any>()
    @Output() public on1: EventEmitter<any> = new EventEmitter<any>()
    @Output() public on2: EventEmitter<any> = new EventEmitter<any>()
    @Output() public on3: EventEmitter<any> = new EventEmitter<any>()

    public havenLifePricing:number;
    public havenLifeAmount:number;

    public questionData: questionsData = {
        life: null,
        jewelry:null,
        umbrella:null,
        flood:null,
        other:null,
        note:null
    };

    public life_infos: object = configs.life_infos;
    public umbrella_infos : object = configs.umbrella_infos;
    isMobile: boolean;
    constructor(public commonService: CommonService) {
    }

    ngOnInit() {
        try{
            const api_data = this.commonService.getItem('api_data');
            this.havenLifePricing = api_data.havenlife.quotes[0].monthlyRate;
            this.havenLifeAmount=api_data.havenlife.quotes[0].coverageAmount;
            console.log(this.havenLifeAmount)
        }catch (e) {
            this.havenLifePricing = 55;
        }
        this.havenLifePricing = Math.round(this.havenLifePricing);
    }

    ngAfterViewInit() {

        this.isMobile = window.innerWidth < 769;
        console.log('page8 is mobile');
        console.log(this.isMobile);
    }

    choose(key, value) {
        this.questionData[key] = value;
    }

    next() {

        if (this.questionData.jewelry === null) {
            this.commonService.modalOpen('Warning', 'Please select personal article!');
            return;
        }
        if (typeof this.questionData.life === null) {
            this.commonService.modalOpen('Warning', 'Please select haven life pricing!');
            return;
        }
        if (typeof this.questionData.umbrella === null) {
            this.commonService.modalOpen('Warning', 'Please select umbrella policy!');
            return;
        }

        this.commonService.applyTotalData('questionData', this.questionData);
        this.onNext.emit()
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.isMobile = window.innerWidth < 769;

        console.log('page8 is mobile');
        console.log(this.isMobile);
    }

    onChangeLife(newValue) {
        if(newValue != "" || newValue != null || newValue != "select") {
            this.on1.emit()
        }

    }

    onChangeUmbrella(value) {
        if(value != "" || value != null) {
            this.on2.emit()
        }
    }

    onChangeJewelry(value){
        if(value != "" || value != null || value != "select") {
            this.on3.emit()
        }
    }
}
