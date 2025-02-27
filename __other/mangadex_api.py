import requests

base_url = "https://api.mangadex.org"
docs = f"{base_url}/docs"

title = "Oshi no Ko"

manga_search = get(
    base_url = base_url,
    alt_urls = ["manga"],
    params = {"title": title},
)
print(manga_search)
id = manga_search["data"][0]["id"]
chapter_search = get(
    base_url = base_url,
    alt_urls = ["manga", id, "feed"],
    params = {},
)

data = chapter_search["data"]

v1ch1 = []
for i in data:
    if not i["attributes"]["volume"] == "1":
        continue
    if not i["attributes"]["chapter"] == "3":
        continue
    if not i["attributes"]["translatedLanguage"] == "en":
        continue
    if i["attributes"]["pages"] == 0:
        continue
    
    v1ch1.append(i)

chId = v1ch1[0]["id"]

chapter_source = get(
    base_url = base_url,
    alt_urls = ["at-home", "server", chId],
    params={},
)

base_url = chapter_source["baseUrl"]
ch = chapter_source["chapter"]
hash = ch["hash"]
data = ch["data"]
dataSaver = ch["dataSaver"]

print("\n>> Data")
for i in data:
    print(f"{base_url}/data/{hash}/{i}")

print("\n>> Data-saver")
for i in dataSaver:
    print(f"{base_url}/data-saver/{hash}/{i}")