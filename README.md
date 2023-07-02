# spotify-analytics

Spotify wrapped all year round!

## About

Store and process user data from Spotify such as song listen frequency and history.

## Features

-   See your most listened songs, artists, and playlists.
-   View a history of your Spotify usage

## Installation

Before you start, you must have [node.js](https://nodejs.org/en) installed.

<!-- The application can either be installed manually or through the CLI tool. -->

### Manual install

1. Clone or download the project:

```sh
git clone https://github.com/TheIthorian/spotify-analytics.git spotify-analytics
```

2. Copy the `apps\api\.env.example` file into a new `apps\api\.env` file.

3. Build and start the application:

```sh
npx turbo build
```

```sh
npx turbo start
```

4. By default, the app will be available on [http://localhost:3000/](http://localhost:3000/)

<!-- ### CLI Installer -->

## How-to

Go to https://www.spotify.com/us/account/privacy/ and request to download your extended streaming history. Upload the history through the web app.

Once you have your streaming history, extract the files and upload them on the "Get Started" page. Once the files have been processed, your data will be available in the dashboard.
