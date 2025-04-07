import { LightningElement } from 'lwc';
import AdminPageBackground from '@salesforce/resourceUrl/AdminPageBackground';
import IsAtLeast18YearsOld from '@salesforce/apex/GetInterRegistration.IsAtLeast18YearsOld';
import GetInternDetails from '@salesforce/apex/GetInterRegistration.GetInternDetails';
import SessionBaseClass from 'c/sessionBaseClass';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class InternRegistrationPage extends SessionBaseClass {

    AdminPageBackground = AdminPageBackground;
    
    designationOptions = [
        { label: 'Intern', value: 'intern' },
        { label: 'Trainee Employee', value: 'trainee' }
    ];

    async handleSubmit() {
        try {

            // Get all input fields
            const inputFields = this.template.querySelectorAll(
                'lightning-input, lightning-combobox, lightning-textarea'
            );
            
            // Validate all required fields
            let allValid = true;
            inputFields.forEach(field => {

                if(field.required && !field.value) {
                    field.reportValidity();
                    allValid = false;
                }
            });
            
            if(!allValid) {
                return;
            }
            
            // Prepare form data
            let formData = {};
            inputFields.forEach(field => {
                formData[field.name] = field.value;
            });
            
            // Call Apex method
            const boolvalue = await GetInternDetails({ getinfofromui: formData });
            if(boolvalue){
                const event = new ShowToastEvent({
                  title: 'Get Help',
                  message:
                'success',
             });
              this.dispatchEvent(event);
            }else{

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || error.message,
                        variant: 'error'
                    })
                );
            }
            
            // Reset form after successful submission
            this.resetForm();
            
        } catch(error) {
            console.error(error);
        }
    }

    resetForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input, lightning-combobox, lightning-textarea'
        );
        inputFields.forEach(field => {
            field.value = '';
        });
    }

    handleCancel() {
        this.resetForm();
    }
}