public without sharing class GetInterRegistration {
    @AuraEnabled
    public static Boolean GetInternDetails(Map<String, Object> getinfofromui) {
        try {
            if(getinfofromui == null || getinfofromui.isEmpty()) {
                throw new AuraHandledException('Please fill all required fields');
            }
            
            Intern_Management_c__c interndetails = new Intern_Management_c__c();
            
            interndetails.First_Name__c = (String)getinfofromui.get('firstname');
            interndetails.Last_Name__c = (String)getinfofromui.get('lastname');
            interndetails.Email__c = (String)getinfofromui.get('email');
            interndetails.Phone__c = (String)getinfofromui.get('phone');
            interndetails.Designation__c = (String)getinfofromui.get('designation');
            interndetails.Address__c = (String)getinfofromui.get('address');
            
            String dobString = (String)getinfofromui.get('dob');
            String dojString = (String)getinfofromui.get('doj');
            String iedString = (String)getinfofromui.get('IED');
            
            interndetails.Date_of_Birth__c = Date.valueOf(dobString);
            interndetails.Joining_Date__c = Date.valueOf(dojString);
            interndetails.End_Date__c = Date.valueOf(iedString);
            
            insert interndetails;

            String photodocumentid = (String)getinfofromui.get('photofile');
            String govtIddocument = (String)getinfofromui.get('govtidfile');

            if(photodocumentid != null){
                createContentLink(photodocumentid, interndetails.Id);
                interndetails.Profile_Picture_ID__c = photodocumentid;
            }

            if(govtIddocument != null){
                createContentLink(govtIddocument, interndetails.Id);
                interndetails.ID_Proof_ID__c = govtIddocument;
            }

            update interndetails;
            return true;
            
        } catch(Exception e) {
            throw new AuraHandledException('Error creating intern: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String uploadFile(String base64Data, String fileName, String fileDescription) {
        try {
            // Create ContentVersion
            ContentVersion contentVersion = new ContentVersion(
                VersionData = EncodingUtil.base64Decode(base64Data),
                Title = fileName,
                PathOnClient = fileName,
                Description = fileDescription
            );
            insert contentVersion;
            
            // Get the ContentDocumentId
            contentVersion = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1];
            
            return contentVersion.ContentDocumentId;
        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean IsAtLeast18YearsOld(Date birthDate) {
        Date today = Date.today();
        Date eighteenYearsAgo = today.addYears(-18);
        return birthDate <= eighteenYearsAgo;
    }

    private static void createContentLink(String contentDocumentId, Id recordid) {
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = contentDocumentId;
        cdl.LinkedEntityId = recordid;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
    }
}