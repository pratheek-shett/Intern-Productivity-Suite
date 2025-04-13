public without sharing class Internprofiledetails {
    @AuraEnabled(cacheable=true)
    public static Intern_Management_c__c getInternProfile(String email) {
        return [
            SELECT 
                First_Name__c, 
                Last_Name__c,
                Date_of_Birth__c,
                Phone__c,
                Email__c,
                Address__c,
                Designation__c,
                Joining_Date__c,
                End_Date__c,
                Profile_Picture_ID__c
            FROM Intern_Management_c__c
            WHERE Email__c = :email
            LIMIT 1
        ];
    }
}