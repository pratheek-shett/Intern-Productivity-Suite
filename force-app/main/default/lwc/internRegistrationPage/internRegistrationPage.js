import { LightningElement, track } from 'lwc';
import AdminPageBackground from '@salesforce/resourceUrl/AdminPageBackground';
import uploadFile from '@salesforce/apex/GetInterRegistration.uploadFile';
import SessionBaseClass from 'c/sessionBaseClass';
import GetInternDetails from '@salesforce/apex/GetInterRegistration.GetInternDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class InternRegistrationPage extends LightningElement {
    AdminPageBackground = AdminPageBackground;
    @track photoFile;
    @track govtIdFile;
    @track photoBase64;
    @track govtIdBase64;


    // connectedCallback() {
    //     super.connectedCallback();
    // }

    // disconnectedCallback(){
    //     super.disconnectedCallback();
    // }

    showNotification() {
        const evt = new ShowToastEvent({
          title: 'Intern Registration',
          message: 'Registration submitted successfully!',
          variant: 'success',
        });
        this.dispatchEvent(evt);
      }
    designationOptions = [
        { label: 'Intern', value: 'intern' },
        { label: 'Trainee Employee', value: 'trainee' }
    ];

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.photoFile = file;
            this.encodeFileToBase64(file).then(result => {
                this.photoBase64 = result;
            });
        }
    }

    handleGovtIdUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.govtIdFile = file;
            this.encodeFileToBase64(file).then(result => {
                this.govtIdBase64 = result;
            });
        }
    }

    encodeFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    async handleSubmit() {
        try {
            const inputFields = this.template.querySelectorAll(
                'lightning-input, lightning-combobox, lightning-textarea'
            );
            
            let allValid = true;
            inputFields.forEach(field => {
                if(field.required && !field.value) {
                    field.reportValidity();
                    allValid = false;
                }
            });

            if(!allValid) return;
            
            let formData = {};
            inputFields.forEach(field => {
                formData[field.name] = field.value;
            });

            // Upload files first if they exist
            let photoFileId, govtIdFileId;
            
            if (this.photoFile) {
                photoFileId = await this.uploadFileToServer(this.photoFile, this.photoFile.name, 'Profile Photo');
                formData.photofile = photoFileId;
            }
            
            if (this.govtIdFile) {
                govtIdFileId = await this.uploadFileToServer(this.govtIdFile, this.govtIdFile.name, 'Government ID');
                formData.govtidfile = govtIdFileId;
            }
            
            const boolvalue = await GetInternDetails({ getinfofromui: formData });
            
            if(boolvalue) {
                
                this.resetForm();
                this.showNotification();
            } else {
                this.showToast('Error', 'Registration submitted successfully!', 'error')
            }
        } catch(error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body?.message || error.message,
                variant: 'error'
            }));
        }
    }

    async uploadFileToServer(file, fileName, fileDescription) {
        try {
            const result = await uploadFile({
                base64Data: await this.encodeFileToBase64(file),
                fileName: fileName,
                fileDescription: fileDescription
            });
            return result;
        } catch (error) {
            throw new Error('File upload failed: ' + error.message);
        }
    }

    resetForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input, lightning-combobox, lightning-textarea, input[type="file"]'
        );
        inputFields.forEach(field => {
            field.value = '';
        });
        this.photoFile = null;
        this.govtIdFile = null;
        this.photoBase64 = null;
        this.govtIdBase64 = null;
    }

    handleCancel() {
        this.resetForm();
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
                mode: 'dismissable'
            })
        );
    }
}