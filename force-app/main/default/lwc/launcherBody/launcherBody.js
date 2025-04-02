import { LightningElement } from 'lwc';
import LandingImage from '@salesforce/resourceUrl/landingpagebackgroundimage';
import { NavigationMixin } from 'lightning/navigation';

export default class LauncherBody  extends  NavigationMixin(LightningElement) {
          value = "";
          disablednext = true;
    Backgroundimage = LandingImage;
    
    get rolesavailable(){
        return [
            { label : 'Admin', value : 'admin'},
            { label: 'Intern', value: 'intern' },
        ]
    }

    decidetonav(event){
      this.value = event.detail.value;
      if(this.value == ""){
        this.disablednext = true;
      }else{
        this.disablednext = false;
      }
    }

    navigatetointernauth(e) {

      if(this.value == 'intern'){
        this[NavigationMixin.Navigate]({
          type: 'standard__webPage',
          attributes: {
              url: '/internauthentication' 
          }
        });
      }else if(this.value == 'admin'){
        this[NavigationMixin.Navigate]({
          type: 'standard__webPage',
          attributes: {
              url: '/adminauthentication' 
          }
        });
      }
      
    }

   
    
    
}