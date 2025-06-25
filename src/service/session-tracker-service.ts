import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import Endpoint from 'src/enum/endPoint';

@Injectable({
    providedIn: 'root'
})
export class SessionTrackerService {

    constructor(
        private http: HttpClient,
        @Inject(DOCUMENT) private document: Document
    ) { }

    initSessionTracking(): void {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.updateLoginTime();
        }

        // Attach unload event only once
        fromEvent(this.document.defaultView!, 'unload').subscribe(() => {
            this.updateLogoutTime(token);
        });
    }

    private updateLoginTime(): void {

        this.http.post(`${Endpoint.BASE_URL}${Endpoint.LOGIN}`, {}).subscribe({
            next: () => console.log('Login time updated'),
            error: err => console.error('Login update failed', err)
        });

    }

    private updateLogoutTime(token: string | null = null): void {
        if (!token) {
            console.warn('No auth token found, skipping logout update.');
            return;
        }
        const url = `${Endpoint.BASE_URL}${Endpoint.LOGOUT}`;
        const body = JSON.stringify({});
        const headers = {
            type: 'application/json'
        };

        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, body);
        } else {
            this.http.post(url, {}).subscribe({
                next: () => console.log('Logout time updated (fallback)'),
                error: err => console.error('Logout update failed', err)
            });
        }
    }
}
