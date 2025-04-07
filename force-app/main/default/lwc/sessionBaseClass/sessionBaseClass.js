import { LightningElement } from 'lwc';

import Sessionrefresh from '@salesforce/apex/Sessioncontroler.Sessionrefresh';
import Sessionrevalidate from '@salesforce/apex/Sessioncontroler.Sessionrevalidate';
import returnemailforauth from '@salesforce/apex/Sessioncontroler.returnemailforauth';
import { NavigationMixin } from 'lightning/navigation';


export default class SessionBaseClass extends NavigationMixin(LightningElement) {
    sessioninterval;
    email;
    refreshHandler;

    returnemail(){
         returnemailforauth().then(data => {
            this.email = data;
        });

    }

    connectedCallback(){
        
            this.refreshHandler = () => Sessionrefresh({getemail : this.email});
            window.addEventListener('click', this.refreshHandler);
            window.addEventListener('scroll', this.refreshHandler);
            window.addEventListener('keypress', this.refreshHandler);
            this.returnemail();

            setTimeout(() => {
                this.checkSession();
                this.sessioninterval = setInterval(() => this.checkSession(), 30000);
            }, 500);
            // this.checkSession();
            // this.sessioninterval = setInterval(() => this.checkSession(), 30000);
    }


    disconnectedCallback(){
        window.removeEventListener('click', this.refreshHandler);
         window.removeEventListener('scroll', this.refreshHandler);
         window.removeEventListener('keypress', this.refreshHandler);
        clearInterval(this.sessioninterval);
    }

    


    async checkSession() {
        try {
            const isValid = await Sessionrevalidate({getemail : this.email});
            if (!isValid) {
                this.navigatetologin();
            }
        } catch(error) {
            console.error('Session check failed:', error);
            this.navigatetologin();
        }
    }

    navigatetologin(e){
    this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
    attributes: {
        url: '/' 
    }
    })
}
      

}