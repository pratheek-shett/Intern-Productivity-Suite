import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInternProfile from '@salesforce/apex/Internprofiledetails.getInternProfile';
import getProfileImageUrl from '@salesforce/apex/Internprofiledetails.getProfileImageUrl';
import createProfileImagePublicUrl from '@salesforce/apex/Internprofiledetails.createProfileImagePublicUrl';

export default class Internhomepage extends NavigationMixin(LightningElement) {
    imageurl = 'https://mitmanipal3-dev-ed.develop.my.salesforce.com/sfc/p/WU00000FgGe1/a/WU0000004pQX/_ZQOC0pksg3hpZ1jystAtyYSThyvE.h72gtMqJvElq8';
    @track welcomeName;
    @track isLoading = true;
    @track showProfileModal = false;
    @track internemail = '';
    @track firstname;
    @track profiledata = {};
    @track profileurl;
    @track profilePictureId;
    @track formattedDob = '';
    @track formattedJoiningDate = '';
    @track formattedEndDate = '';
    @track remainingDays = 0;

    async connectedCallback() {
        const emailid = sessionStorage.getItem('interndata')?.trim();
        console.log('Session email:', emailid);
        if (emailid) {
            getInternProfile({ email: emailid })
                .then((result) => {
                    if (result) {
                        this.profiledata = result;
                        this.firstname = result.First_Name__c;
                        this.profilePictureId = result.Profile_Picture_ID__c;
                        
                        if (this.profilePictureId) {
                            this.fetchProfileImage();
                        }
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

    fetchProfileImage() {
        if (this.profilePictureId) {
            console.log('Fetching profile image for ID:', this.profilePictureId);
            
            // First try to get an existing URL (cacheable)
            getProfileImageUrl({ contentDocumentId: this.profilePictureId })
                .then(url => {
                    console.log('Retrieved URL:', url);
                    if (url) {
                        this.profileurl = url;
                        // Check if it's an internal URL and we need a public one
                        if (url.includes('/sfc/servlet.shepherd/')) {
                            this.createPublicUrl();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching profile image URL:', error);
                });
        }
    }
    
    createPublicUrl() {
        // Create a public URL if needed (non-cacheable)
        createProfileImagePublicUrl({ contentDocumentId: this.profilePictureId })
            .then(publicUrl => {
                console.log('Created public URL:', publicUrl);
                if (publicUrl) {
                    this.profileurl = publicUrl;
                }
            })
            .catch(error => {
                console.error('Error creating public URL:', error);
            });
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

    handleAvatarClick() {
        this.showProfileModal = true;
    }

    closeModal() {
        this.showProfileModal = false;
    }
}