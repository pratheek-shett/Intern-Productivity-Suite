public without sharing class DashboardController {
      @AuraEnabled(cacheable=true)
    public static Integer getTotalInternCount() {
        return [SELECT COUNT() FROM Intern_Management_c__c];
    }

    @AuraEnabled(cacheable=true)
public static Intern_Management_c__c getMostActiveIntern() {
    List<AggregateResult> result = [
        SELECT Assigned_Intern__c, COUNT(Id) 
        FROM Task_c__c 
        WHERE Status__c = 'Completed' 
        GROUP BY Assigned_Intern__c 
        ORDER BY COUNT(Id) DESC 
        LIMIT 1
    ];

    if (!result.isEmpty()) {
        Id internId = (Id)result[0].get('Assigned_Intern__c');
        return [
            SELECT Id, First_Name__c, Last_Name__c, Email__c 
            FROM Intern_Management_c__c 
            WHERE Id = :internId 
            LIMIT 1
        ];
    }

    return null;
}

@AuraEnabled(cacheable=true)
    public static Integer getActiveInternCount() {
        Set<Id> activeInterns = new Set<Id>();
        for (AggregateResult ar : [
            SELECT Assigned_Intern__c 
            FROM Task_c__c 
            WHERE Status__c = 'Completed' AND LastModifiedDate = LAST_N_DAYS:15 
            GROUP BY Assigned_Intern__c
        ]) {
            activeInterns.add((Id)ar.get('Assigned_Intern__c'));
        }
        return activeInterns.size();
    }


    @AuraEnabled(cacheable=true)
    public static Integer getPendingLeaveCount() {
        return [SELECT COUNT() FROM Leave_Request__c WHERE Status__c = 'Pending'];
    }

  @AuraEnabled(cacheable=true)
public static Intern_Management_c__c getMostInactiveIntern() {
    List<Intern_Management_c__c> allInterns = [
        SELECT Id, First_Name__c, Last_Name__c, Email__c 
        FROM Intern_Management_c__c
    ];

    Map<Id, Integer> taskCountMap = new Map<Id, Integer>();
    for (AggregateResult ar : [
        SELECT Assigned_Intern__c internId, COUNT(Id) taskCount 
        FROM Task_c__c 
        WHERE Status__c = 'Completed' 
        GROUP BY Assigned_Intern__c
    ]) {
        taskCountMap.put((Id)ar.get('internId'), (Integer)ar.get('taskCount'));
    }

    Intern_Management_c__c leastActive;
    Integer minCount = 9999999; // fixed here

    for (Intern_Management_c__c intern : allInterns) {
        Integer count = taskCountMap.containsKey(intern.Id) ? taskCountMap.get(intern.Id) : 0;

        if (count < minCount) {
            minCount = count;
            leastActive = intern;
        }
    }

    return leastActive;
}


}