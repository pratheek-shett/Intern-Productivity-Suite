public with sharing class Sessioncontroler {
    @AuraEnabled()
    public static void  Sessioncreation (String getemail) {
        try {
            SessionManager.createSession(getemail);
        } catch(Exception e) {
            throw new AuraHandledException('Session creation failed: ' + e.getMessage());
        }
    }

    @AuraEnabled()
    public static Boolean  Sessionrefresh (String getemail) {
        try {
            return SessionManager.refreshSession(getemail);
        } catch(Exception e) {
            throw new AuraHandledException('Session refresh failed: ' + e.getMessage());
        }
    }

    @AuraEnabled()
    public static Boolean  Sessionrevalidate(String getemail) {
        try {
            return SessionManager.validateSession(getemail);
        } catch(Exception e) {
            throw new AuraHandledException('Session validation failed: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static string returnemailforauth(){
        try {
            return SessionManager.returnemail();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}