public without sharing class Sendemail {

@AuraEnabled(cacheable = false)

public static void sendingemail(String toAddress){

   Emailstore__mdt emailfrom = [select Senderemail__c from Emailstore__mdt limit 1];


   if(Limits.getEmailInvocations() >= Limits.getLimitEmailInvocations()){
      throw new AuraHandledException('System busy, please try again later');
    }
   
   try{

      delete [SELECT Id FROM Authentication_Object__c 
               WHERE Email__c = :toAddress LIMIT 100];

    integer getOTP = Validator.generateotp(toAddress);
    if(getOTP == null){
       throw new AuraHandledException('No OTP Found');
    }
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    email.setToAddresses(new String[] {toAddress});
    email.setSubject('Authenticate OTP');
    email.setReplyTo(emailfrom.Senderemail__c);
   

    lwcutlity__mdt orgid = [select OrgKeyId__c from lwcutlity__mdt limit 1];
    // Set the correct organization-wide email address ID
    email.setOrgWideEmailAddressId(orgid.OrgKeyId__c);
    email.setPlainTextBody('Hello Please verify the OTP : ' + getOTP);
    Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
    System.debug('sent email');

   }catch (Exception e) {
      System.debug('Error sending email: ' + e.getMessage());
      throw new AuraHandledException('Error sending email: ' + e.getMessage());
  }
    
}
    
// public static void sendingemail(String toAddress, integer otp){
//     Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
//     email.setToAddresses(new String[] {toAddress});
//     email.setSubject('Authenticate OTP');
//     email.setPlainTextBody('Hello Please verify the OTP : ' + otp);
//     Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
// }

}