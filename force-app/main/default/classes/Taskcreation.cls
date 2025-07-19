public without sharing class Taskcreation {
    @AuraEnabled
    public static Id Taskcreation(String title, String description, Date dueDate, String status, String internId, String resourceUrl, String assignedby, List<String>fileid) {
        Task_c__c task = new Task_c__c();
        task.Name = title;
        task.Description__c = description;
        task.Due_Date__c = dueDate;
        task.Status__c = status;
        task.Assigned_Intern__c = internId;
        task.Resource_URL__c = resourceUrl;
        task.Task_Created_By__c = assignedby;
        insert task;
        System.debug(task.Id);
        return task.Id;
    }

    @AuraEnabled(cacheable = true)
    public static List<Task_c__c> getStatus(){
        return [SELECT Id, Name, Status__c, Assigned_Intern__r.First_Name__c, 
               Assigned_Intern__r.Email__c, Due_Date__c, Resource_URL__c, 
               Description__c, File_Public_URL_c__c,Admincomment__c  // ADD THIS FIELD
        FROM Task_c__c 
        ORDER BY Due_Date__c ASC];
    }

    @AuraEnabled
public static String generateTaskFilePublicUrl(Id taskId) {
    try {
        Task_c__c task = [
            SELECT Id, File_Public_URL_c__c,
                   (SELECT ContentDocumentId FROM ContentDocumentLinks LIMIT 1)
            FROM Task_c__c
            WHERE Id = :taskId
            LIMIT 1
        ];

        if (String.isNotBlank(task.File_Public_URL_c__c)) {
            return task.File_Public_URL_c__c;
        }

        if (task.ContentDocumentLinks.isEmpty()) {
            return null;
        }

        String contentDocumentId = task.ContentDocumentLinks[0].ContentDocumentId;

        ContentVersion cv = [
            SELECT Id, Title 
            FROM ContentVersion 
            WHERE ContentDocumentId = :contentDocumentId 
            AND IsLatest = true 
            LIMIT 1
        ];

        ContentDistribution cd = new ContentDistribution();
        cd.Name = cv.Title;
        cd.ContentVersionId = cv.Id;
        cd.PreferencesAllowViewInBrowser = true;
        cd.PreferencesLinkLatestVersion = true;
        cd.PreferencesNotifyOnVisit = false;
        cd.PreferencesPasswordRequired = false;
        cd.PreferencesAllowOriginalDownload = true;
        insert cd;

        ContentDistribution newCD = [
            SELECT ContentDownloadUrl 
            FROM ContentDistribution 
            WHERE Id = :cd.Id 
            LIMIT 1
        ];

        // Update URL field on Task__c
        task.File_Public_URL_c__c = newCD.ContentDownloadUrl;
        update task;

        return newCD.ContentDownloadUrl;

    } catch (Exception e) {
        System.debug('Error generating public file URL: ' + e.getMessage());
        return null;
    }
}


//     @AuraEnabled
//     public static void uploadFileToTask(String fileName, String base64Data, Id taskId) {
//         Blob fileBody = EncodingUtil.base64Decode(base64Data);
//         System.debug(taskid);

//         ContentVersion cv = new ContentVersion();
//         cv.Title = fileName;
//         cv.PathOnClient = '/' + fileName;
//         cv.VersionData = fileBody;
//         insert cv;
     
//         // Link the file to the task
//         Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
//         ContentDocumentLink cdl = new ContentDocumentLink();
// cdl.ContentDocumentId = contentDocId;
// cdl.LinkedEntityId = taskId;
// cdl.ShareType = 'V';
// cdl.Visibility = 'AllUsers'; // 💡 this matters
// insert cdl;

//     }

@AuraEnabled
public static void uploadFileToTask(String fileName, String base64Data, Id taskId) {
    Blob fileBody = EncodingUtil.base64Decode(base64Data);

    ContentVersion cv = new ContentVersion();
    cv.Title = fileName;
    cv.PathOnClient = '/' + fileName;
    cv.VersionData = fileBody;
    insert cv;

    Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;

    ContentDocumentLink cdl = new ContentDocumentLink();
    cdl.ContentDocumentId = contentDocId;
    cdl.LinkedEntityId = taskId;
    cdl.ShareType = 'V';
    cdl.Visibility = 'AllUsers';
    insert cdl;

    // Create ContentDistribution immediately
    ContentDistribution cd = new ContentDistribution();
    cd.Name = fileName;
    cd.ContentVersionId = cv.Id;
    cd.PreferencesAllowViewInBrowser = true;
    cd.PreferencesLinkLatestVersion = true;
    cd.PreferencesPasswordRequired = false;
    cd.PreferencesNotifyOnVisit = false;
    cd.PreferencesAllowOriginalDownload = true;
    insert cd;
    
    // Get the public URL and update the task
    String publicUrl = [SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :cd.Id].DistributionPublicUrl;
    
    Task_c__c task = [SELECT Id FROM Task_c__c WHERE Id = :taskId LIMIT 1];
    task.File_Public_URL_c__c = publicUrl;
    update task;
}


    @AuraEnabled
   public static void updateTask(Task_c__c task) {
    try {
        update task;
    } catch (Exception e) {
        throw new AuraHandledException('Error updating task: ' + e.getMessage());
    }
}
@AuraEnabled
public static List<Map<String, Object>> getFilesForTask(Id taskId) {
    List<ContentDocumentLink> links = [
        SELECT ContentDocument.Title, 
       ContentDocumentId,
       ContentDocument.LatestPublishedVersionId,
       ContentDocument.FileExtension
       FROM ContentDocumentLink 
       WHERE LinkedEntityId = :taskId

    ];
    
    List<Map<String, Object>> result = new List<Map<String, Object>>();
    for(ContentDocumentLink link : links) {
        result.add(new Map<String, Object>{
            'Id' => link.Id,
            'ContentDocumentId' => link.ContentDocumentId,
            'Title' => link.ContentDocument.Title,
            'LatestPublishedVersionId' => link.ContentDocument.LatestPublishedVersionId,
            'FileExtension' => link.ContentDocument.FileExtension
        });
    }
    return result;
}


@AuraEnabled
public static void replaceFileOnTask(String fileName, String base64Data, Id taskId) {
    Blob fileBody = EncodingUtil.base64Decode(base64Data);

    ContentVersion cv = new ContentVersion();
    cv.Title = fileName;
    cv.PathOnClient = '/' + fileName;
    cv.VersionData = fileBody;
    insert cv;

    Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;

    // Just insert new link — don't delete old one (safe)
    ContentDocumentLink cdl = new ContentDocumentLink();
    cdl.ContentDocumentId = contentDocId;
    cdl.LinkedEntityId = taskId;
    cdl.ShareType = 'V';
    cdl.Visibility = 'AllUsers';
    insert cdl;

    // Generate new public URL
    ContentDistribution cd = new ContentDistribution();
    cd.Name = fileName;
    cd.ContentVersionId = cv.Id;
    cd.PreferencesAllowViewInBrowser = true;
    cd.PreferencesLinkLatestVersion = true;
    cd.PreferencesPasswordRequired = false;
    cd.PreferencesAllowOriginalDownload = true;
    insert cd;

    // Update Task with new public link
    Task_c__c task = [SELECT Id FROM Task_c__c WHERE Id = :taskId LIMIT 1];
    task.File_Public_URL_c__c = [
        SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :cd.Id
    ].DistributionPublicUrl;
    update task;
}

@AuraEnabled
public static void updateTaskWithPublicUrl(Id taskId, String publicUrl) {
    Task_c__c task = [SELECT Id FROM Task_c__c WHERE Id = :taskId LIMIT 1];
    task.File_Public_URL_c__c = publicUrl;
    update task;
}

@AuraEnabled
public static String getTaskFilePublicUrl(String contentDocumentId, Id taskId) {
    try {
        // Check if ContentDistribution already exists
        List<ContentDistribution> existingDistributions = [
            SELECT DistributionPublicUrl 
            FROM ContentDistribution 
            WHERE ContentDocumentId = :contentDocumentId 
            LIMIT 1
        ];
        
        String publicUrl;
        
        if (!existingDistributions.isEmpty()) {
            publicUrl = existingDistributions[0].DistributionPublicUrl;
        } else {
            // Create new ContentDistribution
            ContentVersion version = [
                SELECT Id FROM ContentVersion 
                WHERE ContentDocumentId = :contentDocumentId 
                AND IsLatest = true 
                LIMIT 1
            ];

            ContentDistribution cd = new ContentDistribution();
            cd.Name = 'PublicPreview';
            cd.ContentVersionId = version.Id;
            cd.PreferencesAllowViewInBrowser = true;
            cd.PreferencesLinkLatestVersion = true;
            cd.PreferencesPasswordRequired = false;
            cd.PreferencesAllowOriginalDownload = true;
            insert cd;

            publicUrl = [
                SELECT DistributionPublicUrl 
                FROM ContentDistribution 
                WHERE Id = :cd.Id 
                LIMIT 1
            ].DistributionPublicUrl;
        }

        // Update the Task record with the public URL
        Task_c__c task = [SELECT Id, File_Public_URL_c__c FROM Task_c__c WHERE Id = :taskId LIMIT 1];
        if (task.File_Public_URL_c__c != publicUrl) {
            task.File_Public_URL_c__c = publicUrl;
            update task;
        }

        return publicUrl;
    } catch (Exception e) {
        throw new AuraHandledException('Failed to generate public URL: ' + e.getMessage());
    }
}
@AuraEnabled
public static String uploadAndDistributeTaskFile(String base64Data, String fileName, String taskName) {
    try {
        // Step 1: Upload ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        insert cv;

        // Step 2: Get ContentDocumentId
        ContentVersion insertedVersion = [
            SELECT Id, ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :cv.Id 
            LIMIT 1
        ];

        Id contentDocId = insertedVersion.ContentDocumentId;
        Id guestLinkId = UserInfo.getUserId();

        // Step 3: Check if CDL already exists
        List<ContentDocumentLink> existingLinks = [
            SELECT Id 
            FROM ContentDocumentLink 
            WHERE ContentDocumentId = :contentDocId 
            AND LinkedEntityId = :guestLinkId 
            LIMIT 1
        ];

        if (existingLinks.isEmpty()) {
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = contentDocId;
            cdl.LinkedEntityId = guestLinkId; // Use guest or fallback record
            cdl.ShareType = 'V'; // 'I' works for guest
            cdl.Visibility = 'AllUsers';
            insert cdl;
        }

        // Step 4: Create ContentDistribution
        ContentDistribution cd = new ContentDistribution();
        cd.Name = fileName;
        cd.ContentVersionId = insertedVersion.Id;
        cd.PreferencesAllowViewInBrowser = true;
        cd.PreferencesLinkLatestVersion = true;
        cd.PreferencesNotifyOnVisit = false;
        cd.PreferencesPasswordRequired = false;
        cd.PreferencesAllowOriginalDownload = true;
        insert cd;

        // Step 5: Return public URL
        ContentDistribution newCD = [
            SELECT DistributionPublicUrl 
            FROM ContentDistribution 
            WHERE Id = :cd.Id 
            LIMIT 1
        ];

        return newCD.DistributionPublicUrl;

    } catch (Exception e) {
        throw new AuraHandledException('Error uploading and sharing task file: ' + e.getMessage());
    }
}



//comment
@AuraEnabled
public static void submitAdminComment(Id taskId, String comment) {
    Task_c__c taskToUpdate = [SELECT Id, Admincomment__c FROM Task_c__c WHERE Id = :taskId LIMIT 1];
    taskToUpdate.Admincomment__c = comment;
    update taskToUpdate;
}

//delete task


@AuraEnabled
public static void deltask(id ttaskid){
    delete [select Id from Task_c__c where Id =:ttaskid Limit 1];

}
}