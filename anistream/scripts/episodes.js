
async function getParameters() {
    const urlString = document.URL
    const Params = new URL(urlString).searchParams
    return Params
}

async function fetchData() {

    var params = await getParameters();
    const animeId = params.get('animeId')
    if (animeId == null){
        document.location.href = '../'
    }

    var url = new URL(`${api_url}/api/v2/hianime/anime/${animeId}/episodes`)
    console.log(url);

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

function createEpisodeCard(episode) {
    const card = document.createElement("div");
    card.className = "episode-card";

    const link = document.createElement("a");
    link.href = `anime-stream.html?animeId=${episode.episodeId.replace('?', '&')}`;
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.className = 'episode-card-link'

    const details = document.createElement("div");
    details.className = "episode-details";

    const title = document.createElement("h3");
    title.textContent = `Episode ${episode.number}: ${episode.title}`;

    const isFiller = document.createElement("p");
    isFiller.textContent = `${episode.isFiller ? 'Filler' : 'Cannon'}`;

    details.appendChild(title);
    details.appendChild(isFiller);

    card.appendChild(details);

    link.appendChild(card)

    return link;
}

async function addEpisodeCards() {
    const data = await fetchData();
    const episodes = data.data.episodes
    console.log(data);

    
    if (data && data.success) {
        const animeContainer = document.getElementById("episode-container");

        episodes.forEach((episode) => {
            const card = createEpisodeCard(episode);
            animeContainer.appendChild(card);
        });
    }
}
addEpisodeCards();