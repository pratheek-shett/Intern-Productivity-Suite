public without sharing class Gettaskforintern {
    @AuraEnabled(cacheable=true)
    public static List<Task_c__c> getInternTasks(String internEmail) {
        return [
            SELECT Id, Name, Description__c, Due_Date__c, Status__c,
                   File_Public_URL_c__c, Resource_URL__c,
                   Assigned_Intern__r.First_Name__c,
                   Admincomment__c,YouTube_Link_c__c,Task_Created_By__c 
            FROM Task_c__c
            WHERE Assigned_Intern__r.Email__c = :internEmail
            ORDER BY Due_Date__c ASC
        ];
    }

    @AuraEnabled
    public static String completeInternTask(Id taskId, String resourceUrl, String base64FileData, String fileName) {
        try {
            // Update task status and URL
            Task_c__c task = [SELECT Id FROM Task_c__c WHERE Id = :taskId LIMIT 1];
            task.Status__c = 'Completed';
            task.Resource_URL__c = resourceUrl;
            
            // Only process file if provided
            String publicUrl = null;
            if (String.isNotBlank(base64FileData)) {
                // Upload file
                ContentVersion cv = new ContentVersion(
                    Title = fileName,
                    PathOnClient = '/' + fileName,
                    VersionData = EncodingUtil.base64Decode(base64FileData)
                );
                insert cv;
                
                // Link to task
                Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
                insert new ContentDocumentLink(
                    ContentDocumentId = contentDocId,
                    LinkedEntityId = task.Id,
                    ShareType = 'V',
                    Visibility = 'AllUsers'
                );
                
                // Create public URL
                ContentDistribution cd = new ContentDistribution(
                    Name = fileName,
                    ContentVersionId = cv.Id,
                    PreferencesAllowViewInBrowser = true,
                    PreferencesAllowOriginalDownload = true
                );
                insert cd;
                
                publicUrl = [SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :cd.Id].DistributionPublicUrl;
                task.File_Public_URL_c__c = publicUrl;
            }
            
            update task;
            return publicUrl;
            
        } catch(Exception e) {
            throw new AuraHandledException('Error completing task: ' + e.getMessage());
        }
    }
}

