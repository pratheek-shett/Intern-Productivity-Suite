import { LightningElement } from 'lwc';
import AdminPageBackground from '@salesforce/resourceUrl/AdminPageBackground';

export default class InternRegistrationPage extends LightningElement {

    AdminPageBackground = AdminPageBackground;


    designationOptions = [
        { label: 'Intern', value: 'intern' },
        { label: 'Trainee Employee', value: 'trainee' }
    ];

    handleSubmit() {
        // Handle form submission
    }

    handleCancel() {
        // Handle cancel action
    }
}