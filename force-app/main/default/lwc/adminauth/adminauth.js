import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import FirstName from '@salesforce/schema/Contact.FirstName';
//Imports for hide headers
import noHeader from '@salesforce/resourceUrl/NoHeader';
import HideLightningHeader from '@salesforce/resourceUrl/NoHeader';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import getemaildatafunction from '@salesforce/apex/Mailget.getemaildatafunction';
import sendingemail from '@salesforce/apex/Sendemail.sendingemail';
import Field from "@salesforce/schema/AccountHistory.Field";
import checkid from '@salesforce/apex/Validator.checkid';
import generateotp from '@salesforce/apex/Validator.generateotp'; //validateotp
import validateotp from '@salesforce/apex/Validator.validateotp';
import Sessioncreation from '@salesforce/apex/Sessioncontroler.Sessioncreation';
import { NavigationMixin } from 'lightning/navigation';

export default class Adminauth extends NavigationMixin(LightningElement)  {
  @track timecurrent
  @track emaillist = []
  @track dataer = {FirstName: "", LastName: ""};
  //User entered email address
  @track email = "";
  @track countdownDisplay = "";
  @track resendotpbtnvisibility = false;
  @track hideemailfield = false;
  //fomated otp generated variables
  @track otpdata;
  @track buttondisable = false;
  //user entered otp variable
  @track userenteredotp;
  @track buttonlabel = "Get OTP";
  @track firstbutton = true;
  @track secondbuttonlabel = "Submit";
  @track timeminutes;
  @track timestam = [];
  //togetlistofemailsfromapex
@track emaildata = [];
@track showotpfield = false;

//navigates to the home page
navigatetohome(e) {
  this[NavigationMixin.Navigate]({
    type: 'standard__webPage',
    attributes: {
        url: '/registerintern' 
    }
  });
}


  //GET USER INPUT DATA
  //Gets the user input and stores it in the variable
    runfunc(event) {
        let getname = event.target.name;
        if(getname === "emailid"){
            this.email = event.target.value;
            this.dataer.FirstName = event.target.value;
        }else if(getname === "name"){
            this.userenteredotp = event.target.value;
            this.dataer.LastName = event.target.value;
        }
    }

    
    //BUTTON CLICK FUNCTION

    //converts to lower case when user enters email
    //sanities user input
    //gets the apex class and passes user input and returns if present
    //first send otp button will be disabled and submit button will be enabled
    //Calls generateotp function
    //calls the sendemailfunction


     async btnclick (){
      try{
      //actual filtered email generated by users given email
     let getdatafromuser = this.email.toLowerCase();
      if(getdatafromuser.trim() === ""){
        window.alert("Please enter a valid email");
        return;
      }

      // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // if(!emailRegex.test(getdatafromuser)){
      //   window.alert("Invalid email format");
      //   return;
      // }
      // here check this same in the server end also   !!!  SERVER END
      // if(!getdatafromuser.endsWith("@gmail.com")){
      //     window.alert("authonticate error");
      //     return;
      //   }


      //checks email or not
      let valid = await checkid({emailid:getdatafromuser});
      console.log('checkid result:', valid);
      if(!valid){
        window.alert("Invalid email format. Please use a valid Gmail address.");
        return;
      }


      // checkid({emailid:getdatafsromuser})
      // .then((result) => {
      //   if(!result ||  result.length === 0){
      //     window.alert("Authentication error email not found");
      //     return Promise.reject("Email Validation Failed");
      //   }
      // });
        const result = await getemaildatafunction({usernameemail: getdatafromuser});
        console.log('getemaildatafunction result:', result);
        let lowerresult = result.map(item => item.Email.toLowerCase());
        if(lowerresult.includes(getdatafromuser)){
          this.viewenabler();
          this.firstbutton = false;
          this.buttondisable = true;
          this.otpgenerated(); //!!!  SERVER END !!
          this.sendautoemail();
          this.startCountdown();
          this.Otpresendtimer();
          return;
          
          
        }else{
         window.alert("Fetch error");
        }
 
       }catch(error){
        console.error('Error found: ', error.message);
        window.alert('Error found: ' + error.message);
       }

      
    }
    //TO SHOW THE OTP FIELD
    //Once user enters the email, and btnclick is called it disables email field and enables the otp field
    viewenabler(){
      this.showotpfield = true;
      this.hideemailfield = true;
    }


    async otpgenerated() {  //!!!  SERVER END !!
        // const randomnumber = Math.random()*9999;
        try{
          const otp =  generateotp({email: this.email});
          console.log(otp);
        }catch(error){
            window.alert(error.body.message);
            return;
           };
}

//Function to validate the otp given bu user and generated otp
//It also changes the button label from submit to submittes
//Navigationmixin is used to navigate to homepage component
//And the countdown display will be hidden once otp verified


//try to do it in server end
// async otpvalidate(){
//    validateotp(){
//     try{

//     }
//   }

async validateotp(){
    try{
      const validate = await validateotp({userenterdotp: this.userenteredotp, Email: this.email});
      if(validate === true){
        await Sessioncreation({getemail : this.email});
        sessionStorage.setItem('adminEmail', this.email);
        await new Promise(resolve => setTimeout(resolve, 300));
        this.secondbuttonlabel = "Submitted";
        this.countdownDisplay = '';
        this.navigatetohome();
        return;
      }
    }catch(error){
      console.error('Validation error:', error);
        window.alert(error.body?.message || 'An error occurred during validation');

    }
}
  // if(! this.userenteredotp){
  //   window.alert("Please enter your OTP");
  //   return;
  // }
  //   if(parseInt(this.userenteredotp) === this.otpdata ){
  //       this.secondbuttonlabel = "Submitted";
  //       this.countdownDisplay = '';
  //       this.navigatetohome();
  //   }else{
  //     window.alert("Invalid OTP");
  //   }
//Function to validate the otp given bu user and generated otp


submitdata(){
  this.validateotp(); //!!!  SERVER END !!
}

//Resend Button Function 
//startcountdown timer of 4sec
//change button to submit from get otp
//generates new otp using js
//sending email with new otp
//Otppresendtimer function disables resend otp button for 4 minutes
resendotp(){

    clearInterval(this.interval);
    this.secondbuttonlabel = "submit";
    this.otpgenerated(); //!!!  SERVER END !!
    this.sendautoemail(); 
    this.startCountdown();
    this.Otpresendtimer();
    return;
}


//RESEND OTP BUTTON TIMESET FOR 4 MINUTES
Otpresendtimer(){

  this.resendotpbtnvisibility = true;
  this.timeminutes = Date.now() + 240000;
  clearTimeout(this.timer);
   setTimeout((minu) => {
      this.resendotpbtnvisibility = false;
    }, 240000);
  }



  //SENDING EMAIL WITH OTP APEX

   sendautoemail(){
     sendingemail({toAddress: this.email});
    return;
  }



  //Function to show timeleft

startCountdown() {
    let timeLeft = 4 * 60; // 4 minutes in seconds

    const interval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        
        this.countdownDisplay = `Resend OTP by: ${minutes}:${seconds.toString().padStart(2, '0')}`; // Store in variable
        
        if (timeLeft === 0) {
            clearInterval(interval);
            this.countdownDisplay = '';
        } else {
            timeLeft--;
        }
    }, 1000);
}

}

//WIRE METHOD TO GET DATA FROM APEX
// @wire(getemaildatafunction,{usernameemail: "$email"})

// datafetchfromapex({data,error}){

//   if(data){
//       this.emaildata = data;
//   }else if(error)
//   window.alert("Fetch Error");
// }

  // getTimeLeft() {
  //   const timeLeft = Math.max(0, this.endTime - Date.now()); 
  //   const minutes = Math.floor(timeLeft / 60000);
  //   const seconds = Math.floor((timeLeft % 60000) / 1000);
  //   return`${minutes}m ${seconds}s`;
  // }

 //     fetch('https://randommer.io/api/Number/Generate?Min=1000&Max=9999&Quantity=1', {
  //         method: 'GET',
  //         headers: {
  //             'Accept': 'application/json', // Specify the response format
  //             'X-Api-Key': '', // Correct header key for API key
  //         }
  //     })
  //     .then(response => {
  //         if (!response.ok) {ö
  //             throw new Error('Network response was not ok: ' + response.statusText);
  //         }
  //         return response.json();
  //     })
  //     .then(data => {
  //         this.otpdata = data[0]; // Assuming the API returns an array
  //         console.log('OTP is: ' + this.otpdata);
  //     })
  //     .catch(error => {
  //         console.error('Error fetching OTP:', error);
  //     });
  // }


      
    //USER VALIDATION FUNCTION
    //  validate(getemail){

      
    //   //  var lowercaseemail = this.emaildata.map((item =>{return item.toLowerCase()}))

    //   // if(lowercaseemail.includes(getemail)){
    //   //   window.alert("email found");
    //   // }else{
    //   //   window.alert("not found");
    //   // }

    // }

      // const event = new ShowToastEvent({
        //     title: "Success",  // Provide a valid title
        //     message: "Button clicked!",  // Provide a valid message
        //     variant: "success"
        //      // Ensure variant is correctly written
        // });

        // this.buttonlabel = "Submitted";
        // this.buttonlabel = "Submit";
        // this.dispatchEvent(event);













