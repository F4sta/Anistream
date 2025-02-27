
function getParameters() {
    const urlString = document.URL
    const Params = new URL(urlString).searchParams
    return Params
}

async function fetchServerData() {

    const params = await getParameters()
    const animeId = params.get('animeId')
    const episodeId = params.get('ep')

    const url = `${api_url}/api/v2/hianime/episode/servers?animeEpisodeId=${animeId}?ep=${episodeId};`
    console.log(url)

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(data)
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

async function fetchStreamData() {

    var category = "sub"
    var server = "hd-1"

    const params = await getParameters()
    const animeId = params.get('animeId')
    const episodeId = params.get('ep')

    const url = new URL(`${api_url}/api/v2/hianime/episode/sources?animeEpisodeId=${animeId}?ep=${episodeId}?server=${server}&category=${category}`)
    console.log(url);

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(data)
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

async function fetchAnimeInfoData() {

    const params = await getParameters()
    const animeId = params.get('animeId')

    const url = new URL(`${api_url}/api/v2/hianime/anime/${animeId}`)
    console.log(url)

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(data)
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

async function fetchEpisodeData() {

    const params = await getParameters()
    const animeId = params.get('animeId')

    const url = new URL(`${api_url}/api/v2/hianime/anime/${animeId}/episodes`)
    console.log(url)

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(data)
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

async function parseMasterM3U8(url) {

    const resp = await fetch(url);
    const data = await resp.text();

    const lines = data.split('\n');
    const streams = [];

    var urlString = url;
    var urlPath = urlString.substring(0, urlString.lastIndexOf('/'));

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
            // Extract resolution/bitrate metadata (optional)
            const metadata = lines[i];
            const url = `${urlPath}/${lines[++i].trim()}`;
            streams.push({ url, metadata });
        }
    }
    return streams;
}

async function initPlayer() {
    
    const data = await fetchStreamData()

    const player = document.getElementById('player')
    const sources = data.data.sources;
    const tracks = data.data.tracks;

    const streams = await parseMasterM3U8(sources[0].url)
    streams.forEach((s) => {
            
            const source = document.createElement("source");
            source.src = `${s.url}#t=0.1`;
            source.type="application/x-mpegURL";

            player.appendChild(source);

        
    })
    tracks.forEach((t) => {
        
        const track = document.createElement("track");
        if (t.kind == "captions" && ['en', 'hu'].includes(t.label.slice(0, 2).toLowerCase())) {
            track.kind = "subtitles";
            track.src = t.file;
            track.srclang = t.label.slice(0, 2).toLowerCase();
            track.label = t.label;
            if (t.default) { track.default = true }

            player.appendChild(track);

        }
    })
    
    new MediaElementPlayer(player, {
        // HLS
        hls: {
            autoStartLoad: true,
            debug: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            capLevelToPlayerSize: true
        },
        
        features: [
            'playpause',
            'current',
            'progress',
            'duration',
            'volume',
            'fullscreen',
            'tracks',
            'speed',
            'quality',
        ],

        // UI
        stretching: 'auto',
        enableAutosize: true,
        audioVolume: 'horizontal',
        autoplayCaptionLanguage: 'en',

        // Subtitles
        tracksText: 'Subtitles',
        translationsText: 'Languages',
        subtitleSize: 16,  // Font size
        subtitleFamily: 'Arial',
        subtitleColor: '#FFFFFF',

        toggleCaptionsButtonWhenOnlyOn: true,

        enablePluginDebug: false,
        alwaysShowControls: true,
        hideVideoControlsOnLoad: false,
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false,

        // Callbacks
        success: function(mediaElement, originalNode) {

            // Add buffer monitoring
            const hls = mediaElement.hls;
        },
        error: function(error) {
            console.error('Player error:', error);
        }
    });
}

async function setTitle() {

    var params = await getParameters();
    const animeId = params.get('animeId')
    const title = document.getElementById('title')
    const altitle = document.getElementById('altitle')

    if (animeId == null){
        document.location.href = '../'
    }

    const episodedata = await fetchEpisodeData()
    const episodes = episodedata.data.episodes

    const animedata = await fetchAnimeInfoData()
    const animeinfo = animedata.data.anime.info

    episodes.forEach(episode => {
        if (episode.episodeId == `${animeId}?ep=${params.get('ep')}`) {
            title.textContent = `${animeinfo.name}`
            altitle.textContent = `Episode ${episode.number}: ${episode.title}`
        
        }
    })
}

async function main() {
    await setTitle()
    await initPlayer()
    
}
main()




async function next() {
    
    const params = await getParameters()
    const episodedata = await fetchEpisodeData()
    
    const episodeId = ``
    
}

