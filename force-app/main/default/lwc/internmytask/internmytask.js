import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getInternTask from '@salesforce/apex/Gettaskforintern.getInternTask';
import completeInternTask from '@salesforce/apex/Gettaskforintern.completeInternTask';
export default class Internmytask extends LightningElement {

   @track task;
    @track resourceUrl = '';
    @track fileName;
    base64FileData;
    internEmail;

    connectedCallback() {
        
        this.internEmail = sessionStorage.getItem('interndata')?.trim();// already set at login
        getInternTask({ internEmail: this.internEmail })
            .then(result => {
                this.task = result;
            })
            .catch(error => {
                console.error('Error fetching task', error);
            });
    }

    handleChange(event) {
        this.resourceUrl = event.target.value;
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        this.fileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
            this.base64FileData = reader.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }

    handleSubmitTask() {
        if (!this.resourceUrl || !this.base64FileData) {
            alert('Please enter a URL and upload a document');
            return;
        }

        completeInternTask({
            taskId: this.task.Id,
            resourceUrl: this.resourceUrl,
            base64Data: this.base64FileData,
            fileName: this.fileName
        })
            .then(() => {
                alert('Task submitted successfully');
                this.task.Status__c = 'Completed';
            })
            .catch(err => {
                console.error('Error submitting task', err);
                alert('Failed to submit');
            });
    }
}

