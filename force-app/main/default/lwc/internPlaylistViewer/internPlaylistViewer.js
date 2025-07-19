import { LightningElement, api, wire } from 'lwc';
import fetchPlaylistVideos from '@salesforce/apex/YoutubeAPICntroller.fetchPlaylistVideos';

export default class InternPlaylistViewer extends LightningElement {
    @api playlistId;
    videos = [];
    error;

    connectedCallback() {
        if (this.playlistId) {
            fetchPlaylistVideos({ playlistId: this.playlistId })
                .then(result => {
                    this.videos = result;
                })
                .catch(error => {
                    this.error = error;
                    console.error(error);
                });
        }
    }
}
