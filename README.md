# Memorize Bible Verses API Server

Node.js Express server that wraps [API.Bible](https://scripture.api.bible/). This server acts as a thin wrapper for API.Bible and exposes a subset of endpoints for client-side applications.

## API Features

- Caches API results in memory
- Validates API input
- Built for a client-side apps to consume
  - Keeps the API key private on the server-side
  - Uses an Application-User-Id request header to authenticate client-side apps

## Before You Code

Create an [API.Bible developer account](https://docs.api.bible/getting-started/setup-an-account) and request an API key.

## Running Locally

1. Clone the repository by running the following command in your terminal:
   ```
   git clone https://github.com/CodingForChrist/memorize-bible-verses-api-server.git
   ```
2. Create a `.env` file based on the `.env.example` file at the root of this repository:
   ```bash
   cd memorize-bible-verses-api-server
   cp .env.example .env
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```

## API Endpoints

This server wraps 4 API endpoints provided by API.Bible:

1. [Get Bibles](https://scripture.api.bible/livedocs#/Bibles/getBibles)

   Here's an example API call that gets the details for two Bible IDs:

   ```bash
   curl http://localhost:4000/api/v1/bibles --request POST \
   --data '{"language": "eng", "ids": "de4e12af7f28f599-02,32664dc3288a28df-02", "includeFullDetails": true}' \
   --header "Content-Type: application/json" \
   --header "Application-User-Id: <YOUR_APP_USER_ID>"
   ```

2. [Get Books](https://scripture.api.bible/livedocs#/Books/getBooks)

   Here's an example API call to get the books of the bible for the World English Bible translation:

   ```bash
   curl http://localhost:4000/api/v1/bibles/32664dc3288a28df-02/books --request POST \
   --data '{"includeChapters": true}' \
   --header "Content-Type: application/json" \
   --header "Application-User-Id: <YOUR_APP_USER_ID>"
   ```

3. [Get Verse](https://scripture.api.bible/livedocs#/Verses/getVerse)

   Here's an example API call to get the World English Bible version of Galatians 2:20:

   ```bash
   curl http://localhost:4000/api/v1/bibles/32664dc3288a28df-02/verses/GAL.2.20 --request POST \
   --data '{"contentType": "json"}' \
   --header "Content-Type: application/json" \
   --header "Application-User-Id: <YOUR_APP_USER_ID>"
   ```

4. [Search](https://scripture.api.bible/livedocs#/Search/searchBible)

   Here's an example API call to search the World English Bible version for for the bible verse range "John 3:1-16":

   ```bash
   curl http://localhost:4000/api/v1/bibles/32664dc3288a28df-02/search/verse-reference --request POST \
   --data '{"query": "John 3:1-16"}' \
   --header "Content-Type: application/json" \
   --header "Application-User-Id: <YOUR_APP_USER_ID>"
   ```
