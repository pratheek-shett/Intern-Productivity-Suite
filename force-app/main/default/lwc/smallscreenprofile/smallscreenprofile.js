import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInternProfile from '@salesforce/apex/Internprofiledetails.getInternProfile';

export default class Smallscreenprofile extends NavigationMixin(LightningElement) {
    @track profiledata = {};
    @track profileurl;
    @track formattedDob = '';
    @track formattedJoiningDate = '';
    @track formattedEndDate = '';
    @track remainingDays = 0;
    @track isLoading = true;

    connectedCallback() {
        const emailid = sessionStorage.getItem('interndata')?.trim();
        
        if (emailid) {
            getInternProfile({ email: emailid })
                .then((result) => {
                    if (result) {
                        this.profiledata = result;
                        this.calculateRemainingDays(result.End_Date__c);
                        this.formatDates(result);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.error('Error:', error);
                    this.isLoading = false;
                });
        } else {
            this.isLoading = false;
        }
    }

    calculateRemainingDays(endDate) {
        if (endDate) {
            const today = new Date();
            const end = new Date(endDate);
            this.remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        }
    }

    formatDates(profileData) {
        this.formattedDob = this.formatDate(profileData.Date_of_Birth__c);
        this.formattedJoiningDate = this.formatDate(profileData.Joining_Date__c);
        this.formattedEndDate = this.formatDate(profileData.End_Date__c);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    navigateBack() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/internhomepage'
            }
        });
    }
}