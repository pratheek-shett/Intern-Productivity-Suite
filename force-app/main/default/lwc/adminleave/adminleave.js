import { LightningElement, track } from 'lwc';
import getLeaveRequests from '@salesforce/apex/InternLeaveRequestController.getLeaveRequests';
import updateLeaveStatus from '@salesforce/apex/InternLeaveRequestController.updateLeaveStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Adminleave extends LightningElement {
    @track leaveRequests;
    @track error;
    @track emailid;
    isLoading = false;

    // Getter to easily check if there are requests to display
    get hasRequests() {
        return this.leaveRequests && this.leaveRequests.length > 0;
    }

    connectedCallback() {
        this.emailid = sessionStorage.getItem('adminEmail')?.trim();
        this.loadRequests();
    }

    loadRequests() {
        this.isLoading = true;
        const adminEmail = this.emailid;

        getLeaveRequests({ adminEmail })
            .then(result => {
                this.leaveRequests = result.map(req => {
                    // Create a dynamic CSS class for the status badge
                    let statusClass = 'status-badge ';
                    if (req.Status__c === 'Approved') {
                        statusClass += 'status-approved';
                    } else if (req.Status__c === 'Rejected') {
                        statusClass += 'status-rejected';
                    } else { // Pending
                        statusClass += 'status-pending';
                    }

                    // Format the date for better readability
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = new Date(req.Leave_Date__c).toLocaleDateString('en-US', options);

                    // Return a new object with our new properties
                    return {
                        ...req,
                        canAct: req.Status__c === 'Pending',
                        statusClass: statusClass,
                        formattedDate: formattedDate
                    };
                });
                this.error = null;
            })
            .catch(error => {
                this.error = error.body?.message || 'Failed to load requests.';
                this.leaveRequests = null;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleApprove(event) {
        this.updateRequestStatus(event.target.dataset.id, 'Approved');
    }

    handleReject(event) {
        this.updateRequestStatus(event.target.dataset.id, 'Rejected');
    }

    updateRequestStatus(id, status) {
        this.isLoading = true;
        updateLeaveStatus({ leaveRequestId: id, newStatus: status })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: `Request has been ${status}`, variant: 'success' }));
                this.loadRequests(); // Refresh list after update
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: error.body?.message, variant: 'error' }));
                this.isLoading = false;
            });
    }
}