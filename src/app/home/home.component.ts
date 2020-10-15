import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input,
    NgZone,
    OnInit,
    ViewChild,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from "../api-service";
import {Router} from "@angular/router";
import {addressData, carData, personData, questionsData} from "./models";
import {AgmMap, MapsAPILoader} from "@agm/core";
import {Ng4LoadingSpinnerService} from 'ng4-loading-spinner';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import * as configs from "../config/config";
import {CommonService} from "../services/common.service";
import {EventEmmiterService} from "../services/event-emmiter.service"
import {NavigationEnd} from "@angular/router";

import { DoCheck, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import {NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { MomentDateFormatter} from './dateformat';
import { data } from 'src/resource/carriers';
import { strictEqual } from 'assert';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

declare var google;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [{
        provide: NgbDateParserFormatter, useClass: MomentDateFormatter
    }]
})
export class HomeComponent implements OnInit, AfterViewInit , DoCheck {
    @Input() name;
    @ViewChild('placesRef', {static: false}) public searchElementRef: ElementRef;
    validatingForm: FormGroup;
    addressData: addressData = {};
    GooglePlace: boolean = true;
    showBuyHome: boolean = false;
    step: number = 1;
    differ: KeyValueDiffer<string, any>;
    formatted_address: string;
    mainHeight: number;

    b_zillowData : boolean = false;

    b_life : boolean;
    lat = 51.678418;
    lng = 7.809007;

    sidebarAddress = "";
    sidebarfirstname = "";
    sidebarlastname = "";
    sidebarBuiltYear = "";
    sidebarSquare = "";
    sidebarDiscounts = "";
    // if roof_shape is set to true, roof is peaked. otherwise flat.
    public discountsData = {
        roof_shape: true,
        basement_finished: true,
        dog: true,
        pool: true,
        alarm: true,
        bundle: true,
        claim_free: true,
        life_ins: true,
        smoke_detector: true,
        good_credit: true
    };
    public questionsData: questionsData = {};
    /*
    * Insurance Type: 1) Home, 2) Auto 3) Bundle
    * */
    insuranceType: number = 1;
    addLicense: boolean = false;
    comment: string;
    modalContentMargin: number;
    agentInfo: object;
    life_array = configs.life_array;
    autobeat: string;
    homebeat: string;
    notes: string;
    quote_central: boolean;
    referral_source: string;
    settlement: string;
    email: string;
    phone: string;
    staticAddress: string;
    healthStatus: number = 3;
    life_val: number;
    healthText: object = ['Below Avg Health', 'Healthy', 'Superior Health', 'Select'];
    isshowdiscounts: boolean = false;
    zillowData: object = {value: '', square: '', built_year: '', estimate: ''};
    floodData: object = {application: { floodZone : ''}};
    personData: personData[] = [{first_name: '', last_name: '', birthday: '', license: null}];
    carData: carData[] = [{year: '', type: '', model: ''}];
    homeData: object;
    goodPrice: string;
    enhancedPrice: string;
    showPricing: boolean = false;
    isShowSpecificPage: boolean = false;
    isBgShow: boolean = true;

    currentdate = '';
    ngbformatdate : NgbDateStruct = {month: 10, day: 30, year: 2020};

    life = false;
    jewelry = false;
    umbrella = false;

    agent: object = {
        type: 'user',
        email: this.router.url.split('/')[1] == '' ? 'pete' : this.router.url.split('/')[1]
    };
    quote_id: string;
    isPage6: boolean = false;
    isPage7: boolean = false;
    isPage5: boolean = false;
    isPage8: boolean = false;
    isPage9: boolean = false;
    isPage10: boolean = false;
    isAPIFetched: boolean = false;
    /*
    * Conditional Loaders
    * */
    zillowLoader: boolean = false;
    zillowDataFetched: boolean = false;
    showImg: boolean = false;

    constructor(
        private router: Router,
        public apiService: ApiService,
        private __scrollToService: ScrollToService,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private spinnerService: Ng4LoadingSpinnerService,
        private commonService: CommonService,
        private eventEmitterService: EventEmmiterService,
        private differs: KeyValueDiffers
    ) {
        this.differ = this.differs.find({}).create();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                setTimeout(() => {
                    this.mainHeight = window.innerHeight;
                })
            }
        })
    }

    ngDoCheck() {
        const change = this.differ.diff(this);
        if (change) {

        }
    }

    public isMobile: boolean;
    isVerical: boolean;
    @HostListener('window:keydown', ['$event'])

    KeyDown(event: KeyboardEvent) {
        if (event.shiftKey && event.code == 'Digit3') {
            event.preventDefault();
            this.agent['type'] = 'agent';
            if (this.step > 0) {
                this.isShowSpecificPage = !this.isShowSpecificPage;
            }
        }
    }

    @HostListener('window:resize', ['$event'])

    onResize(event) {
        if ( window.innerWidth < 769 ) {
            this.isVerical = false;
        } else {
            this.isVerical = true;
        }
        this.modalContentMargin = ((event.target.innerWidth - 500)) / 2;
        if (event.target.innerWidth < 992) {
            this.modalContentMargin = (event.target.width - 300) / 2;
        }
        this.isMobile = window.innerWidth < 769;
        if (event.target.innerWidth < 769) {
            this.isBgShow = false;
        } else {
            this.isBgShow = true;
        }
    }


    ngAfterViewInit(): void {
        this.isMobile = window.innerWidth < 769;
    }

    ngOnInit() {

        this.loadGooglePlace();
        // this.sendAPIRequest();
        this.commonService.clearValues();
        this.eventEmitterService.toggleNav(false);
        let info = configs['agentsInfo'][location.href.split('/').pop()];
        if (info == undefined) {
            info = configs['agentsInfo']['pete']
        }
        this.agentInfo = info;
        this.agentInfo['siteUrl'] = 'https://' + this.agentInfo['email'].split('@')[1];
        this.modalContentMargin = (window.innerWidth - 500) / 2;
        if (window.innerWidth < 992) {
            this.modalContentMargin = (window.innerWidth - 300) / 2;
        }
        this.validatePersonForm();
        if (window.innerWidth < 769) {
            this.isVerical = false;
            return this.isBgShow = false;
        } else {
            this.isVerical = true;
        }

        this.isBgShow = true;

        this.showFirstPage(2);
    }

    showFirstPage(type) {
        if (type == 1 || type == 3) {
            this.showBuyHome = true;
            this.step = -1;
        } else {
            this.step = 1;
            this.loadGooglePlace()
        }
        this.insuranceType = type;
        this.quote_id = this.commonService.getQuoteID();
        this.commonService.applyTotalData('quote_id', this.quote_id);
        this.commonService.applyTotalData('type', type);
    }

    toggleGooglePlace() {
        this.GooglePlace = !this.GooglePlace;
        this.zillowData = {};
        if (this.GooglePlace) this.loadGooglePlace();
    }

    displayZillowData(key) {
        if (this.GooglePlace) {
            return this.zillowDataFetched;
        }
        return Boolean(this.zillowData[key]);
    }

    setHomeData($event) {
        this.homeData = $event;
        this.commonService.applyTotalData('homeData', this.homeData);
        this.showBuyHome = false;
        if (this.insuranceType == 2) {
            this.step = 2;
        } else {
            this.loadGooglePlace()
            this.step = 1;
        }
    }

    setCarData($event) {
        this.initStep3();
        this.carData = $event;
        this.isPage8 = true;
        this.commonService.applyTotalData('carData', this.carData);
        setTimeout(() => window.scrollTo(0, 0));
    }

    setDiscountData($event) {
        this.discountsData = $event;
        this.initStep3();
        this.isPage6 = true;
        this.step = 4;
        this.moveToPageTop();
        this.commonService.applyTotalData('discountsData', this.discountsData);
        this.sendAPIRequest();
    }

    initStep3() {
        this.isPage5 = false;
        this.isPage6 = false;
        this.isPage7 = false;
        this.isPage8 = false;
        this.isPage9 = false;
        this.isPage10 = false;
    }

    onNext() {
        this.initStep3();
        this.isPage9 = true;
        this.step = 5;
        window.scrollTo(0, 0);
    }

    on1() {
        this.life = true;
    }

    on2(){
        this.jewelry = true;
    }

    on3(){
        this.umbrella = true;
    }

    setQuestions($event) {
        this.questionsData = $event;


    }

    onChangeAddress() {
        this.isShowSpecificPage = true;
    }

    setDetailData() {
        this.commonService.applyTotalData('GooglePlace', this.GooglePlace);
        if (this.isShowSpecificPage) {
            this.sendAPIRequest();
            this.spinnerService.show();
            setTimeout(() => {
                this.financialCheck();
                this.spinnerService.hide();
            }, 30000);
            return;
        }
        this.financialCheck();
    }

    loadGooglePlace() {
        this.mapsAPILoader.load().then(() => {
            if (this.GooglePlace) {
                setTimeout(() => {
                    let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
                        types: ["address"], componentRestrictions: {country: 'USA'}
                    });
                    autocomplete.addListener("place_changed", () => {
                        this.ngZone.run(() => {
                            let address = autocomplete.getPlace();
                            this.formatted_address = address.formatted_address;
                            this.handleAddressChange(address);
                        })
                    })
                });
            }
        });
    }

    tmp : string;

    validatePersonForm() {

        let formData = {
            "emailInput": new FormControl(this.email, [Validators.required, Validators.pattern(
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
            "phoneInput": new FormControl(this.phone, [Validators.required, Validators.pattern(/^((?!(0))[0-9]{10,100})$/)]),
        };
        for (let i = 0; i < this.personData.length; i++) {
            formData['firstnameInput' + i] = new FormControl(this.personData[i]['first_name'], Validators.required);
            formData['lastnameInput' + i] = new FormControl(this.personData[i]['last_name'], Validators.required);
            formData['birthdayInput' + i] = new FormControl(this.personData[i]['birthday'], Validators.required);
            if (this.addLicense) {
                formData['licenseInput' + i] = new FormControl(this.personData[i]['license'], Validators.required);
            }

        }
        this.validatingForm = new FormGroup(formData);


    }

    get emailInput() {
        return this.validatingForm.get('emailInput');
    }

    get phoneInput() {
        return this.validatingForm.get('phoneInput');
    }

    handleAddressChange(address) {
        let addressData = address.address_components;
        this.commonService.applyTotalData('address_data', address);
        try {
            this.addressData['street_number'] = addressData.filter((elem) => {
                return elem['types'][0] == 'street_number'
            })[0]['short_name'];
            this.addressData['route'] = addressData.filter((elem) => {
                return elem['types'][0] == 'route'
            })[0]['long_name'];
            this.addressData['address'] = this.addressData['street_number'] + ' ' + this.addressData['route'];
            this.addressData['locality'] = addressData.filter((elem) => {
                return elem['types'][0] == 'locality'
            })[0]['long_name'];
            this.addressData['administrative_area_level_1'] = addressData.filter((elem) => {
                return elem['types'][0] == 'administrative_area_level_1'
            })[0]['short_name'];
            this.addressData['country'] = addressData.filter((elem) => {
                return elem['types'][0] == 'country'
            })[0]['long_name'];
            this.addressData['postal_code'] = addressData.filter((elem) => {
                return elem['types'][0] == 'postal_code'
            })[0]['short_name'];
            this.commonService.applyTotalData('addressData', this.addressData);
            this.commonService.applyTotalData('mydata', 'this is my date');
            const data = {
                address: this.addressData['address'],
                citystatezip: this.addressData['locality'] + ', ' + this.addressData['administrative_area_level_1'] + ', '
                    + this.addressData['postal_code']
            };
            this.sidebarAddress = this.addressData['address'];
            this.staticAddress = data.address + ',' + data.citystatezip;
            this.getZillowData(data);


        } catch (e) {
            this.commonService.modalOpen('Errpr', 'Please enter the correct address type.');
        }
    }

    initSecretForm() {
        this.agent['type'] = 'user';
        this.settlement = '';
        this.homebeat = '';
        this.autobeat = '';
        this.notes = '';
        this.referral_source = '';
        this.quote_central = false;
    }

    isDisplay() {
        return this.zillowData['square'] != '' &&
            this.zillowData['square'] != null &&
            this.zillowData['built_year'] != '' &&
            this.zillowData['built_year'] != null;
    }

    moveToPageTop() {
        setTimeout(function () {
            document.getElementById('scrollTop').scrollIntoView();
        })
    }

    setAddrZillow() {
        this.commonService.applyTotalData('zillowData', this.zillowData);
        this.step = 2;
        this.moveToPageTop()
    }

    getZillowData(data) {
        this.zillowLoader = true;
        this.showImg = true;
        this.zillowDataFetched = false;
        this.apiService.getZillow(data).subscribe(res => {
            
            if(!res.hasOwnProperty('price')) {
                this.zillowData = {};
                this.GooglePlace = false;
                this.zillowLoader = false;
                return;
            } else {
                this.zillowData['value'] = res;
                const estimate = res.price
                this.zillowData['square'] = res.building_size;
                this.zillowData['built_year'] = res.year_built;
                // this.zillowData['estimate'] = res.price
                this.zillowData['estimate'] = estimate != NaN ? this.commonService.commafy(estimate) : 0;
                this.commonService.applyTotalData('zillowData', this.zillowData);

                this.sidebarBuiltYear = res.year_built;
                this.sidebarSquare = res.building_size;

                this.eventEmitterService.toggleAPIDataStatus(false);
                const zillowData = this.commonService.extractData('zillowData');
                const address = this.commonService.extractData('addressData');
                const personData =
                     [
                        {
                            "first_name": "first",
                            "last_name": "last",
                            "birthday": "2020-09-29",
                            "license": null
                        }
                    ];

                const carData = this.commonService.extractData('carData');
                const curYear = (new Date()).getFullYear();
                const yearData = {
                    ac_year: curYear,
                    electric_year: curYear,
                    plumbing_year: curYear,
                    roof_year: curYear
                };
                const isMailingSameAsProperty = this.commonService.extractData('isMailingSameAsProperty');
                const email = "test@test.com"
                const phone = "4564814654";
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

                console.log(data);

                this.zillowLoader = false;
                this.zillowDataFetched = true;
                this.b_zillowData = true;

                this.apiService.getNeptuneFlood(data).subscribe(neptuneflood => {
                    
                    console.log('neptune flood is success');
                    this.commonService.setAPIData('neptuneflood', neptuneflood);
                    const data = this.commonService.getItem('api_data');
                    this.floodData = data['neptuneflood'];
                    console.log('neptuneflood', neptuneflood);
                    
                    
                    
                });
            }
        }, (err) => {
            this.b_zillowData = true;
            this.spinnerService.hide();
        });
    }

    addPerson() {
        if (this.personData.length < 5) {
            this.personData[this.personData.length] = {first_name: '', last_name: '', birthday: '', license: null};
        }
        this.validatePersonForm();
    };

    deletePerson(key) {
        this.personData.splice(key, 1);
        this.validatePersonForm();
    }

    showDiscounts() {
        if (!this.validatingForm.valid) {
            this.isshowdiscounts = false;
            this.commonService.modalOpen('Warning', 'Please enter all required fields.');
            return;
        }

        this.isshowdiscounts = true;
        this.initSecretForm();
        this.moveToPageTop();
        this.step = 3;
        this.isPage5 = true;
        this.commonService.applyTotalData('email', this.email);
        this.commonService.applyTotalData('phone', this.phone);
        this.commonService.applyTotalData('personData', this.personData);
    }

    setInsurnaceType(value) {
        this.insuranceType = value;
        this.commonService.applyTotalData('carrier_type', value);
        this.initStep3();
        this.isPage7 = true;
        this.moveToPageTop();
    }

    sendEmail(type) {
        const apiData = this.commonService.getPricing(), addressData = this.commonService.extractData('addressData');
        let address = addressData['address'],
            city = addressData['locality'],
            state = addressData['administrative_area_level_1'], zip = addressData['postal_code'],
            persons = JSON.stringify(this.commonService.extractData('personData')),
            agent = this.agent,
            basicPrice = this.commonService.commafy(apiData['lowest_price']),
            enhancedPrice = this.commonService.commafy(apiData['highest_price']),
            goodPrice = this.commonService.commafy(apiData['medium_price']);
        let body = {address, zip, state, city, persons, type, agent, goodPrice, enhancedPrice, basicPrice};
        this.apiService.sendEmail(body).subscribe(res => {
        }, (err) => {
        });
    }

    financialCheck() {
        this.showPricing = true;
        const apiData = this.commonService.getPricing(),
            link = location.href.split('/').pop(),
            basicPrice = this.commonService.commafy(apiData['lowest_price']),
            enhancedPrice = this.commonService.commafy(apiData['highest_price']),
            goodPrice = this.commonService.commafy(apiData['medium_price']);
        this.commonService.applyTotalData('basicPrice', basicPrice);
        this.commonService.applyTotalData('enhancedPrice', enhancedPrice);
        this.commonService.applyTotalData('goodPrice', goodPrice);
        this.commonService.applyTotalData('addLicense', this.addLicense);
        this.commonService.applyTotalData('agent', this.agent);
        this.commonService.applyTotalData('quote_id', this.quote_id);
        this.commonService.applyTotalData('link', link);
        let havenLifePricing;
        try{
            const api_data = this.commonService.getItem('api_data');
            havenLifePricing = api_data.havenlife.quotes[0].monthlyRate;
        }catch (e) {
            havenLifePricing = 33;
        }

        this.commonService.applyTotalData('havenLifePricing', Math.round(havenLifePricing));
        const total_data = this.commonService.getItem('total_data');
        this.apiService.sendLifeEmail(total_data).subscribe(res => {
            this.isShowSpecificPage = false;
            this.step = 5;
            this.isPage9 = false;
            this.isPage10 = true;
            this.initSecretForm();
            this.moveToPageTop();
        }, (err) => {
        });
    }

    sendAPIRequest() {
        this.eventEmitterService.toggleAPIDataStatus(false);
        const zillowData = this.commonService.extractData('zillowData');
        const address = this.commonService.extractData('addressData');

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

        const personData = this.commonService.extractData('personData');
        for (let i = 0; i < personData.length; i++) {
            var tmp = personData[i]['birthday'];
            var tmpbirthday = tmp['year'] + "-" + tmp['month'] + "-" + tmp['day'];
            personData[i]['birthday'] = tmpbirthday;
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

        console.log('this is api data: -----------------------');
        console.log(data);

        this.apiService.getPlymouth(data).subscribe(response => {
            this.commonService.setAPIData('plymouth', response);
            console.log('plymouth', response);
        });
        this.apiService.getUniversal(data).subscribe(universal => {
            this.commonService.setAPIData('universal', universal);
            console.log('universal', universal);
        });
        this.apiService.getStillWater(data).subscribe(stillwater => {
            this.commonService.setAPIData('stillwater', stillwater);
            console.log('stillwater', stillwater);
        });
        this.apiService.getNeptuneFlood(data).subscribe(neptuneflood => {
            this.commonService.setAPIData('neptuneflood', neptuneflood);
            console.log('neptuneflood', neptuneflood);
        });
        this.apiService.getHavenLife(data).subscribe(havenlife => {
            this.commonService.setAPIData('havenlife', havenlife);
            console.log('havenlife', havenlife);
        });
    }

    movePage(pageNumber) {
        switch (pageNumber) {
            case 1:
                this.step = 1;
                this.moveToPageTop();
                break;
            case 2:
                this.step = 2;
                this.moveToPageTop();
                break;
            case 3:
                this.initStep3();
                this.step = 3;
                this.isPage5 = true;
                this.moveToPageTop();
                break;
            case 4:
                this.initStep3();
                this.step = 4;
                this.isPage6 = true;
                this.moveToPageTop();
                break;
            case 5:
                this.initStep3();
                this.isPage9 = true;
                this.step = 5;
                this.moveToPageTop();
                break;
        }
    }

    changeFirstname(){
        this.sidebarfirstname = this.personData[0]['first_name'];
    }

    changeLastname(){
        this.sidebarlastname = this.personData[0]['last_name'];
    }

    fromModel(value: string): NgbDateStruct
    {
        if (!value)
        return null
        let parts=value.split('/');
        return {month:+parts[0],day:+parts[1],year:+parts[2]}
    }

    dateTostring(date: NgbDateStruct) : string// from internal model -> your mode
    {
        if(this.ngbformatdate != null) {
            var tmpString = date?date.year +"/"+ ('0'+date.month).slice(-2) +"/"+('0'+ date.day).slice(-2)+"/":"";
            console.log('birthday is :' + tmpString);
            return tmpString
        }

        return ""
    }


    setSelectedDiscount($event) {
        this.sidebarDiscounts = $event;
    }
}
