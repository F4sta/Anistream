
console.log(local_api_url)
console.log(online_api_url)
console.log(api_url)

const search_bar = document.getElementById('search_bar')

function search(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        window.location.href = `/anistream/search.html?q=${search_bar.value}`
    }
}

search_bar.onkeyup = search

