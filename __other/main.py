import requests
import json

urls = {
    "home" : "/api/v2/hianime/home",
    "search" : "/api/v2/hianime/search",
    "search_suggestion" : "/api/v2/hianime/search/suggestion?q={query}",
    "anime_info" : "/api/v2/hianime/anime/{animeId}",
    "anime_qtip" : "/api/v2/hianime/qtip/{animeId}",
    "schedule" : "/api/v2/hianime/schedule?date={date}",
    "episodes" : "/api/v2/hianime/anime/{animeId}/episodes",
    "episode_servers" : "/api/v2/hianime/episode/servers?animeEpisodeId={episodeId}",
    "episode_streaming_links" : "/api/v2/hianime/episode/sources?animeEpisodeId={episodeId}?server={server}&category={category}",
    
}

class HiAnimePy():

    def __init__(self, base_url="http://localhost:4000"):
        """
        Initialize the HiAnimeApi class with the base URL.

        Parameters:
            base_url (str): The base URL of the API. Defaults to "https://api.aniwatch.me".
        """
        self.BASE_URL = base_url
        
    def home(self):
        """
        Fetch the home page data.

        Returns:
            Response: The response object containing the home page data.
        """
        url = self.BASE_URL +  urls["home"]
        return requests.get(url)
    
    def search(self, **kwargs):
        """
        Search for anime.

        Parameters:
            q (str): The search query, i.e. the title of the item you are looking for. (Required)
            page (int): The page number of the result. (Optional, default: 1)
            type (str): Type of the anime. eg: movie (Optional)
            status (str): Status of the anime. eg: finished-airing (Optional)
            rated (str): Rating of the anime. eg: r+ or pg-13 (Optional)
            score (str): Score of the anime. eg: good or very-good (Optional)
            season (str): Season of the aired anime. eg: spring (Optional)
            language (str): Language category of the anime. eg: sub or sub-&-dub (Optional)
            start_date (str): Start date of the anime (yyyy-mm-dd). eg: 2014-10-2 (Optional)
            end_date (str): End date of the anime (yyyy-mm-dd). eg: 2010-12-4 (Optional)
            sort (str): Order of sorting the anime result. eg: recently-added (Optional)
            genres (str): Genre of the anime, separated by commas. eg: isekai,shounen (Optional)
        """
        url = self.BASE_URL +  urls["search"]
        params = {key: value for key, value in kwargs.items() if value is not None}
        return requests.get(url, params=params)

    def search_suggestion(self, query: str):
        """
        Fetch search suggestions based on a query.

        Parameters:
            query (str): The search query for which suggestions are needed.

        Returns:
            Response: The response object containing search suggestions.
        """
        url = self.BASE_URL +  urls["search_suggestion"].format(query=query)
        return requests.get(url)
    
    def anime_info(self, animeId):
        """
        Fetch detailed information about a specific anime.

        Parameters:
            animeId (str): The ID of the anime.

        Returns:
            Response: The response object containing the anime details.
        """
        url = self.BASE_URL +  urls["anime_info"].format(animeId=animeId)
        return requests.get(url)
    
    def anime_qtip(self, animeId):
        """
        Fetch quick information (qtip) about a specific anime.

        Parameters:
            animeId (str): The ID of the anime.

        Returns:
            Response: The response object containing quick information about the anime.
        """
        url = self.BASE_URL +  urls["anime_qtip"].format(animeId=animeId)
        return requests.get(url)
    
    def schedule(self, date):
        """
        Fetch the anime schedule for a specific date.

        Parameters:
            date (str): The date for which the schedule is requested (format: yyyy-mm-dd).

        Returns:
            Response: The response object containing the anime schedule.
        """
        url = self.BASE_URL +  urls["schedule"].format(date=date)
        return requests.get(url)
    
    def episodes(self, animeId):
        """
        Fetch the list of episodes for a specific anime.

        Parameters:
            animeId (str): The ID of the anime.

        Returns:
            Response: The response object containing the list of episodes.
        """
        func_url = urls["episodes"].format(animeId=animeId)
        print(func_url)
        url = self.BASE_URL + func_url
        return requests.get(url)
    
    def episode_servers(self, episodeId):
        """
        Fetch the available servers for a specific episode.

        Parameters:
            episodeId (str): The ID of the episode.

        Returns:
            Response: The response object containing the list of servers.
        """
        url = self.BASE_URL +  urls["episode_servers"].format(episodeId=episodeId)
        return requests.get(url)

    def episode_streaming_links(self, episodeId, server, category):
        """
        Fetch the streaming links for a specific episode.

        Parameters:
            episodeId (str): The ID of the episode.
            server (str): The server to fetch the links from.
            category (str): The category of the streaming links.

        Returns:
            Response: The response object containing the streaming links.
        """
        url = self.BASE_URL +  urls["episode_streaming_links"].format(
                                                                episodeId=episodeId,
                                                                server=server,
                                                                category=category,
                                                            )
        return requests.get(url)

class Player():
    
    def __init__(self, m3u8_url: str, vtt_url: str):
        
        self.player = ""
        self.m3u8_url = m3u8_url
        self.vtt_url = vtt_url

    def play(self):
        pass
        
        
        
if not __name__ == "__main__":
    
    api = HiAnimePy()
    r = api.episode_streaming_links(episodeId="blue-lock-17889?ep=94538", server="hd-1", category="sub")
    json.dump(r.json(), open("response.json", "w"), indent=4)
    print(f"{r.url} ({r.status_code}) {None != r.json()}")
    
    """ player = Player(
        m3u8_url=".\\video\\master.m3u8",
        vtt_url=".\\video\\eng-2.vtt"
    )
    player.play() """
    
r = json.load(open('response.json', 'r'))
for i in r['mostPopularAnimes']:
    print(i['name'],  end=', ')