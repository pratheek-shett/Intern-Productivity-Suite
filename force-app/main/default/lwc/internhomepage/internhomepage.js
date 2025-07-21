import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInternProfile from '@salesforce/apex/Internprofiledetails.getInternProfile';
import createProfileImagePublicUrl from '@salesforce/apex/Internprofiledetails.createProfileImagePublicUrl';
import getInternHomeData from '@salesforce/apex/internhome.getInternHomeData'; // Apex for dashboard data

export default class Internhomepage extends NavigationMixin(LightningElement) {
    // --- Profile Properties ---
    @track firstname;
    @track profiledata = {};
    @track profileurl;
    @track remainingDays = 0;
    @track formattedDob = '';
    @track formattedJoiningDate = '';
    @track formattedEndDate = '';
    
    // --- Dashboard Card Properties ---
    @track latestTask;
    @track upcomingTask;
    @track recentLeave;

    // --- UI Control Properties ---
    @track isLoading = true;
    @track showProfileModal = false;
    @track showChatWindow = false;
    chatInitialized = false;

    connectedCallback() {
        const emailid = sessionStorage.getItem('interndata')?.trim();
        if (emailid) {
            this.loadInitialData(emailid);
        } else {
            console.warn('No email found in sessionStorage');
            this.firstname = 'Intern';
            this.isLoading = false;
        }
    }

    // --- Data Loading ---
    async loadInitialData(emailid) {
        this.isLoading = true;
        try {
            // Use Promise.all to fetch profile and dashboard data concurrently for faster loading
            const [profileResult, homeDataResult] = await Promise.all([
                getInternProfile({ email: emailid }),
                getInternHomeData({ email: emailid })
            ]);

            // Process Profile Data
            if (profileResult) {
                this.profiledata = profileResult;
                this.firstname = profileResult.First_Name__c;
                if (profileResult.Profile_Picture_ID__c) {
                    this.fetchProfileImage(profileResult.Profile_Picture_ID__c);
                }
                this.calculateRemainingDays(profileResult.End_Date__c);
                this.formatDates(profileResult);
            } else {
                this.firstname = 'Intern';
            }

            // Process Dashboard Data using the new helper methods
            this.latestTask = this.processTaskData(homeDataResult.latestTask);
            this.upcomingTask = this.processTaskData(homeDataResult.upcomingTask);
            this.recentLeave = this.processLeaveData(homeDataResult.recentLeave);

        } catch (error) {
            console.error('Error fetching initial data:', error);
            this.firstname = 'Intern'; // Set a default name on error
        } finally {
            this.isLoading = false; // Stop loading spinner regardless of success or error
        }
    }
    
    // --- Data Processing Helpers (The new JS changes go here) ---

    processTaskData(task) {
        if (!task) return null;
        return {
            ...task,
            statusClass: this.getStatusClass(task.Status__c),
            formattedDueDate: this.formatDate(task.Due_Date__c)
        };
    }

    processLeaveData(leave) {
        if (!leave) return null;
        return {
            ...leave,
            statusClass: this.getStatusClass(leave.Status__c),
            formattedLeaveDate: this.formatDate(leave.Leave_Date__c)
        };
    }

    getStatusClass(status) {
        if (!status) return 'status-badge';
        const lowerStatus = status.toLowerCase();

        if (lowerStatus.includes('pending') || lowerStatus.includes('progress')) {
            return 'status-badge status-pending';
        } else if (lowerStatus.includes('completed') || lowerStatus.includes('approved')) {
            return 'status-badge status-approved';
        } else if (lowerStatus.includes('cancelled') || lowerStatus.includes('rejected')) {
            return 'status-badge status-rejected';
        }
        return 'status-badge';
    }

    // --- Profile & Date Formatting ---

    fetchProfileImage(profilePictureId) {
        createProfileImagePublicUrl({ contentDocumentId: profilePictureId })
            .then(publicUrl => {
                this.profileurl = publicUrl;
            })
            .catch(error => {
                console.error('Error creating public URL:', error);
            });
    }

    calculateRemainingDays(endDate) {
        if (endDate) {
            const today = new Date();
            const end = new Date(endDate);
            const diffTime = end - today;
            this.remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
    }

    formatDates(profileData) {
        this.formattedDob = this.formatDate(profileData.Date_of_Birth__c);
        this.formattedJoiningDate = this.formatDate(profileData.Joining_Date__c);
        this.formattedEndDate = this.formatDate(profileData.End_Date__c);
    }
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    // --- Modal & Chat Handlers ---
    handleAvatarClick() {
        this.showProfileModal = true;
    }

    closeModal() {
        this.showProfileModal = false;
    }
}