public without sharing class YoutubeAPICntroller {
   public class VideoItem {
        @AuraEnabled public String title;
        @AuraEnabled public String videoId;
        @AuraEnabled public String thumbnailUrl;
    }

    @AuraEnabled(cacheable=true)
    public static List<VideoItem> fetchPlaylistVideos(String playlistId) {
        String apiKey = YouTubeAPIKey__mdt.getInstance('YouTubeAPIKey').API_Key__c;
        String endpoint = '/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=' + playlistId + '&key=' + apiKey;

        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:YouTubeAPI' + endpoint);
        req.setMethod('GET');

        Http http = new Http();
        HttpResponse res = http.send(req);

        List<VideoItem> videoList = new List<VideoItem>();

        if (res.getStatusCode() == 200) {
            Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            List<Object> items = (List<Object>) jsonResponse.get('items');

            for (Object itemObj : items) {
                Map<String, Object> item = (Map<String, Object>) itemObj;
                Map<String, Object> snippet = (Map<String, Object>) item.get('snippet');
                Map<String, Object> resourceIdMap = (Map<String, Object>) snippet.get('resourceId');
if (resourceIdMap == null || !resourceIdMap.containsKey('videoId')) continue;
               Map<String, Object> thumbnails = (Map<String, Object>) snippet.get('thumbnails');
if (thumbnails == null || !thumbnails.containsKey('default')) continue;

Map<String, Object> defaultThumb = (Map<String, Object>) thumbnails.get('default');
if (defaultThumb == null || !defaultThumb.containsKey('url')) continue;

                VideoItem vi = new VideoItem();
                vi.title = (String) snippet.get('title');
                vi.videoId = (String) ((Map<String, Object>) snippet.get('resourceId')).get('videoId');
                vi.thumbnailUrl = (String) defaultThumb.get('url');
                videoList.add(vi);
            }
        } else {
            throw new AuraHandledException('Failed to fetch playlist. Status: ' + res.getStatus());
        }

        return videoList;
    }

}