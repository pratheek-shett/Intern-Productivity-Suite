import { LightningElement,track,wire } from 'lwc';
import getTotalInternCount from '@salesforce/apex/DashboardController.getTotalInternCount';
import getMostActiveIntern from '@salesforce/apex/DashboardController.getMostActiveIntern';
import getActiveInternCount from '@salesforce/apex/DashboardController.getActiveInternCount';
import getPendingLeaveCount from '@salesforce/apex/DashboardController.getPendingLeaveCount';
import getMostInactiveIntern from '@salesforce/apex/DashboardController.getMostInactiveIntern';
import { NavigationMixin } from 'lightning/navigation';

export default class AdminHomePage extends LightningElement {
@track metrics = {};
    @track mostActiveIntern;
     @track totalInterns = 0;
    @track activeInterns = 0;
    @track inactiveInterns = 0;
    @track pendingLeaves = 0;
    @track mostInactive;
    isLoading = true;
_chartRendered = false;
    connectedCallback() {
    this.fetchMostActiveIntern();
}

@wire(getActiveInternCount)
wiredActive({ error, data }) {
    if (data !== undefined) {
        this.activeInterns = data;
        this.calculateInactive(); // only after active is set
    }
}
    // Wire methods
    @wire(getTotalInternCount)
    wiredTotal({ error, data }) {
        if (data !== undefined) {
            this.totalInterns = data;
            this.calculateInactive();
        }
    }

    fetchMostActiveIntern() {
    getMostActiveIntern()
        .then(result => {
            this.mostActiveIntern = result;
        })
        .catch(error => {
            console.error('Error fetching most active intern', error);
        });
}

    @wire(getPendingLeaveCount)
    wiredLeave({ error, data }) {
        if (data !== undefined) {
            this.pendingLeaves = data;
        }
    }

    @wire(getMostInactiveIntern)
    wiredInactive({ error, data }) {
        if (data !== undefined) {
            this.mostInactive = data;
        }
    }

    calculateInactive() {
        this.inactiveInterns = this.totalInterns - this.activeInterns;
    }
   




}