import { LightningElement, track } from 'lwc';
import getInternTasks from '@salesforce/apex/Gettaskforintern.getInternTasks';

import completeInternTask from '@salesforce/apex/Gettaskforintern.completeInternTask';
import { refreshApex } from '@salesforce/apex';
export default class InternMyTask extends LightningElement {
    @track tasks = [];
    @track filteredTasks = [];
    @track currentTab = 'Ongoing';
    @track selectedTask;
     @track showModal = false;
     @track currentTab = 'Ongoing';
    @track resourceUrl = '';
    @track fileName = '';
    base64FileData = '';
    internEmail = sessionStorage.getItem('interndata')?.trim();

    connectedCallback() {
        getInternTasks({ internEmail: this.internEmail })
            .then(result => {
                this.tasks = result;
                this.filterTasks();
            })
            .catch(err => console.error('Error:', err));
    }
get tabClasses() {
    return {
        Ongoing: this.currentTab === 'Ongoing' ? 'tab active' : 'tab',
        Completed: this.currentTab === 'Completed' ? 'tab active' : 'tab',
        Overdue: this.currentTab === 'Overdue' ? 'tab active' : 'tab'
    };
}
    handleTabChange(event) {
        this.currentTab = event.target.dataset.tab;
        this.filterTasks();
    }

    getTabClass(tabName) {
        return `tab ${this.currentTab === tabName ? 'active-tab' : ''}`;
    }

    filterTasks() {
        const today = new Date();
        this.filteredTasks = this.tasks.filter(task => {
            if (this.currentTab === 'Ongoing') {
                return task.Status__c !== 'Completed' && new Date(task.Due_Date__c) >= today;
            }
            if (this.currentTab === 'Completed') {
                return task.Status__c === 'Completed';
            }
            if (this.currentTab === 'Overdue') {
                return task.Status__c !== 'Completed' && new Date(task.Due_Date__c) < today;
            }
            return false;
        });
    }

    isOngoing(task) {
        const dueDate = new Date(task.Due_Date__c);
        return task.Status__c !== 'Completed' && dueDate >= new Date();
    }

    isCompleted(task) {
        return task.Status__c === 'Completed';
    }

    handleOpenModal(event) {
    const taskId = event.currentTarget.dataset.id;
    const selected = this.tasks.find(t => t.Id === taskId);
     getInternTasks({ internEmail: this.internEmail })
        .then(result => {
            this.tasks = result;
            this.filterTasks();

            const selected = this.tasks.find(t => t.Id === taskId);
            if (selected) {
                this.selectedTask = selected;
                this.resourceUrl = selected.Resource_URL__c || '';
                this.showModal = true;
            }
        })
        .catch(err => console.error('Error refreshing task on modal open:', err));
    if (selected) {
        this.selectedTask = selected;
        this.resourceUrl = selected.Resource_URL__c || '';
        this.showModal = true;
    }

}



    isOverdue(task) {
        const dueDate = new Date(task.Due_Date__c);
        return task.Status__c !== 'Completed' && dueDate < new Date();
    }

    openSubmitModal(task) {
        this.selectedTask = task;
        this.resourceUrl = task.Resource_URL__c || '';
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.base64FileData = '';
        this.fileName = '';
    }

    handleResourceUrlChange(event) {
        this.resourceUrl = event.target.value;
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                this.base64FileData = reader.result.split(',')[1];
            };
            reader.readAsDataURL(file);
        }
    }

    handleSubmitTask() {
        if (!this.resourceUrl && !this.base64FileData) {
            alert('Please provide URL or upload a file');
            return;
        }

        completeInternTask({
            taskId: this.selectedTask.Id,
            resourceUrl: this.resourceUrl,
            base64Data: this.base64FileData,
            fileName: this.fileName
        })
        .then(() => {
            alert('Task submitted successfully');
            
            this.closeModal();
            return getInternTasks({ internEmail: this.internEmail });
            
        })
        .then(result => {
            this.tasks = result;
            this.filterTasks();
        })
        .catch(err => {
            console.error('Submission failed', err);
            alert('Submission failed');
        });
    }
}
