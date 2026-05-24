# Karina Pack - gotowa strona download

Statyczna strona do publikacji dla packa `Karina_Pack.mp4`. Projekt zawiera:

- glowna strone download z panelem odblokowania przez reklamy,
- wszystkie przekazane skrypty reklamowe osadzone w izolowanych slotach,
- zgode na zewnetrzne reklamy przed zaladowaniem skryptow,
- 2-minutowy timer startujacy po kliknieciu pobierania,
- masowa sciane reklam ladowana automatycznie po zgodzie,
- zapis startu timera i odblokowania w `localStorage`,
- gotowe strony `privacy.html`, `terms.html` i `404.html`,
- `site.webmanifest`, `sw.js`, `robots.txt`, `sitemap.xml`,
- konfiguracje dla Netlify, Vercel i Apache.

## Najwazniejszy krok przed publikacja

Wrzuc prawdziwy plik wideo tutaj:

```text
downloads/Karina_Pack.mp4
```

Nie utworzylem pustego pliku MP4, bo to bylby uszkodzony download. Kod strony jest gotowy, ale
realny pack musi zostac dodany jako prawdziwy plik wideo.

## Konfiguracja

Najwazniejsze ustawienia sa w:

```text
assets/js/config.js
```

Mozesz tam zmienic:

- `waitSeconds` - czas oczekiwania przed pobraniem, domyslnie 120 sekund,
- `adRepeats` - ile razy powtorzyc zestaw reklam na stronie,
- `downloadUrl` - sciezka do pliku,
- `fileName` - nazwa pobieranego pliku.

## Reklamy

Sloty reklamowe sa w:

```text
assets/js/ads.js
```

Skrypty reklam nie laduja sie od razu. Uzytkownik musi zaakceptowac ladowanie reklam,
a potem strona automatycznie wypelnia strefe reklam wieloma slotami.

Klikniecie przycisku pobierania nie wymaga obejrzenia konkretnej liczby reklam. Uruchamia
2-minutowy timer, przewija do strefy download i dopiero po odliczeniu aktywuje finalny link.

Strona nie wykonuje automatycznych klikniec reklam i nie tworzy ukrytych wyswietlen.

## Publikacja

Mozesz wrzucic katalog na dowolny statyczny hosting:

- Netlify: uzyje `netlify.toml` oraz `_headers`,
- Vercel: uzyje `vercel.json`,
- Apache: uzyje `.htaccess`,
- zwykly hosting: wrzuc wszystkie pliki zachowujac strukture katalogow.

Po ustawieniu domeny podmien w `sitemap.xml` i `robots.txt` wartosc `https://example.com/` na
wlasny adres.

## O zabezpieczeniu downloadu

Statyczna strona moze odblokowywac przycisk w UI, ale nie ukryje w 100% publicznego pliku przed
osoba techniczna. Jezeli chcesz twardo zabezpieczyc MP4, trzymaj plik poza publicznym katalogiem i
wydawaj podpisany link z backendu, prywatnego S3/R2 albo serwera.
