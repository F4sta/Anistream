
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

function getResolution(line) {
    // Extract the resolution part using regex
    const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
    
    if (!resolutionMatch) return null;
    
    // Split into width and height
    const [width, height] = resolutionMatch[1].split('x').map(Number);
    
    return {
      resolution: resolutionMatch[1],
      width: width,
      height: height
    };
  }

async function initPlayer() {
    
    const data = await fetchStreamData()
    const sources = data.data.sources;
    const tracks = data.data.tracks;
    const streams = await parseMasterM3U8(sources[0].url)
    const player_source = []
// Initialize Player
    const player = videojs('player', {
        html5: {
            hls: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                smoothQualityChange: true,
                bandwidth: 2000000
                
            },
        },
        liveui: true,
        playbackRates: [0.5, 1, 1.5, 2],
        aspectRatio: '16:9',
        fluid: true,
        userActions: {
            hotkeys: true,
            doubleClick: true
        },
        controlBar: {
            children: [
                "playToggle",
                "durationDisplay",
                "timeDivider",
                "currentTimeDisplay",
                "progressControl",
                "remainingTimeDisplay",
                "volumePanel",
                "AudioTrackButton",
                "PlaybackRateMenuButton",
                "subsCapsButton",
                "PictureInPictureToggle",
                "QualitySelector",
                "fullscreenToggle",
            ]
        },
    });

    player.textTrackSettings.setValues({
        "backgroundColor": "#000",
        "backgroundOpacity": "0",
        "edgeStyle": "uniform",
    });
    player.textTrackSettings.updateDisplay();
    player.textTrackSettings.saveSettings();
    
    streams.forEach((s) => {
            
        var res_text = `${getResolution(s.metadata).height}P`

        player_source.push({
            src: `${s.url}#t=0.1`,
            type:"application/x-mpegURL",
            label: res_text,
        })
        
    })
    player.src(player_source)

    // HLS Configuration
    const hls = new Hls({
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        debug: false,
        enableStreaming: true,
        lowLatencyMode: true,
        backBufferLength: 90
    });
    // Load Source
    hls.attachMedia(player.tech().el());

    // Error Handling
    hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                default:
                    hls.destroy();
                    break;
            }
        }
    });

    // Advanced Features Setup
    player.ready(() => {

        const qualityLevels = player.qualityLevels();
    
        qualityLevels.on('change', () => {
            tracks.forEach((t) => {
                if (t.kind == "captions" && ['en', 'hu'].includes(t.label.slice(0, 2).toLowerCase())) {
                    player.addRemoteTextTrack({
                        kind: "captions",
                        src: t.file,
                        srclang: t.label.slice(0, 2).toLowerCase(),
                        label: t.label,
                        default: Boolean(`${t.default ? true : false}`)
                    }, false)
                }
            });
        });
        // autoplay
        // player.play().catch(function(error) {
        //   console.log("Auto-play prevented:", error);
        // });

        // Network Status Monitoring
        let lastPlaybackRate = 1;
        player.on('waiting', () => {
            lastPlaybackRate = player.playbackRate();
            player.playbackRate(1);
        });
        
        player.on('playing', () => {
            player.playbackRate(lastPlaybackRate);
        });

        // Adaptive Bitrate Control
        player.on('loadedmetadata', () => {
            const tech = player.tech({ IWillNotUseThisInPlugins: true });
            
            hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
                const stats = hls.abrController._bwEstimator.getEstimate();
                console.log('Bandwidth:', stats.bwEstimate);
            });
        });

        // Advanced Analytics
        const trackEvent = (eventName, metadata) => {
            console.log('Player Event:', eventName, metadata);
            // Integrate with analytics service
        };

        player.on('play', () => trackEvent('play'));
        player.on('pause', () => trackEvent('pause'));
        player.on('ended', () => trackEvent('video_end'));
        player.on('error', () => trackEvent('error', player.error()));
    });

    // Mobile Touch Gestures
    player.on('touchstart', (e) => {
        // Implement swipe gestures for seek
    });

    // Advanced Error Recovery
    let retries = 0;
    player.on('error', () => {
        if (retries < 3) {
            retries++;
            setTimeout(() => player.src({
            type: "application/x-mpegURL",
            src: "https://w2r.jonextugundu.net/_v7/e6d086c7d28aa31a6cad756ac4ff9a030c3c9c1f790724b0b410e2b579cd181c7832c74e50607557fdae1e95500eba47cba14f7a97ded7db3ce9a1201b5fc2b18d3627b04a9a594a3ce9842f525fa16cd206254565ddc5e25260c334004d654d29547743a915b22465f04e3e002ecdf767ad038f0625b9fd61fc3ee3a4124160/master.m3u8"          
            }), 1000 * retries);
        }
    });

}
function createEpisodeListItem(episode) {

    const title = document.createElement("h1");
    title.className = "ep-text";
    title.textContent = `${episode.number}`;

    const link = document.createElement("a");
    link.href = `anime-stream.html?animeId=${episode.episodeId.replace('?', '&')}`;
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.className = 'ep-item'

    link.appendChild(title)

    return link;
}
async function setTitle() {

    var params = await getParameters();
    const episodedata = await fetchEpisodeData()
    const episodes = episodedata.data.episodes
    const animedata = await fetchAnimeInfoData()
    const animeinfo = animedata.data.anime.info

    const animeId = params.get('animeId')
    const episodeId = params.get('ep')
    const title = document.getElementById('title')
    title.textContent = animeinfo.name
    const altitle = document.getElementById('altitle')

    if (animeId == null){
        document.location.href = '../index.html'
    }


    const episodeDiv = document.getElementById("ep-div");
    episodes.forEach(episode => {
        const item = createEpisodeListItem(episode)

        if (episode.episodeId == `${animeId}?ep=${episodeId}`) {
            altitle.textContent = `${episode.number}. ${episode.title}`
            item.id = 'selected'
        }

        episodeDiv.appendChild(item)
    })
}

async function main() {
    await setTitle()
    await initPlayer()
    
}
main()

