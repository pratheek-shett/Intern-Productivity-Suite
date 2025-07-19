public with sharing class YoutubeAPICntroller {
    public class VideoItem {
        @AuraEnabled public String title;
        @AuraEnabled public String videoId;
        @AuraEnabled public String thumbnailUrl;
    }

    @AuraEnabled(cacheable=true)
    public static List<VideoItem> fetchPlaylistVideos(String playlistId) {
        // Step 1: Get API Key from Custom Metadata
        String apiKey = '';
        try {
            apiKey = YouTubeAPIKey__mdt.getInstance('YouTubeAPIKey').API_Key__c;
        } catch (Exception e) {
            throw new AuraHandledException('API Key missing or invalid in metadata.');
        }

        // Step 2: Build endpoint URL using Named Credential
        String endpoint = '/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=' + EncodingUtil.urlEncode(playlistId, 'UTF-8') + '&key=' + apiKey;

        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:YouTubeAPI' + endpoint);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');

        Http http = new Http();
        HttpResponse res;
        List<VideoItem> videoList = new List<VideoItem>();

        try {
            res = http.send(req);
        } catch (Exception e) {
            throw new AuraHandledException('Callout failed: ' + e.getMessage());
        }

        if (res.getStatusCode() == 200) {
            try {
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                List<Object> items = (List<Object>) jsonResponse.get('items');

                for (Object itemObj : items) {
                    Map<String, Object> item = (Map<String, Object>) itemObj;
                    Map<String, Object> snippet = (Map<String, Object>) item.get('snippet');
                    Map<String, Object> thumbnails = (Map<String, Object>) snippet.get('thumbnails');
                    Map<String, Object> defaultThumb = (Map<String, Object>) thumbnails.get('default');

                    VideoItem vi = new VideoItem();
                    vi.title = (String) snippet.get('title');
                    vi.videoId = (String) ((Map<String, Object>) snippet.get('resourceId')).get('videoId');
                    vi.thumbnailUrl = (String) defaultThumb.get('url');

                    videoList.add(vi);
                }
            } catch (Exception e) {
                throw new AuraHandledException('Error parsing YouTube response: ' + e.getMessage());
            }
        } else {
            throw new AuraHandledException('Failed to fetch playlist. Status: ' + res.getStatus() + ' - ' + res.getBody());
        }

        return videoList;
    }
}