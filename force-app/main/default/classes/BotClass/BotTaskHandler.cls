global class BotTaskHandler {
    
    global class InputWrapper {
        @InvocableVariable(required=true label='Intern Email' description='Email of the intern')
        public String internEmail;
        
        @InvocableVariable(required=false label='Query Type' description='Type of task query')
        public String queryType;
    }
    
    global class OutputWrapper {
        @InvocableVariable(label='Task Summary' description='Summary of intern tasks')
        public String taskSummary;
        
        @InvocableVariable(label='Task Count' description='Number of tasks')
        public Integer taskCount;
        
        @InvocableVariable(label='Pending Tasks' description='Number of pending tasks')
        public Integer pendingTasks;
        
        @InvocableVariable(label='Next Deadline' description='Next upcoming deadline')
        public String nextDeadline;
    }
    
    @InvocableMethod(label='Get Intern Task Information' 
                     description='Returns comprehensive task information for intern'
                     category='Einstein Bot Task Management')
    global static List<OutputWrapper> getInternTaskInfo(List<InputWrapper> inputList) {
        
        String internEmail = inputList[0].internEmail;
        String queryType = inputList[0].queryType != null ? inputList[0].queryType : 'summary';
        
        List<OutputWrapper> results = new List<OutputWrapper>();
        OutputWrapper result = new OutputWrapper();
        
        try {
            // Query tasks for the intern
            List<Task_c__c> allTasks = [
                SELECT Id, Name, Status__c, Due_Date__c, Description__c, 
                       Assigned_Intern__r.Email__c, Assigned_Intern__r.First_Name__c
                FROM Task_c__c 
                WHERE Assigned_Intern__r.Email__c = :internEmail
                ORDER BY Due_Date__c ASC NULLS LAST
            ];
            
            if (allTasks.isEmpty()) {
                result.taskSummary = 'You currently have no tasks assigned. Great job staying on top of everything!';
                result.taskCount = 0;
                result.pendingTasks = 0;
                result.nextDeadline = 'No upcoming deadlines';
            } else {
                // Count different task statuses
                Integer totalTasks = allTasks.size();
                Integer pendingCount = 0;
                Integer completedCount = 0;
                Date nextDueDate = null;
                String nextTaskName = '';
                
                for (Task_c__c task : allTasks) {
                    if (task.Status__c == 'Pending' || task.Status__c == 'In Progress') {
                        pendingCount++;
                        if (nextDueDate == null && task.Due_Date__c != null) {
                            nextDueDate = task.Due_Date__c;
                            nextTaskName = task.Name;
                        }
                    } else if (task.Status__c == 'Completed') {
                        completedCount++;
                    }
                }
                
                // Generate response based on query type
                if (queryType.toLowerCase().contains('pending') || queryType.toLowerCase().contains('incomplete')) {
                    result.taskSummary = String.format('You have {0} pending tasks out of {1} total tasks. Keep up the great work!', 
                        new List<Object>{pendingCount, totalTasks});
                        
                } else if (queryType.toLowerCase().contains('deadline') || queryType.toLowerCase().contains('due')) {
                    if (nextDueDate != null) {
                        Integer daysUntilDue = Date.today().daysBetween(nextDueDate);
                        if (daysUntilDue < 0) {
                            result.taskSummary = String.format('WARNING: Task "{0}" was due {1} days ago. Please prioritize!', 
                                new List<Object>{nextTaskName, Math.abs(daysUntilDue)});
                        } else if (daysUntilDue == 0) {
                            result.taskSummary = String.format('URGENT: Task "{0}" is due TODAY! Please complete it as soon as possible.', 
                                new List<Object>{nextTaskName});
                        } else {
                            result.taskSummary = String.format('Your next deadline is "{0}" in {1} days.', 
                                new List<Object>{nextTaskName, daysUntilDue});
                        }
                    } else {
                        result.taskSummary = 'You have no upcoming deadlines. Excellent work!';
                    }
                    
                } else {
                    // Default summary response - using separate variables for clarity
                    String summaryTemplate = 'Task Summary:\\n• Total Tasks: {0}\\n• Pending: {1}\\n• Completed: {2}';
                    result.taskSummary = String.format(summaryTemplate, 
                        new List<Object>{totalTasks, pendingCount, completedCount});
                    
                    if (nextDueDate != null) {
                        String deadlineInfo = '\\n• Next Deadline: {0} ({1})';
                        result.taskSummary += String.format(deadlineInfo, 
                            new List<Object>{nextTaskName, nextDueDate.format()});
                    }
                }
                
                result.taskCount = totalTasks;
                result.pendingTasks = pendingCount;
                
                if (nextDueDate != null) {
                    result.nextDeadline = nextDueDate.format() + ' (' + nextTaskName + ')';
                } else {
                    result.nextDeadline = 'No upcoming deadlines';
                }
            }
            
        } catch (Exception e) {
            result.taskSummary = 'Sorry, I encountered an error retrieving your tasks. Please try again or contact your administrator.';
            result.taskCount = 0;
            result.pendingTasks = 0;
            result.nextDeadline = 'Error retrieving data';
            System.debug('BotTaskHandler Error: ' + e.getMessage());
        }
        
        results.add(result);
        return results;
    }
}