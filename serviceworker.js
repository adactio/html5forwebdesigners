'use strict';

const version = 'v0.01::';
const staticCacheName = version + 'static';

function updateStaticCache() {
    return caches.open(staticCacheName)
        .then( cache => {
            // These items won't block the installation of the Service Worker
            cache.addAll([
                '/css/font/leaguegothic-regular-webfont.woff',
                '/img/abookapart.png',
                '/img/cover.png',
                '/img/fig-03-01.png',
                '/img/fig-03-02.png',
                '/img/fig-03-03.png',
                '/img/fig-03-04.png',
                '/img/fig-03-05.png',
                '/img/fig-03-06.png',
                '/img/fig-03-07.png',
                '/img/fig-03-08.png',
                '/img/fig-04-01.png',
                '/img/fig-04-02.png',
                '/img/fig-04-03.png',
                '/img/fig-04-04a.png',
                '/img/fig-04-04b.png',
                '/img/fig-04-05a.png',
                '/img/fig-04-05b.png',
                '/img/fig-04-05c.png',
                '/img/fig-04-06.png',
                '/img/fig-04-07.png',
                '/img/fig-04-08.png',
                '/img/fig-05-01.png',
                '/img/fig-05-02.png',
                '/icon.png'
            ]);
            // These items must be cached for the Service Worker to complete installation
            return cache.addAll([
                '/index.html',
                '/offline/index.html',
                '/history/index.html',
                '/design/index.html',
                '/media/index.html',
                '/forms/index.html',
                '/semantics/index.html',
                '/today/index.html',
                '/index/index.html',
                '/css/global.css'
            ]);
        });
}

// Remove caches whose name is no longer valid
function clearOldCaches() {
    return caches.keys()
        .then( keys => {
            return Promise.all(keys
                .filter(key => key.indexOf(version) !== 0)
                .map(key => caches.delete(key))
            );
        });
}

self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache()
        .then( () => self.skipWaiting() )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clearOldCaches()
        .then( () => self.clients.claim() )
    );
});

self.addEventListener('fetch', event => {
    let request = event.request;
    // Look in the cache first, fall back to the network
    event.respondWith(
        caches.match(request)
            .then(response => {
                // CACHE
                return response || fetch(request)
                    .then( response => {
                        // NETWORK
                        return response;
                    })
                    .catch( () => {
                        // OFFLINE
                        // If the request is for an image, show an offline placeholder
                        if (request.headers.get('Accept').indexOf('image') !== -1) {
                            return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
                        }
                        // If the request is for a page, show an offline message
                        if (request.headers.get('Accept').indexOf('text/html') !== -1) {
                            return caches.match('/offline/index.html');
                        }
                    });
            })
    );
});
