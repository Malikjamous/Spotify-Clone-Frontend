import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../Services/alert.service';


@Component({
    // tslint:disable-next-line: component-selector
    selector: 'alert',
    templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;
    displayMessage = true;
    constructor(private alertService: AlertService) { }

    ngOnInit(): void {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
            this.hideMessage();
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    hideMessage(): void {
        this.displayMessage = true;
        setTimeout(() => {
            this.displayMessage = false;
        }, 2000);
    }
}
