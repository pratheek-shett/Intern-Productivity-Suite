public without sharing class Internprofiledetails {
    @AuraEnabled(cacheable=true)
    public static Intern_Management_c__c getInternProfile(String email) {
        return [
            SELECT 
                First_Name__c, 
                Last_Name__c,
                Date_of_Birth__c,
                Phone__c,
                Email__c,
                Address__c,
                Designation__c,
                Joining_Date__c,
                End_Date__c,
                Profile_Picture_ID__c
            FROM Intern_Management_c__c
            WHERE Email__c = :email
            LIMIT 1
        ];
    }
    @AuraEnabled(cacheable=true)
    public static String getProfileImageUrl(String contentDocumentId) {
        if (String.isBlank(contentDocumentId)) return null;
        
        try {
            // First check if a public link already exists
            List<ContentDistribution> existingLinks = [
                SELECT Id, DistributionPublicUrl, ContentDownloadUrl 
                FROM ContentDistribution 
                WHERE ContentDocumentId = :contentDocumentId 
                LIMIT 1
            ];
            
            if (!existingLinks.isEmpty()) {
                // Return existing public URL
                return existingLinks[0].ContentDownloadUrl;
            }
            
            // If no existing link, return a fallback URL for the internal preview
            List<ContentVersion> versions = [
                SELECT Id
                FROM ContentVersion
                WHERE ContentDocumentId = :contentDocumentId
                AND IsLatest = true
                LIMIT 1
            ];
            
            if (!versions.isEmpty()) {
                System.debug('version id: ' + versions[0].Id);
                return '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + versions[0].Id;
            }
            
            return null;
        } catch (Exception e) {
            System.debug('Error getting profile image URL: ' + e.getMessage());
            return null;
        }
    }
    
    @AuraEnabled
    public static String createProfileImagePublicUrl(String contentDocumentId) {
        if (String.isBlank(contentDocumentId)) return null;
        
        try {
            // Get the latest version of the document
            List<ContentVersion> versions = [
                SELECT Id, Title, ContentDocumentId 
                FROM ContentVersion 
                WHERE ContentDocumentId = :contentDocumentId 
                AND IsLatest = true
                LIMIT 1
            ];
            
            if (versions.isEmpty()) {
                return null;
            }
            
            // Create a ContentDistribution record (public link)
            ContentDistribution cd = new ContentDistribution();
            cd.Name = versions[0].Title;
            cd.ContentVersionId = versions[0].Id;
            cd.PreferencesAllowViewInBrowser = true;
            cd.PreferencesLinkLatestVersion = true;
            cd.PreferencesNotifyOnVisit = false;
            cd.PreferencesPasswordRequired = false;
            cd.PreferencesAllowOriginalDownload = true;
            
            insert cd;
            
            // Query the new ContentDistribution to get the URL
            ContentDistribution newCD = [
                SELECT Id, DistributionPublicUrl, ContentDownloadUrl 
                FROM ContentDistribution 
                WHERE Id = :cd.Id
                LIMIT 1
            ];
            
            return newCD.ContentDownloadUrl;
        } catch (Exception e) {
            System.debug('Error creating public URL: ' + e.getMessage());
            return null;
        }
    }
}

