import { LightningElement, track } from 'lwc';

import submitLeave from '@salesforce/apex/Internapplyleave.submitLeave';

import getMyLeaveRequests from '@salesforce/apex/Internapplyleave.getMyLeaveRequests';

export default class Internleaveapproval extends LightningElement {



    @track email = '';

    @track reason = '';

    @track leaveDate = null;



    @track leaveRequests = [];



    @track showToast = false;

    @track toastTitle = '';

    @track toastMessage = '';

    @track toastVariant = '';



    handleNameChange(event) {

        this.email = event.target.value;

        if (this.email && this.email.includes('@')) {

            this.fetchLeaveRequests();

        }

    }



    handleDateChange(event) {

        this.leaveDate = event.target.value;

    }



    handleDescriptionChange(event) {

        this.reason = event.target.value;

    }



    submitRequest() {

        submitLeave({ email: this.email, description: this.reason, leaveDate: this.leaveDate })

            .then(() => {

                this.showToastMessage('Success', 'Leave request submitted successfully.', 'success');

                this.email = '';

                this.reason = '';

                this.leaveDate = null;



                const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');

                inputs.forEach(input => input.value = '');



                this.fetchLeaveRequests();

            })

            .then(() => {

                this.fetchLeaveRequests();

            })

            .catch(error => {

                this.showToastMessage('Error', error.body.message, 'error');

            });

    }



    fetchLeaveRequests() {

        getMyLeaveRequests({ email: this.email })

            .then(data => {

                this.leaveRequests = data.map(req => ({

                    ...req,

                    statusClass: this.getStatusClass(req.Status__c)

                }));

            })

            .catch(err => {

                console.error(err);

            });

    }





    showToastMessage(title, message, variant) {

        this.toastTitle = title;

        this.toastMessage = message;

        this.toastVariant = variant;

        this.showToast = true;

        setTimeout(() => {

            this.showToast = false;

        }, 4000);

    }



    getStatusClass(status) {

        if (status === 'Pending') {

            return 'status-pending';

        } else if (status === 'Approved') {

            return 'status-accepted';

        } else if (status === 'Rejected') {

            return 'status-rejected';

        }

        return '';

    }





}