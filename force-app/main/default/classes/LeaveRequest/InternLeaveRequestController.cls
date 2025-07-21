public without sharing class InternLeaveRequestController {
     @AuraEnabled(cacheable=true)
    public static List<Leave_Request__c> getLeaveRequests(String adminEmail) {
        return [
            SELECT Id, Name, Employee_Email__c, Description__c, Leave_Date__c, Status__c, Submitted_Date__c
            FROM Leave_Request__c
            WHERE Forwarded_To__c = :adminEmail
            ORDER BY Submitted_Date__c DESC
        ];
    }

    @AuraEnabled
    public static void updateLeaveStatus(Id leaveRequestId, String newStatus) {
        if (String.isBlank(newStatus) || !(newStatus == 'Approved' || newStatus == 'Rejected')) {
            throw new AuraHandledException('Invalid status provided.');
        }

        Leave_Request__c req = [SELECT Id, Status__c FROM Leave_Request__c WHERE Id = :leaveRequestId LIMIT 1];
        req.Status__c = newStatus;
        update req;
    }

}