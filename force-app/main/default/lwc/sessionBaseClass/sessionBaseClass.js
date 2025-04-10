import { LightningElement } from 'lwc';
import Sessionrefresh from '@salesforce/apex/Sessioncontroler.Sessionrefresh';
import Sessionrevalidate from '@salesforce/apex/Sessioncontroler.Sessionrevalidate';
import returnemailforauth from '@salesforce/apex/Sessioncontroler.returnemailforauth';
import { NavigationMixin } from 'lightning/navigation';

export default class SessionBaseClass extends NavigationMixin(LightningElement) {
    sessioninterval;
    email;
    refreshHandler;

    async returnemail() {
        try {
            this.email = await returnemailforauth();
            return !!this.email; // return true if email exists
        } catch(error) {
            console.error('Error getting email:', error);
            return false;
        }
    }

    async connectedCallback() {
        try {
            // First get the email
            const hasEmail = await this.returnemail();
            
            if (!hasEmail) {
                this.navigatetologin();
                return;
            }

            // Set up session refresh on user activity
            this.refreshHandler = () => {
                Sessionrefresh({getemail: this.email})
                    .catch(error => console.error('Refresh failed:', error));
            };
            
            window.addEventListener('click', this.refreshHandler);
            window.addEventListener('scroll', this.refreshHandler);
            window.addEventListener('keypress', this.refreshHandler);

            // Initial session check
            await this.checkSession();
            
            // Set up periodic checks (every 30 seconds)
            this.sessioninterval = setInterval(() => {
                this.checkSession().catch(error => console.error('Periodic check failed:', error));
            }, 30000);
            
        } catch(error) {
            console.error('Initialization failed:', error);
            this.navigatetologin();
        }
    }

    disconnectedCallback() {
        window.removeEventListener('click', this.refreshHandler);
        window.removeEventListener('scroll', this.refreshHandler);
        window.removeEventListener('keypress', this.refreshHandler);
        clearInterval(this.sessioninterval);
    }

    async checkSession() {
        try {
            const isValid = await Sessionrevalidate({getemail: this.email});
            if (!isValid) {
                this.navigatetologin();
            }
        } catch(error) {
            console.error('Session check failed:', error);
            this.navigatetologin();
        }
    }

    navigatetologin() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/' 
            }
        });
    }
}