import { LightningElement,wire,track } from 'lwc';
import getStatusPicklistValues from '@salesforce/apex/getpicklistdata.getStatusPicklistValues'
import Taskcreation from '@salesforce/apex/Taskcreation.Taskcreation'
import getStatus from '@salesforce/apex/Taskcreation.getStatus'
import uploadFileToTask from '@salesforce/apex/Taskcreation.uploadFileToTask'
import updateTaskRecord from '@salesforce/apex/Taskcreation.updateTask';
import replaceFileOnTask from '@salesforce/apex/Taskcreation.replaceFileOnTask';
import generateTaskFilePublicUrl from '@salesforce/apex/Taskcreation.generateTaskFilePublicUrl';
import uploadAndDistributeTaskFile from '@salesforce/apex/Taskcreation.uploadAndDistributeTaskFile';
import updateTaskWithPublicUrl from '@salesforce/apex/Taskcreation.updateTaskWithPublicUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';


export default class AssignTaskForm extends LightningElement {
    @track showModal = false;
    @track editableTask = {};
    @track uploadedFile; 
    @track selectedTab = 'Pending';
    @track allTasks = [];
    @track title = '';
    @track description = '';
    @track dueDate = '';
    @track status = '';
    @track resourceUrl = '';
    @track selectedInternId = '';
    @track assignedbyemail = '';
    @track recordId;
    @track uploadedFileIds = [];
    wiredTaskResult;
    @track selectedFile;
    @track base64FileData;
    @track fileName = '';
    @track isLoadingFiles = false;
    @track previewUrlPublic; // Add this line to hold the ContentDistribution URL
    @track previewUrl = null;


//     @wire(getStatus)
// wiredTasks({ error, data }) {
//     this.wiredTaskResult = data;
//     if (data) {
//         this.allTasks = data;
//     } else if (error) {
//         console.error('Task fetch error', error);
//     }
// }

updateTask = () => {
    updateTaskRecord({ task: this.editableTask })
        .then(() => {
            this.showNotification('Task updated', 'success');
            this.showModal = false;
            return refreshApex(this.wiredTaskResult);
        })
        .catch(error => {
            console.error('Error updating task:', error);
            this.showNotification('Failed to update task', 'error');
        });
}
handleTaskClick(event) {
    const status = event.currentTarget.dataset.status;
    const taskId = event.currentTarget.dataset.id;

    if (status === 'Not Started') {
        this.isLoadingFiles = true;
        const taskToEdit = this.allTasks.find(t => t.Id === taskId);
        this.editableTask = { ...taskToEdit };
        this.recordId = taskId;

        const publicUrl = this.editableTask.File_Public_URL_c__c;

        if (publicUrl) {
            this.uploadedFile = { Title: 'Attached File' };  // Just for displaying title
            this.previewUrl = publicUrl;
        } else {
            this.uploadedFile = null;
            this.previewUrl = null;
        }

        this.showModal = true;
        this.isLoadingFiles = false;
    }
}








// Add this getter to your component
// Replace the existing getters with these:
get fileTitle() {
    return this.uploadedFile?.Title || 'Untitled Document';
}

// Remove both existing previewUrl getters and use this single one
get previewUrl() {
    return this.editableTask.File_Public_URL_c__c || null;
}


get downloadLink() {
    return `/sfc/servlet.shepherd/version/download/${this.uploadedFile?.LatestPublishedVersionId}`;
}


get showFilePreview() {
    const supportedTypes = ['pdf', 'png', 'jpeg', 'jpg', 'gif'];
    const fileExt = this.uploadedFile?.FileExtension?.toLowerCase();
    return this.previewUrl && supportedTypes.includes(fileExt);
}
handleViewDocument(event) {
    // Optional: Add any additional logic here
    // The link will open in new tab by default due to target="_blank"
}
handleReplaceFile(event) {
    const file = event.target.files[0];
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        replaceFileOnTask({
            fileName: this.fileName,
            base64Data: base64,
            taskId: this.recordId
        }).then(() => {
            alert('File replaced successfully');
        }).catch(err => {
            console.error(err);
            alert('Failed to replace file');
        });
    };
    reader.readAsDataURL(file);
}

handleEditField(event) {
    const field = event.target.dataset.field;
    this.editableTask = { ...this.editableTask, [field]: event.target.value };
}

closeModal() {
    this.showModal = false;
}

@wire(getStatus)
wiredTasks(result) {
    this.wiredTaskResult = result; // Store the result for refresh
    const { data, error } = result;
    if (data) {
        this.allTasks = data;
    } else if (error) {
        console.error('Task fetch error', error);
    }
}
get filteredTasks() {
    const today = new Date();
    return this.allTasks.filter(task => {
        if (this.selectedTab === 'Overdue') {
            return task.Status__c !== 'Completed' && new Date(task.Due_Date__c) < today;
        }
        if (this.selectedTab === 'Pending') {
            return task.Status__c === 'Pending' || task.Status__c === 'Not Started';
        }
        return task.Status__c === this.selectedTab;
    });
}
get fileTitle() {
    return this.uploadedFile?.Title || 'No file attached';
}

handleUploadFile(event){
    const file = event.target.files[0];
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove metadata
            this.base64FileData = base64;
        };
        reader.readAsDataURL(file);

}

uploadFileToTask() {
       if (this.base64FileData && this.fileName) {
    return uploadAndDistributeTaskFile({
        base64Data: this.base64FileData,
        fileName: this.fileName,
        taskName: this.title
    }).then(publicUrl => {
        this.previewUrl = publicUrl;
        this.editableTask.File_Public_URL_c__c = publicUrl; // If you want to use it for preview
    });
}

    }

handleTabChange(event) {
    this.selectedTab = event.target.dataset.tab;
}
    connectedCallback(){
        this.assignedbyemail = sessionStorage.getItem('adminEmail');
        console.log(this.assignedbyemail);
    }
showNotification() {
        const evt = new ShowToastEvent({
          title: 'Task Assigned',
          message: 'Task Assigned Successfully!',
          variant: 'success',
        });
        this.dispatchEvent(evt);
      }
selectedInternId
selectedInternName
    types = ['.pdf','.docx', '.png', '.jpeg'];

    handleChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }
handleInternSelected(event) {
    this.selectedInternId = event.detail.recordId;
    this.selectedInternName = event.detail.label;
} 
    @track pickitems = [];

       @wire(getStatusPicklistValues)
       pickeritems({ data, error }) {
        if (data) {
            this.pickitems = data.map(value => ({
                label: value,
                value: value
            }));
            
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }


   assigntask() {
    if (!this.selectedInternId) {
        alert('Please select an intern');
        return;
    }

    let createdTaskId;

    Taskcreation({
        title: this.title,
        description: this.description,
        dueDate: this.dueDate,
        status: this.status,
        internId: this.selectedInternId,
        resourceUrl: this.resourceUrl,
        assignedby: this.assignedbyemail,
        fileid: null // No need now
    }).then(result => {
        createdTaskId = result;
        this.recordId = result;

        if (this.base64FileData && this.fileName) {
            // Upload + get public URL
            return uploadAndDistributeTaskFile({
                base64Data: this.base64FileData,
                fileName: this.fileName,
                taskName: this.title
            }).then(publicUrl => {
                this.previewUrl = publicUrl;

                // Update the Task__c record with public link
                return updateTaskWithPublicUrl({
                    taskId: createdTaskId,
                    publicUrl: publicUrl
                });
            });
        } else {
            // No file, skip file upload step
            return Promise.resolve();
        }
    }).then(() => {
        // Always show toast and refresh
        this.showNotification();
        return refreshApex(this.wiredTaskResult);
    }).catch(error => {
        alert('Failed to assign task or upload file');
        console.error(error);
    });
}




    
}