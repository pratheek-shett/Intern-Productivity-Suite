public without sharing class Mailget {
    
    @AuraEnabled(cacheable = true)
    public static List<sObject> getemaildatafunction(String usernameemail) {
        List<String> emaillist = new List<String>();
        
        if(!Pattern.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', usernameemail)){
           throw new AuraHandledException('Invalid email format');
        
        }
        
        //for(Contact c: [select email from Contact where email != null]){
        
         //emaillist.add(c.email);
        //}
        //List<Contact> anmail = [select Email from Contact];
       // for(Contact c: anmail){
            //emaillist.add(c.Email);
        //}
        return [select Email from contact where Email = :usernameemail ];

    }
}