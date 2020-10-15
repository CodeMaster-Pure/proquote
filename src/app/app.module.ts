import { BrowserModule } from "@angular/platform-browser";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MDBSpinningPreloader } from "../../projects/ng-uikit-pro-standard/src/lib/pro/mdb-pro.module";
import { AppComponent } from "./app.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { OrderComponent } from "./order/order.component";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { HttpClientModule } from "@angular/common/http";
import { Ng4LoadingSpinnerModule } from "ng4-loading-spinner";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbdDatepickerBasic } from "./directives/datepicker";
import { FileUploadModule } from "ng2-file-upload";
import { ButtonsModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/buttons";
import { SelectModule } from "../../projects/ng-uikit-pro-standard/src/lib/pro/material-select";
import { CardsModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/cards";
import { ModalModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/modals";
import { InputUtilitiesModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/input-utilities";
import { InputsModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/inputs";
import { DropdownModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/dropdown";
import { CheckboxModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/checkbox";
import { SidenavModule } from "../../projects/ng-uikit-pro-standard/src/lib/pro/sidenav";
import { AccordionModule } from "../../projects/ng-uikit-pro-standard/src/lib/pro/accordion";
import { TableModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/tables";
import { WavesModule } from "../../projects/ng-uikit-pro-standard/src/lib/free/waves";
import { ToastModule, ToastService } from "../../projects/ng-uikit-pro-standard/src/lib/pro/alerts";
import { MDBBootstrapModulesPro } from "../../projects/ng-uikit-pro-standard/src/lib/mdb.module";
import { AgmCoreModule } from "@agm/core";
import { NgbdModalContent } from "./home/ngbd.modal.content";
import { ApiService } from "./api-service";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { AuthenticationService } from "./authentication.service";
import { ProfileComponent } from "./profile/profile.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { SettingsComponent } from "./settings/settings.component";
import { LandingComponent } from "./landing/landing.component";
import { LinksComponent } from "./links/links.component";
import { GroupComponent } from "./group/group.component";
import { PricingComponent } from "./pricing/pricing.component";
import { PasswordComponent } from "./password/password.component";
import { HeaderComponent } from "./includes/header/header.component";
import { FooterComponent } from "./includes/footer/footer.component";
import { BuyHomeComponent } from "./components/buy-home/buy-home.component";
import { LoaderComponent } from "./loader/loader.component";
import { PageSixComponent } from "./components/page-six/page-six.component";
import { PageSevenComponent } from "./components/page-seven/page-seven.component";
import { PageFiveComponent } from "./components/page-five/page-five.component";
import { PageEightComponent } from "./components/page-eight/page-eight.component";
import { PageNineComponent } from "./components/page-nine/page-nine.component";
import { PageTenComponent } from "./components/page-ten/page-ten.component";
import { FormLabelInputComponent } from "./components/form-label-input/form-label-input.component";
import { NextButtonComponent } from "./components/next-button/next-button.component";
import { SubHeaderComponent } from "./components/sub-header/sub-header.component";
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

@NgModule({
    declarations: [
        AppComponent,
        OrderComponent,
        HomeComponent,
        NgbdDatepickerBasic,
        NgbdModalContent,
        LoginComponent,
        RegisterComponent,
        ProfileComponent,
        StatisticsComponent,
        SettingsComponent,
        LandingComponent,
        LinksComponent,
        GroupComponent,
        PricingComponent,
        PasswordComponent,
        HeaderComponent,
        FooterComponent,
        BuyHomeComponent,
        LoaderComponent,
        PageSixComponent,
        PageSevenComponent,
        PageFiveComponent,
        PageEightComponent,
        PageNineComponent,
        PageTenComponent,
        // common
        FormLabelInputComponent,
        NextButtonComponent,
        SubHeaderComponent,
    ],
    imports: [
        NgbModule,
        AgmCoreModule.forRoot({
            //      apiKey: 'AIzaSyAbsbffrWgoeXaNnBBgwOLzoqqFmF6JJ3k',
            apiKey: "AIzaSyAbsbffrWgoeXaNnBBgwOLzoqqFmF6JJ3k",
            libraries: ["places"],
        }),
        Ng4LoadingSpinnerModule.forRoot(),
        FileUploadModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" }),
        InputUtilitiesModule,
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CheckboxModule,
        InputsModule,
        GooglePlaceModule,
        ButtonsModule,
        WavesModule,
        TableModule,
        CardsModule,
        BrowserModule,
        BrowserAnimationsModule,
        SelectModule,
        FormsModule,
        MDBBootstrapModulesPro.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        AccordionModule,
        SidenavModule,
        ModalModule,
        ScrollToModule.forRoot(),
        MDBBootstrapModulesPro.forRoot(),
        ToastModule.forRoot(),
        AngularMyDatePickerModule
    ],
    providers: [ApiService, AuthenticationService, MDBSpinningPreloader, ToastService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [NgbdModalContent],
})
export class AppModule {}
