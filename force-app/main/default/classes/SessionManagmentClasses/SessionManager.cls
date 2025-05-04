public without sharing class SessionManager {

    //During Login 
   
    public  static void createSession(String getemail) {

        //delete if any session is already existed
        delete [select Id from User_Session__c where useremail__c = :getemail AND Is_Active__c =:true];

        User_Session__c usersession = new User_Session__c(
            useremail__c = getemail,
            Start_Time__c = DateTime.now(),
            Last_Refresh__c = DateTime.now(),
            End_Time__c = DateTime.now().addminutes(5),
            Is_Active__c = true
        );
        insert usersession;
    }


    //User reloads 
    
    public static Boolean refreshSession(String getemail){

        //get id,endtime

        try{

            User_Session__c sessionend =[ select id, End_Time__c from User_Session__c where useremail__c =: getemail AND Is_Active__c = true Limit 1 ];

            //check if its expired

            if(Datetime.now() > sessionend.End_Time__c){
                sessionend.Is_Active__c = false;
                update sessionend;
                return false;
            }
             //to check page response or activeness
            sessionend.Last_Refresh__c = Datetime.now();
            sessionend.End_Time__c = DateTime.now().addMinutes(5);
            update sessionend;
            return true;

        }catch(Exception e){
            System.debug('Refresh error: ' + e.getMessage());
            return false;
        }



    }

    //Validate the Session
   
    public static Boolean validateSession(String getemail){

        try{
            User_Session__c validatesession = [select End_Time__c from User_Session__c where useremail__c = :getemail AND Is_Active__c = true limit 1];
            return DateTime.now() <= validatesession.End_Time__c;
        } catch (Exception e){
            System.debug('Validation error: ' + e.getMessage());
            return false;
        }

    }

    public static String returnemail(){
        List<User_Session__c> sessions = [SELECT useremail__c FROM User_Session__c WHERE Is_Active__c = true LIMIT 1];
        if (!sessions.isEmpty()) {
            return sessions[0].useremail__c;
        } else {
            return null;
        }
        
    }

    
}

//trial
//test webhoook for testing purpose deployment