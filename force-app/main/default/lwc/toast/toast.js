import { LightningElement,track,api} from 'lwc';

export default class Toast extends LightningElement {
    @track enable = true;
    close(){
        this.enable = false;
    }

    @api title = "Succcess";
    @api message = "Reward Submitted Successfully";
    @api variant = "success";

     get toastclass (){
        return `slds-notify slds-notify_toast slds-theme_${this.variant}`;
    }

}