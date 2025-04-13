import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CustomHeader extends LightningElement {
    @track showMobileMenu = false;
    

    toggleMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }

    handleMenuSelect(event) {
        const selectedvalue = event.detail.value;
        this.showMobileMenu = false;

        switch(selectedvalue){
            case 'dashboard' : this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/dashboard'
                }
            });
            break;
            case 'mytask':
                // Add navigation for MyTask
                break;
            case 'trackleave':
                // Add navigation for Track Leave
                break;
        }
    }
}