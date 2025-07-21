public without sharing class viewallinterns {
  @AuraEnabled(cacheable=true)
    public static List<Intern_Management_c__c> getAllInterns() {
        return [
            SELECT Id, First_Name__c, Last_Name__c, Email__c, Phone__c, Designation__c,
                   Joining_Date__c, End_Date__c, Profile_Image_URL__c, Address__c
            FROM Intern_Management_c__c
            ORDER BY Joining_Date__c DESC
        ];
    }
}