public without sharing class Assigninternlist {
    @AuraEnabled(cacheable = true)
    public static List<Intern_Management_c__c> Assigninternlist(String getemailorname) {

        return[select id, First_Name__c,Last_Name__c,Email__c From Intern_Management_c__c where Email__c LIKE :('%' + getemailorname + '%') 
        or Last_Name__c lIKE :('%' + getemailorname + '%') OR  Email__c LIKE : ('%' + getemailorname + '%') LIMIT 5];

    }
}