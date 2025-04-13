import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CustomHeader extends LightningElement {
    @track showMobileMenu = false;
    

    toggleMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }

    handleMenuSelect(event) {
        const url = event.target.getAttribute('href');
        const selectedvalue = event.detail.value;
        this.showMobileMenu = false;

        if(url === '/smallscreenprofile'){
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/smallscreenprofile'
                }
            });
        }
    }
}