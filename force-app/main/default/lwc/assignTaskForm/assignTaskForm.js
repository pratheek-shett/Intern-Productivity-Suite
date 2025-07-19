import { LightningElement, wire, track } from 'lwc';
import getStatusPicklistValues from '@salesforce/apex/getpicklistdata.getStatusPicklistValues';
import Taskcreation from '@salesforce/apex/Taskcreation.Taskcreation';
import getStatus from '@salesforce/apex/Taskcreation.getStatus';
import updateTaskRecord from '@salesforce/apex/Taskcreation.updateTask';
import replaceFileOnTask from '@salesforce/apex/Taskcreation.replaceFileOnTask';
import deltask from '@salesforce/apex/Taskcreation.deltask';
import uploadAndDistributeTaskFile from '@salesforce/apex/Taskcreation.uploadAndDistributeTaskFile';
import uploadFileToTask from '@salesforce/apex/Taskcreation.uploadFileToTask';
import updateTaskWithPublicUrl from '@salesforce/apex/Taskcreation.updateTaskWithPublicUrl';
import submitAdminComment from '@salesforce/apex/Taskcreation.submitAdminComment';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class AssignTaskForm extends LightningElement {
    @track showModal = false;
    @track editableTask = {};
    @track uploadedFile;
    @track selectedTab = 'Pending';
    @track selectedTask = null;
@track currentTaskFile = null;

    @track allTasks = [];
    @track filteredTasks = [];
    @track currentPage = 1;
    pageSize = 5;
    @track enableissubmitbutton = false;
    @track completedandoverdue = false;

    @track title = '';
    @track description = '';
    @track dueDate = '';
    @track status = '';
    @track resourceUrl = '';
    @track selectedInternId = '';
    @track assignedbyemail = '';
    @track recordId;
    @track base64FileData = '';
    @track fileName = '';
    @track previewUrl;
    @track adminComment = '';
    @track pickitems = [];
    @track youtubeLink = ''; 
    wiredTaskResult;

    connectedCallback() {
       
        this.assignedbyemail = sessionStorage.getItem('adminEmail');
    }
   submitCommentHandler() {
    // call Apex to save comment on selected task
    submitAdminComment({ taskId: this.selectedTask.Id, comment: this.adminComment })
        .then(() => {
            this.showToast('Success', 'Comment submitted successfully', 'success');
            this.closeModal();
            this.refreshTaskList(); // if implemented
        })
        .catch(error => {
            this.showToast('Error', 'Failed to submit comment', 'error');
            console.error(error);
        });
}


    @wire(getStatus)
    wiredTasks(result) {
        this.wiredTaskResult = result;
        const { data, error } = result;
        if (data) {
            this.allTasks = data;
            this.filterTasks();
        } else if (error) {
            console.error('Error fetching tasks', error);
        }
    }

    @wire(getStatusPicklistValues)
    pickeritems({ data, error }) {
        if (data) {
            this.pickitems = data.map(value => ({
                label: value,
                value: value
            }));
        } else {
            console.error('Error loading picklist values:', error);
        }
    }
get modalTitle() {
    return this.isCompletedOrOverdue ? 'Submitted Task View' : 'Edit Task';
}

    handleChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    handleInternSelected(event) {
        this.selectedInternId = event.detail.recordId;
    }

    get totalPages() {
        return Math.ceil(this.filteredTasks.length / this.pageSize);
    }

    get paginatedTasks() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredTasks.slice(start, start + this.pageSize);
    }

    get paginationButtons() {
        return Array.from({ length: this.totalPages }, (_, i) => {
            const pageNum = i + 1;
            return {
                number: pageNum,
                cssClass: pageNum === this.currentPage
                    ? 'slds-button slds-button_brand'
                    : 'slds-button slds-button_neutral'
            };
        });
    }

    handleTabChange(event) {
        this.selectedTab = event.target.dataset.tab;
        this.filterTasks();
    }

    filterTasks() {
        const today = new Date();
        this.filteredTasks = this.allTasks.filter(task => {
            if (this.selectedTab === 'Overdue') {
                this.completedandoverdue = true;
                return task.Status__c !== 'Completed' && new Date(task.Due_Date__c) < today;
            }
            if (this.selectedTab === 'Pending') {
                this.completedandoverdue = true;
                return task.Status__c === 'Pending' || task.Status__c === 'Not Started';
            }
            this.completedandoverdue = false;
            return task.Status__c === this.selectedTab;
        });
    }

    handlePageChange(event) {
        this.currentPage = parseInt(event.target.dataset.page, 10);
    }

    handleUploadFile(event) {
        const file = event.target.files[0];
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            this.base64FileData = reader.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }

    // assigntask() {
    //     if (!this.selectedInternId) {
    //         alert('Please select an intern');
    //         return;
    //     }

    //     let createdTaskId;

    //     Taskcreation({
    //         title: this.title,
    //         description: this.description,
    //         dueDate: this.dueDate,
    //         status: this.status,
    //         internId: this.selectedInternId,
    //         resourceUrl: this.resourceUrl,
    //         assignedby: this.assignedbyemail,
    //         fileid: null
    //     }).then(result => {
    //         createdTaskId = result;
    //         this.recordId = result;

    //         if (this.base64FileData && this.fileName) {
    //             return uploadAndDistributeTaskFile({
    //                 base64Data: this.base64FileData,
    //                 fileName: this.fileName,
    //                 taskName: this.title
    //             }).then(publicUrl => {
    //                 this.previewUrl = publicUrl;
    //                 return updateTaskWithPublicUrl({
    //                     taskId: createdTaskId,
    //                     publicUrl: publicUrl
    //                 });
    //             });
    //         } else {
    //             return Promise.resolve();
    //         }
    //     }).then(() => {
    //         this.showToast('Task Assigned Successfully!', 'Task assigned', 'success');
    //         return refreshApex(this.wiredTaskResult);
    //     }).catch(error => {
    //         alert('Failed to assign task');
    //         console.error(error);
    //     });
    // }

    assigntask() {
    if (!this.selectedInternId) {
        this.showToast('Please select an intern', 'Validation Error', 'error');
        return;
    }

    Taskcreation({
        title: this.title,
        description: this.description,
        dueDate: this.dueDate,
        status: this.status,
        internId: this.selectedInternId,
        resourceUrl: this.resourceUrl,
        assignedby: this.assignedbyemail,
        fileid: null,
        youtubeLink: this.youtubeLink
    }).then(createdTaskId => {
        // If a file was uploaded, call the CORRECT Apex method
        if (this.base64FileData && this.fileName) {
            // Pass the taskId of the record we just created
            return uploadFileToTask({
                fileName: this.fileName,
                base64Data: this.base64FileData,
                taskId: createdTaskId 
            });
        }
        // If no file, resolve the promise to continue
        return Promise.resolve();
    }).then(() => {
        this.showToast('Task Assigned Successfully!', 'Success', 'success');
        this.cleanfields();
        // Optionally reset your form fields here
        return refreshApex(this.wiredTaskResult);
    }).catch(error => {
        let errorMessage = 'Failed to assign task. Please check the console.';
        if (error.body && error.body.message) {
            errorMessage = error.body.message;
        }
        this.showToast(errorMessage, 'Error', 'error');
        console.error('Error during task assignment: ', JSON.stringify(error));
    });
}
    // handleTaskClick(event) {
    //     const taskId = event.currentTarget.dataset.id;

    //     const task = this.allTasks.find(t => t.Id === taskId);
    //     this.editableTask = { ...task };
    //     this.recordId = taskId;

    //     if (this.isCompletedOrOverdue) {
    //         this.selectedTask = task;
    //     }

    //     this.uploadedFile = task.File_Public_URL_c__c ? { Title: 'Attached File' } : null;
    //     this.previewUrl = task.File_Public_URL_c__c || null;

    //     this.showModal = true;
    // }

    handleTaskClick(event) {
    const taskId = event.currentTarget.dataset.id;
    
    // Always refresh data before opening modal for completed tasks
    if (this.selectedTab === 'Completed') {
        this.refreshTaskData().then(() => {
            this.openModalForTask(taskId);
        }).catch(error => {
            console.error('Error refreshing task data:', error);
            // Still try to open modal with existing data
            this.openModalForTask(taskId);
        });
    } else {
        this.openModalForTask(taskId);
    }
}

// Add this new method to refresh task data
refreshTaskData() {
    return getStatus()
        .then(result => {
            this.allTasks = result;
            this.filterTasks();
        })
        .catch(error => {
            console.error('Error refreshing task data:', error);
        });
}

// Add this helper method to open modal
// openModalForTask(taskId) {
//     const task = this.allTasks.find(t => t.Id === taskId);
//     if (task) {
//         this.editableTask = { ...task };
//         this.recordId = taskId;
        
//         if (this.isCompletedOrOverdue) {
//             this.selectedTask = { ...task };
//             console.log('Selected task file URL:', task.File_Public_URL_c__c);
//         }
        
//         this.uploadedFile = task.File_Public_URL_c__c ? { Title: 'Attached File' } : null;
//         this.previewUrl = task.File_Public_URL_c__c || null;
        
//         this.showModal = true;
//     }
// }
openModalForTask(taskId) {
    const task = this.allTasks.find(t => t.Id === taskId);
    if (task) {
        this.editableTask = { ...task };
        this.recordId = taskId;
        
        // CRITICAL FIX: Set selectedTask for ALL tasks
        this.selectedTask = { ...task };
        
        // Set current file information
        this.setCurrentFileInfo(task);
        
        // Set file preview URL
        this.previewUrl = task.File_Public_URL_c__c || null;
        
        // Debug logging
        console.log('Selected task:', this.selectedTask);
        console.log('File URL:', this.selectedTask.File_Public_URL_c__c);
        
        this.showModal = true;
    }
}

// setCurrentFileInfo(task) {
//     if (task.File_Public_URL_c__c) {
//         this.currentTaskFile = {
//             url: task.File_Public_URL_c__c,
//             title: task.Name + ' - Attached File',
//             exists: true
//         };
//         this.uploadedFile = { Title: 'Attached File' };
//     } else {
//         this.currentTaskFile = null;
//         this.uploadedFile = null;
//     }
// }
setCurrentFileInfo(task) {
    if (task.File_Public_URL_c__c) {
        this.currentTaskFile = {
            url: task.File_Public_URL_c__c,
            title: task.Name + ' - Attached File',
            exists: true
        };
        this.uploadedFile = { Title: 'Attached File' };
    } else {
        this.currentTaskFile = null;
        this.uploadedFile = null;
    }
}

   closeModal() {
    this.showModal = false;
    this.adminComment = '';
    this.selectedTask = null;
    this.currentTaskFile = null;
    this.uploadedFile = null;
    this.previewUrl = null;
    this.editableTask = {};
}


    // get isCompletedOrOverdue() {
    //     if (!this.editableTask) return false;
    //     const status = this.editableTask.Status__c;
    //     const dueDate = new Date(this.editableTask.Due_Date__c);
    //     return status === 'Completed' || (status !== 'Completed' && dueDate < new Date());
    // }
    get isCompletedOrOverdue() {
    if (!this.selectedTask) return false;
    const status = this.selectedTask.Status__c;
    const dueDate = new Date(this.selectedTask.Due_Date__c);
    return status === 'Completed' || (status !== 'Completed' && dueDate < new Date());
}


    get fileTitle() {
        return this.uploadedFile?.Title || 'No file attached';
    }

    get downloadLink() {
        return `/sfc/servlet.shepherd/version/download/${this.uploadedFile?.LatestPublishedVersionId}`;
    }

    handleEditField(event) {
        const field = event.target.dataset.field;
        this.editableTask = { ...this.editableTask, [field]: event.target.value };
    }

    updateTask = () => {
        updateTaskRecord({ task: this.editableTask })
            .then(() => {
                this.showToast('Task updated successfully', 'Success', 'success');
                this.showModal = false;
                return refreshApex(this.wiredTaskResult);
            })
            .catch(error => {
                this.showToast('Failed to update task', 'Error', 'error');
                console.error(error);
            });
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
                this.showToast('File replaced successfully', 'Success', 'success');
            }).catch(err => {
                console.error(err);
                this.showToast('Failed to replace file', 'Error', 'error');
            });
        };
        reader.readAsDataURL(file);
    }

    handledeletetask(event) {
        event.preventDefault();
        event.stopPropagation();
        const taskid = event.target.dataset.id || event.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this task?')) {
            deltask({ ttaskid: taskid })
                .then(() => {
                    this.showToast('Task deleted successfully', 'Deleted', 'success');
                    return refreshApex(this.wiredTaskResult);
                })
                .catch(error => {
                    console.error('Delete failed:', error);
                    this.showToast('Failed to delete task', 'Error', 'error');
                });
        }
    }

    handleCommentChange(event) {
        this.adminComment = event.target.value;
        if(this.adminComment != null){
            this.enableissubmitbutton = true;
        }else{
            this.enableissubmitbutton = false;
        }
    }


    cleanfields(){
        this.title = '';
        this.description = '';
        this.dueDate= '';
        this.status = '';
        this.internId = '';
        this.resourceUrl = '';
        this.assignedby = '';
        this.fileid = '';
    }

    showToast(message, title, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }
}
