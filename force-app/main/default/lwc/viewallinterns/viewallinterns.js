import { LightningElement, track, wire } from 'lwc';
import getAllInterns from '@salesforce/apex/viewallinterns.getAllInterns';

export default class Viewallinterns extends LightningElement {
    @track interns = [];
    @track error;
    @track filteredInterns = [];
    @track isLoading = true;
    @track selectedIntern = null; // This will hold the data for the modal
@track searchTerm = '';
    @wire(getAllInterns)
    wiredInterns({ data, error }) {
        this.isLoading = false;
        if (data) {
            // Format dates for better display before rendering
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            this.interns = data.map(intern => ({
                ...intern,
                formattedJoiningDate: new Date(intern.Joining_Date__c).toLocaleDateString('en-US', options),
                formattedEndDate: new Date(intern.End_Date__c).toLocaleDateString('en-US', options)
                
            }));
            this.filteredInterns = [...this.interns];
            this.error = undefined;
        } else if (error) {
            this.error = error.body?.message || 'An unknown error occurred.';
            this.interns = [];
        }
    }

    // Opens the modal when "View Profile" is clicked
    handleViewProfile(event) {
        const internId = event.currentTarget.dataset.id;
        this.selectedIntern = this.interns.find(intern => intern.Id === internId);
    }

    // Closes the modal
    closeModal() {
        this.selectedIntern = null;
    }

    // Prevents the modal from closing when its content is clicked
    handleModalClick(event) {
        event.stopPropagation();
    }
    handleSearchChange(event){
        this.searchTerm = event.target.value.toLowerCase();
        this.filteredInterns = this.interns.filter(intern => {
            return (
                (intern.First_Name__c && intern.First_Name__c.toLowerCase().includes(this.searchTerm)) ||
                (intern.Last_Name__c && intern.Last_Name__c.toLowerCase().includes(this.searchTerm)) ||
                (intern.Email__c && intern.Email__c.toLowerCase().includes(this.searchTerm))
            );
        });



        
    }
}