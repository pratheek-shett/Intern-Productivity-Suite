import { LightningElement, track } from 'lwc';

import getInternTasks from '@salesforce/apex/Gettaskforintern.getInternTasks';

import fetchPlaylistVideos from '@salesforce/apex/YoutubeAPICntroller.fetchPlaylistVideos';

export default class InternPlaylistViewer extends LightningElement {

 @track isLoading = true; 

    @track videos = [];

    @track error;

    @track selectedVideoId = '';

    youtubeLink;



    get playlistId() {

        if (!this.youtubeLink) return null;



        try {

            // Case 1: Full URL with ?list=

            if (this.youtubeLink.includes('youtube.com')) {

                const url = new URL(this.youtubeLink);

                return url.searchParams.get('list');

            }



            // Case 2: Raw playlist ID directly

            return this.youtubeLink;

        } catch (e) {

            console.error('Error parsing YouTube link:', e);

            return null;

        }

    }





    get selectedVideoUrl() {

        return this.selectedVideoId ? `https://www.youtube.com/embed/${this.selectedVideoId}` : '';

    }



    connectedCallback() {
 this.isLoading = false; 
        const internEmail = sessionStorage.getItem('interndata')?.trim();

        if (!internEmail) {

            this.error = 'Intern email not found.';

            return;

        }



        getInternTasks({ internEmail: internEmail })

            .then(tasks => {

                const taskWithYT = tasks.find(task => task.YouTube_Link_c__c);

                if (taskWithYT) {

                    this.youtubeLink = taskWithYT.YouTube_Link_c__c;

                    this.loadPlaylist();

                } else {

                    this.error = 'No YouTube link found for your tasks.';

                }

            })

            .catch(error => {

                console.error('Error loading tasks:', error);

                this.error = error.body ? error.body.message : error.message;

            });

    }



    loadPlaylist() {

        const id = this.playlistId;

        if (id) {

            fetchPlaylistVideos({ playlistId: id })

                .then(result => {

                    this.videos = result;

                    this.selectedVideoId = result.length > 0 ? result[0].videoId : '';

                })

                .catch(error => {

                    console.error('Error fetching playlist:', error);

                    this.error = error.body ? error.body.message : error.message;

                });

        } else {

            this.error = 'Invalid YouTube playlist link.';

        }

    }



    handleVideoClick(event) {

        this.selectedVideoId = event.currentTarget.dataset.videoid;

    }

   handleViewOnYouTube() {
    const id = this.playlistId;
    if (id) {
        const fullUrl = `https://www.youtube.com/playlist?list=${id}`;
        window.open(fullUrl, '_blank');
    } else {
        this.error = 'Unable to open playlist. Invalid playlist ID.';
    }
}


}

