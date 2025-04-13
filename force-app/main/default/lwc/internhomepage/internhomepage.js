import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInternProfile from '@salesforce/apex/Internprofiledetails.getInternProfile'; //getfirstname


export default class Internhomepage extends NavigationMixin(LightningElement) {

    @track welcomeName; 
    @track isLoading = true;
    @track showProfileModal = false;
    @track internemail = '';
    @track firstname;
    @track profiledata = {};
    @track profileurl;
    @track formattedDob = '';
    @track formattedJoiningDate = '';
    @track formattedEndDate = '';
    @track remainingDays = 0;

    async connectedCallback(){
        const emailid = sessionStorage.getItem('interndata')?.trim();

      

        console.log('Session email:', emailid); 

        if (emailid) {
            getInternProfile({ email: emailid })
                .then((result) => {
                    if (result) {
                        this.profiledata = result;
                        this.firstname = result.First_Name__c;
                        this.calculateRemainingDays(result.End_Date__c);
                        this.formatDates(result);
                    } else {
                        this.firstname = 'Intern';
                    }
                    this.internemail = emailid;
                    this.isLoading = false;
                })
                
                .catch((error) => {
                    console.error('Error:', error);
                    this.firstname = 'Intern';
                    this.internemail = emailid;
                    this.isLoading = false;
                });

               
            
        } else {
            this.firstname = 'Intern';
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



handleAvatarClick(){
    this.showProfileModal = true;
}
closeModal() {
    this.showProfileModal = false;
}
}
