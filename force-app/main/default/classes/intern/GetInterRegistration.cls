public with sharing class GetInterRegistration {
    @AuraEnabled
    public static Boolean GetInternDetails(Map<String, Object> getinfofromui) {
        try {
           
            if(getinfofromui == null || getinfofromui.isEmpty()) {
                throw new AuraHandledException('Please fill all required fields');
            }
            
           
            Intern_Management_c__c interndetails = new Intern_Management_c__c();
            
            
            interndetails.First_Name__c = (String)getinfofromui.get('firstname');
            interndetails.Last_Name__c = (String)getinfofromui.get('lastname');
            interndetails.Email__c = (String)getinfofromui.get('email');
            interndetails.Phone__c = (String)getinfofromui.get('phone');
            interndetails.Designation__c = (String)getinfofromui.get('designation');
            interndetails.Address__c = (String)getinfofromui.get('address');
            
            String dobString = (String)getinfofromui.get('dob');
            String dojString = (String)getinfofromui.get('doj');
            String iedString = (String)getinfofromui.get('IED');
            
            interndetails.Date_of_Birth__c = Date.valueOf(dobString);
            interndetails.Joining_Date__c = Date.valueOf(dojString);
            interndetails.End_Date__c = Date.valueOf(iedString);
            
           
            insert interndetails;

            return true;
            
        } catch(Exception e) {
           return false;
        }
    }
    
    @AuraEnabled
    public static Boolean IsAtLeast18YearsOld(Date birthDate) {
        Date today = Date.today();
        Date eighteenYearsAgo = today.addYears(-18);
        return birthDate <= eighteenYearsAgo;
    }
}