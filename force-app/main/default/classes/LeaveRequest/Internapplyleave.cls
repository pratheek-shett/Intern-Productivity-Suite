public without sharing class Internapplyleave {
  @AuraEnabled
    public static void submitLeave(String email, String description, Date leaveDate) {
        try {
            if(String.isBlank(email) || String.isBlank(description) || leaveDate == null){
                throw new AuraHandledException('All fields are required.');
            }

            // Step 1: Get task created by email from Task__c
            List<Task_c__c> taskList = [
                SELECT Task_Created_By__c 
                FROM Task_c__c 
                WHERE Assigned_Intern__r.Email__c = :email 
                AND Task_Created_By__c != null 
                LIMIT 1
            ];

            if (taskList.isEmpty()) {
                throw new AuraHandledException('No task found for this intern.');
            }

            String adminEmail = taskList[0].Task_Created_By__c;

            // Step 2: Find matching Contact where Is_Admin__c = true
            List<Contact> adminContacts = [
                SELECT Id, Email 
                FROM Contact 
                WHERE Email = :adminEmail 
                AND Is_Admin__c = true 
                LIMIT 1
            ];

            if (adminContacts.isEmpty()) {
                throw new AuraHandledException('Admin contact not found for this task.');
            }

            // Step 3: Create Leave Request
            Leave_Request__c leaveReq = new Leave_Request__c();
            leaveReq.Employee_Email__c = email;
            leaveReq.Description__c = description;
            leaveReq.Leave_Date__c = leaveDate;
            leaveReq.Status__c = 'Pending';
            leaveReq.Submitted_Date__c = Date.today();
            leaveReq.Forwarded_To__c = adminEmail;

            insert leaveReq;

        } catch (Exception e) {
            throw new AuraHandledException('Error while submitting leave request: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Leave_Request__c> getMyLeaveRequests(String email) {
        return [
            SELECT Id, Leave_Date__c, Description__c, Status__c 
            FROM Leave_Request__c 
            WHERE Employee_Email__c = :email 
            ORDER BY Submitted_Date__c DESC
        ];
    }
}