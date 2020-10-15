import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
};
const apiUrl = "/api";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(public http: HttpClient, private _scrollToService: ScrollToService) {
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    };

    private extractData(res: Response) {
        const body = res;
        return body || {};
    }

    getZillow(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_zillow', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    SendLife(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/send_life', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    sendEmail(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/send_more_email', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    sendLifeEmail(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/send_life_email', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getDataByID(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/getDataByID', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getUserByID(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/getUserByID', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getLinkByID(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/getLinkByID', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    register(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/register', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }


    addGroup(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/add_group', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }


    getGroups(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_groups', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    deleteGroup(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/delete_group', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    addLink(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/add_link', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getAllLinks(): Observable<any> {
        return this.http.get('http://localhost:3000/api/get_all_links', httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getAllUsers(): Observable<any> {
        return this.http.get('http://localhost:3000/api/get_all_users', httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getStatistics(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_statistics', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    checkAdmin(): Observable<any> {
        return this.http.get('http://localhost:3000/api/check_admin', httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    deleteUser(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/delete_user', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    deleteLink(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/delete_link', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    sendMessage(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/send_message', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    public triggerScrollTo(destination) {

        const config: ScrollToConfigOptions = {
            target: destination
        };

        this._scrollToService.scrollTo(config);
    }

    getPlymouth(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_plymouth', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }


    getStillWater(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_stillwater', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }


    getUniversal(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_universal', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }


    getNeptuneFlood(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_neptuneflood', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }

    getHavenLife(data): Observable<any> {
        return this.http.post('http://localhost:3000/api/get_havenlife', data, httpOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError));
    }
}
