public without sharing class internhome {
     @AuraEnabled(cacheable=true)
    public static Map<String, Object> getInternHomeData(String email) {
        
        Map<String, Object> result = new Map<String, Object>();

        Intern_Management_c__c intern = [
            SELECT First_Name__c, Profile_Image_URL__c
            FROM Intern_Management_c__c
            WHERE Email__c = :email
            LIMIT 1
        ];

        result.put('internName', intern.First_Name__c);
        result.put('profileImageUrl', intern.Profile_Image_URL__c);

        // Latest task (by created date)
        List<Task_c__c> tasks = [
            SELECT Name, Description__c, Due_Date__c, Status__c
            FROM Task_c__c
            WHERE Assigned_Intern__r.Email__c = :email
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        if (!tasks.isEmpty()) result.put('latestTask', tasks[0]);

        // Nearest deadline task (by due date)
        List<Task_c__c> upcoming = [
            SELECT Name, Description__c, Due_Date__c, Status__c
            FROM Task_c__c
            WHERE Assigned_Intern__r.Email__c = :email AND Due_Date__c >= TODAY
            ORDER BY Due_Date__c ASC
            LIMIT 1
        ];
        if (!upcoming.isEmpty()) result.put('upcomingTask', upcoming[0]);

        // Most recent leave request
        List<Leave_Request__c> leaves = [
            SELECT Leave_Date__c, Status__c, Description__c
            FROM Leave_Request__c
            WHERE Employee_Email__c = :email
            ORDER BY Submitted_Date__c DESC
            LIMIT 1
        ];
        if (!leaves.isEmpty()) result.put('recentLeave', leaves[0]);

        return result;
    }
}