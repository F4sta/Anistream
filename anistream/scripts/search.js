
// sorting functions
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
function jaroWinklerDistance(a, b) {
  // Jaro-Winkler implementation (prefix-focused similarity)
  if (a === b) return 1.0;

  const maxLength = Math.max(a.length, b.length);
  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(b.length, i + matchDistance + 1);
    for (let j = start; j < end; j++) {
      if (!bMatches[j] && a[i] === b[j]) {
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatches[i]) {
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }

  const jaro = (
    (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3
  );

  // Winkler adjustment for prefix (up to 4 characters)
  const prefixLength = Math.min(4, [...a].slice(0, 4).filter((c, i) => c === b[i]).length);
  const winkler = jaro + prefixLength * 0.1 * (1 - jaro);

  return winkler;
}
function calculateWordAlignment(candidate, targetWords) {
  let currentPos = 0;
  let matchedWords = 0;
  for (const word of targetWords) {
    const index = candidate.indexOf(word, currentPos);
    if (index >= currentPos) {
      matchedWords++;
      currentPos = index + word.length;
    } else {
      break; // Words must appear in order
    }
  }
  return matchedWords;
}
function sortBySimilarity(array, target) {
  const targetNoSpaces = target.replace(/\s/g, '');
  const targetWords = target.split(' ');

  return array.slice().sort((a, b) => {
    // Priority 1: Exact match when spaces are removed
    const aNoSpace = a.replace(/\s/g, '');
    const bNoSpace = b.replace(/\s/g, '');
    if (aNoSpace === targetNoSpaces && bNoSpace !== targetNoSpaces) return -1;
    if (bNoSpace === targetNoSpaces && aNoSpace !== targetNoSpaces) return 1;

    // Priority 2: Target is a direct substring of the candidate
    const aHasSubstring = a.includes(target) ? 1 : 0;
    const bHasSubstring = b.includes(target) ? 1 : 0;
    if (aHasSubstring !== bHasSubstring) return bHasSubstring - aHasSubstring;

    // Priority 3: Check for target words appearing in order (as substrings)
    const aWordAlignment = calculateWordAlignment(a, targetWords);
    const bWordAlignment = calculateWordAlignment(b, targetWords);
    if (aWordAlignment !== bWordAlignment) return bWordAlignment - aWordAlignment;

    // Priority 4: Jaro-Winkler similarity (adjusted for prefix)
    const scoreA = jaroWinklerDistance(a, target) + (aWordAlignment * 0.2);
    const scoreB = jaroWinklerDistance(b, target) + (bWordAlignment * 0.2);

    return scoreB - scoreA;
  });
}

async function getParameters() {
  const urlString = document.URL
  const Params = new URL(urlString).searchParams
  return Params
}

async function fetchData() {
    const params = await getParameters()
    var url = new URL(`${api_url}/api/v2/hianime/search?`)
    url.searchParams.set('q', params.get('q'));
    url.searchParams.set('page', params.get('page'));

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(url);
        console.log(data);
        console.log('Fetching successful');
        return data
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
}

async function setSearchResult_h1() {
  const params = await getParameters();
  const search_result_h1 = document.getElementById('search_result')
  console.log(params)
  search_result_h1.textContent = `Search: ${(params.get('q') || '').replace(/%20/g, " ")}`
}

function createAnimeCard(anime) {
  const card = document.createElement("div");
  card.className = "anime-card";

  const link = document.createElement("a");
  link.href = `anime-episodes.html?animeId=${anime.id}`;
  link.style.textDecoration = "none";
  link.style.color = "inherit";

  const img = document.createElement("img");
  img.src = anime.poster;
  img.alt = anime.name;

  const details = document.createElement("div");
  details.className = "anime-details";

  const title = document.createElement("h3");
  title.textContent = anime.name;

  const jname = document.createElement("p");
  jname.textContent = `Japanese: ${anime.jname}`;

  const duration = document.createElement("p");
  duration.textContent = `Duration: ${anime.duration}`;

  const type = document.createElement("p");
  type.textContent = `Type: ${anime.type}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${anime.rating || "Safe"}`;

  const episodes = document.createElement("p");
  episodes.textContent = `Episodes: Sub (${anime.episodes.sub}), Dub (${anime.episodes.dub || "N/A"})`;

  details.appendChild(title);
  details.appendChild(jname);
  details.appendChild(duration);
  details.appendChild(type);
  details.appendChild(rating);
  details.appendChild(episodes);

  card.appendChild(img);
  card.appendChild(details);

  // Wrap the card in the anchor tag
  link.appendChild(card);

  return link; // Return the anchor tag instead of the card
}

// Function to add anime cards to the HTML
async function addAnimeCards() {

  var data = await fetchData();
  var animes = data.data.animes;

  const animeContainer = document.getElementById("anime-container");

  // sorting animes
  const params = await getParameters()
  const query = params.get('q').replace(/%20/g, " ")
  var dict = new Map()
  animes.forEach((anime) => {
    dict.set(anime.name, anime)
  })
  var ani = new Array()
  animes.forEach((anime) => {
    ani.push(anime.name)
  })
  var ani = sortBySimilarity(ani, query)
  
  var sortedAnimes = new Array()
  ani.forEach(anime => {
    sortedAnimes.push(dict.get(anime))
  });
  console.log('Sorting Animes succesfull')
  console.log(sortedAnimes)

  sortedAnimes.forEach((anime) => {
    const card = createAnimeCard(anime);
    animeContainer.appendChild(card);
  });
}

async function back_next() {
  const search_data = await fetchData()

  const current_page = search_data.data.currentPage
  const total_pages = search_data.data.totalPages
  console.log(`page: ${current_page}/${total_pages}`)

  const back_button = document.getElementById('back')
  const next_button = document.getElementById('next')

  if (current_page > 0){
    back_button.hidden = true
  } else {
    back_button.hidden = false
  }
  if (current_page == total_pages || total_pages == 0){
    next_button.hidden = true
  } else {
    next_button.hidden = false
  }

}

async function back_func() {
  const params = await getParameters();
  const query = params.get('q')
  const search_data = await fetchData()

  const current_page = search_data.data.currentPage

  console.log(current_page)
  if (current_page > 0){
    var page = current_page - 1
    window.location.href = `/anistream/search.html?q=${query}&page=${page}`
  }
}

async function next_func() {
  const params = await getParameters();
  const query = params.get('q')
  const search_data = await fetchData()

  const current_page = search_data.data.currentPage
  const hasNextPage = search_data.data.hasNextPage

  if (hasNextPage){
    var page = current_page + 1
    window.location.href = `/anistream/search.html?q=${query}&page=${page}`
  }
}

const back_b = document.getElementById('back')
const next_b = document.getElementById('next')

back_b.onclick = back_func
next_b.onclick = next_func


setSearchResult_h1()
addAnimeCards();
back_next()
