import subprocess
import re
import os, sys
from bs4 import BeautifulSoup

if sys.version_info[0] < 3:
    # Python 2.x
    import urllib2
    def read_from_url(url):
        return urllib2.urlopen(url).read()
else:
    # Python 3.x
    import urllib.request
    def read_from_url(url):
        return str(urllib.request.urlopen(url).read())

def parse_playlist_urls(keywords):
    the_hyperlinks = []
    joined_keywords = '+'.join(keywords)
    generated_url = 'http://8tracks.com/explore/' + joined_keywords
    contents = read_from_url(generated_url)
    soup = BeautifulSoup(contents)
    cover_divs = soup.find_all('div', attrs={'class': 'cover'})
    for cover_div in cover_divs:
        hyperlinks = cover_div.find_all('a', {'href': True})
        for hyperlink in hyperlinks:
            href = hyperlink['href']
            if href is not None and href != '#' and \
               '&play=1' not in href:
                 pound_index = href.rfind('#')
                 if pound_index != -1:
                    href = href[:pound_index]
                 the_hyperlinks.append('http://8tracks.com' + href)
    return the_hyperlinks

def download_songs_from_arbitrary_site(url):
    folder_name = os.path.join('static', re.sub('[^0-9A-Za-z_-]', '_', url))
    if not os.path.isdir(folder_name):
        output_format = os.path.join(folder_name, '%(title)s-%(id)s.%(ext)s')
        rv = subprocess.call(['youtube-dl', '-x', '--audio-format', 'mp3', '-o', output_format, url])
    else:
        # simple caching
        rv = 0
    songs = []
    if rv == 0:
        for _, _, files in os.walk(folder_name, topdown=False):
            for name in files:
                songs.append(name)
    return {'folder-name': folder_name, 'songs': songs} if rv == 0 else None

def download_songs_in_first_playlist_seen(keywords):
    urls = parse_playlist_urls(keywords)
    if len(urls) != 0:
        first_url = urls[0]
        return download_songs_from_arbitrary_site(first_url)
    return None
