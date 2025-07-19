import { LightningElement,track,api } from 'lwc';
import novigo_logo from '@salesforce/resourceUrl/novigo_logo';
import { NavigationMixin } from 'lightning/navigation';

export default class Navigationbar extends NavigationMixin(LightningElement)  {
   @track showInternDropdown = false;
   @track showMobileMenu = false;
    novigo_logo = novigo_logo;
       currentPage = "submitreward"
       isMobileMenuOpen = false;
   
         homepage() {
           window.location.replace("https://empathetic-raccoon-eds7tb-dev-ed.trailblaze.my.site.com/app/");
       }
         connectedCallback() {
           // Set active page based on current URL when component loads
           this.setactivepageurl();
       }
       setactivepageurl(){
         const path = window.location.pathname.toLowerCase();
         if (path.includes('submitreward')) this.currentPage = 'submitreward';
           else if (path.includes('activereward')) this.currentPage = 'activereward';
           else if (path.includes('rewardhistory')) this.currentPage = 'rewardhistory';
           else this.currentPage = 'submitreward';
           this.updateActiveState();
       }
   
        updateActiveState() {
           // Remove active class from all nav items
           this.template.querySelectorAll('.nav-item').forEach(item => {
               item.classList.remove('active');
           });
           
           // Add active class to current page's nav item
           const activeItem = this.template.querySelector(`.${this.currentPage}`);
           if (activeItem) {
               activeItem.classList.add('active');
           }
       }
   
      navigateTo(path) {
           this[NavigationMixin.Navigate]({
               type: 'standard__webPage',
               attributes: {
                   url: path
               }
           });
       }
   
         handleHomeClick() {
           this.navigateTo('/');
       }
   
       navigateToDashboard() {
           this.navigateTo('/interntask');  // CHANGED: Using new method
       }
   
       navigateToTasks() {
           this.navigateTo('/interntask');  // CHANGED: Using new method
       }
       navigateToLearningResources(){
        this.navigateTo('/internplaylist');
       }
   
       navigateToLeaves() {
           this.navigateTo('/interntask');  // CHANGED: Using new method
       }
   
       navigateToRegisterIntern() {
           this.navigateTo('/registerintern');  // CHANGED: Using new method
           this.showMobileMenu = false;
       }
   
       navigateToViewInterns() {
           this.navigateTo('/interntask');  // CHANGED: Using new method
           this.showMobileMenu = false;
       }
   
        showDropdown() {
           this.showInternDropdown = true;
       }
   
       hideDropdown() {
           this.showInternDropdown = false;
       }
   
       toggleMobileMenu() {
           this.showMobileMenu = !this.showMobileMenu;
       }






}