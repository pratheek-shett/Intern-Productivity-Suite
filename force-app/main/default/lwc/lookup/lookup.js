import { LightningElement,track,wire } from 'lwc';
import Assigninternlist from '@salesforce/apex/Assigninternlist.Assigninternlist'
import Taskcreation from '@salesforce/apex/Taskcreation.Taskcreation'
export default class Lookup extends LightningElement {

    @track searchKey = '';
    @track records = [];
    @track showfield = false;

    handleChange(event) {
        this.searchKey = event.target.value.trim();
        if(this.searchKey.length >0){
        this.search();           // Only call Apex when something is typed
        this.showfield = true;  
        }
        else{
             this.records = [];       // Clear records
            this.showfield = false;
        }
    }

    handleFocus() {
        if (this.searchKey) {
            this.search();
        }
    }

    search() {
        Assigninternlist({ getemailorname: this.searchKey })
            .then(result => {
                this.records = result.map(intern => ({
                    Id: intern.Id,
                    FullName: `${intern.First_Name__c} ${intern.Last_Name__c}`,
                    Email__c: intern.Email__c
                }));
                this.showfield = this.records.length > 0;
            })
            .catch(error => {
                console.error('Lookup search error', error);
                this.records = [];
                this.showfield = false;
            });
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;

        this.searchKey = selectedName;
        this.records = [];

        this.dispatchEvent(new CustomEvent('recordselected', {
            detail: {
                recordId: selectedId,
                label: selectedName
            }
            
        }));
        this.showfield = false;
    }
}