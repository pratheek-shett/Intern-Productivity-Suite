public with sharing class getpicklistdata {
    @AuraEnabled(cacheable=true)
    public static List<String> getStatusPicklistValues() {
        List<String> picklistValues = new List<String>();
        
        
        Schema.DescribeFieldResult fieldResult = Task_c__c.Status__c.getDescribe();

       
        List<Schema.PicklistEntry> values = fieldResult.getPicklistValues();

        for (Schema.PicklistEntry entry : values) {
            picklistValues.add(entry.getLabel());
        }

        return picklistValues;
    }
}