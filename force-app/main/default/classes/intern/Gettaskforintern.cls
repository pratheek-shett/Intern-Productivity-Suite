public without sharing class Gettaskforintern {
   @AuraEnabled(cacheable=true)
    public static Task_c__c getInternTask(String internEmail) {
        return [
            SELECT Id, Name, Description__c, Due_Date__c, Status__c,File_Public_URL_c__c
            FROM Task_c__c 
            WHERE Assigned_Intern__r.Email__c = :internEmail 
            AND Status__c != 'Completed'
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static void completeInternTask(Id taskId, String resourceUrl, String base64Data, String fileName) {
        Task_c__c task = [SELECT Id FROM Task_c__c WHERE Id = :taskId LIMIT 1];
        task.Status__c = 'Completed';
        task.Resource_URL__c = resourceUrl;
        update task;

        // Upload file to task
        Blob fileBody = EncodingUtil.base64Decode(base64Data);
        ContentVersion cv = new ContentVersion(
            Title = fileName,
            PathOnClient = '/' + fileName,
            VersionData = fileBody
        );
        insert cv;

        Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;

        insert new ContentDocumentLink(
            ContentDocumentId = contentDocId,
            LinkedEntityId = task.Id,
            ShareType = 'V',
            Visibility = 'AllUsers'
        );
    }

    @AuraEnabled(cacheable=true)
public static List<Task_c__c> getInternTasks(String internEmail) {
    return [
        SELECT Id, Name, Description__c, Due_Date__c, Status__c, File_Public_URL_c__c
        FROM Task_c__c 
        WHERE Assigned_Intern__r.Email__c = :internEmail
        ORDER BY Due_Date__c ASC
    ];
}

}


