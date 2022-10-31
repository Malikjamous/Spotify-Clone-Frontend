import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService implements OnDestroy {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;
    sub: Subscription;
    constructor(private router: Router) {
        // clear alert message on route change
        this.sub = router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }
    ngOnDestroy(): void {
        if (this.sub !== undefined) {
            this.sub.unsubscribe();
        }
    }

    success(message: string, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message });
    }

    error(message: string, keepAfterNavigationChange = false): void {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'error', text: message });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
