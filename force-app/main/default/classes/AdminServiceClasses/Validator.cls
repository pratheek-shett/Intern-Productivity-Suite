public without sharing class Validator {


    public static boolean datavalidated = false;

 
    
    //check email
    @AuraEnabled(cacheable = true)
    public static Boolean checkid(String emailid){
        if (String.isEmpty(emailid) || !emailid.endsWith('@gmail.com')) {
            throw new AuraHandledException('Invalid email format. Please use a valid Gmail address.');
        }
        return true;
    }
    

    @future
    public static void insertAuthObject(String email, String otp) {
    Authentication_Object__c authobj = new Authentication_Object__c();
    authobj.Email__c = email;
    authobj.OTP__c = otp;
    insert authobj;
}

    
    //generate otps
    @AuraEnabled(cacheable = false)
    public static integer generateotp(String email){


        try{
        Authentication_Object__c authobj = new Authentication_Object__c();

        Integer otpValue = (integer)(Math.floor(Math.random() *9000)+1000);
        insertAuthObject(email, String.valueOf(otpValue));
        return otpValue;

        }catch(Exception e){
            throw new AuraHandledException('Error generating OTP: ' + e.getMessage());

        }

    }
    
    //validate the otp
     @AuraEnabled(cacheable = false)
     public static Boolean validateotp(Integer userenterdotp, String Email){
        

        try{
        List< Authentication_Object__c > otpset = [SELECT Id, OTP__c, Email__c FROM Authentication_Object__c WHERE Email__c = :Email ORDER BY CreatedDate DESC LIMIT 1];
         
         if(otpset.isEmpty()){
             throw new AuraHandledException('OTP Generation Issue');
         }
         
         Integer otpFromObject = Integer.valueOf(otpset[0].OTP__c);
         
           if(userenterdotp == null || userenterdotp <1000 || userenterdotp > 9000){
                throw new AuraHandledException('Enter valid otp');
           }

           if(userenterdotp != otpFromObject){
           throw new AuraHandledException('Enterd otp is invalid');
           }
           
           List<Authentication_Object__c> allOtps = [SELECT Id FROM Authentication_Object__c WHERE Email__c = :Email];

           if(!allOtps.isEmpty()){
              delete allOtps;
           }
           
           return true;
        }catch(Exception e){
            throw new AuraHandledException('Error validating OTP: ' + e.getMessage());

        }
     
     }


      
    
}