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
    public static Boolean validateotp(Integer userenterdotp, String Email) {
        try {
            // Validate input parameters
            if(String.isBlank(Email)) {
                throw new AuraHandledException('Email cannot be blank');
            }
            
            if(userenterdotp == null || userenterdotp < 1000 || userenterdotp > 9999) {
                throw new AuraHandledException('Please enter a valid 4-digit OTP (1000-9999)');
            }
            
            // Query the most recent OTP
            List<Authentication_Object__c> otpset = [SELECT Id, OTP__c 
                                                   FROM Authentication_Object__c 
                                                   WHERE Email__c = :Email 
                                                   ORDER BY CreatedDate DESC 
                                                   LIMIT 1];
            
            if(otpset.isEmpty()) {
                throw new AuraHandledException('No OTP found for this email. Please request a new OTP.');
            }
            
            // Safely convert OTP to Integer
            Integer otpFromObject;
            try {
                otpFromObject = Integer.valueOf(otpset[0].OTP__c);
            } catch(Exception e) {
                throw new AuraHandledException('Invalid OTP format in system');
            }
            
            // Validate OTP match
            if(userenterdotp != otpFromObject) {
                throw new AuraHandledException('The entered OTP is incorrect. Please try again.');
            }
            
            // Clean up old OTPs
            try {
                List<Authentication_Object__c> allOtps = [SELECT Id FROM Authentication_Object__c WHERE Email__c = :Email];
                if(!allOtps.isEmpty()) {
                    delete allOtps;
                }
            } catch(DMLException e) {
                System.debug('Warning: Could not delete old OTPs: ' + e.getMessage());
                // Not critical enough to fail the validation
            }
            
            return true;
            
        } catch(Exception e) {
            // Ensure the error message is user-friendly
            String errorMsg = e.getMessage();
            if(errorMsg.contains('Script-thrown exception')) {
                errorMsg = 'An unexpected error occurred during OTP validation';
            }
            throw new AuraHandledException(errorMsg);
        }
    }


      
    
}