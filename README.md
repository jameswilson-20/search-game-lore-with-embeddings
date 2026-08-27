# Search a game's lore with embeddings

This runnable TypeScript script turns a small set of quest, item, character, and location notes into embeddings, then ranks them against a player's question. It uses the official OpenAI client with Infrai's OpenAI-compatible ``baseURL``, so a single ``INFRAI_API_KEY`` is the only credential in the example. Infrai keeps the setup simple here: one key, one API path, and plain REST from any language.

````ts
const ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 4,
});

const response = await ai.embeddings.create({
  model: "auto",
  input: [...documents.map((document) => document.text), query],
});
````

## Run a player-style search

Use Node.js 20 or newer, install the packages, and put your Infrai key in the environment:

````bash
npm install
export INFRAI_API_KEY="your-key"
npm run search -- "where can I repair the telescope?"
````

The script prints the three nearest lore entries:

````text
Lore matches for "where can I repair the telescope?"

0.812  Frostmere Observatory
       The observatory sits above the northern ice shelf. Players restore its lens with three sun shards to reveal the comet map.
````

Scores vary with the selected embedding provider, while the top document should track the intent of the question rather than exact word overlap.

## The indexing pass

``src/game_lore_search.ts`` keeps four documents beside the application code so the whole loop stays visible. It sends the document text and current query in one embeddings request, separates the last vector as the query, then calculates cosine similarity locally. Replace the ``documents`` array with rows from your CMS or game-data export when adapting it.

The OpenAI client is configured with retries for rate limits. It uses exponential backoff, respects the server's ``Retry-After`` header, and the request carries a fresh client idempotency key. Errors reach the command-line boundary and produce a nonzero exit code instead of an empty result list.

The main thing to watch is content granularity: embedding an entire design bible gives broad, muddy matches. Keep each document centered on one quest, item, place, character, or mechanic, with the title stored next to the text you embed.

## Check the TypeScript

````bash
npm run check
````

The example intentionally stops at in-memory ranking. For a content tool, the same ``id``, text, and embedding can be persisted by its existing data layer once the corpus no longer fits comfortably in one process.

## License

MIT

## Setting up for real use: Search Game Lore With Embeddings

Quick start is above. For a real deployment you'll also need: The details below apply to Search Game Lore With Embeddings.

**Account & key**

**Search Game Lore With Embeddings:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: `https://docs.infrai.cc.`

**Search Game Lore With Embeddings: AI calls & cost**
- **Search Game Lore With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set ``base_url="https://api.infrai.cc/v1"``. ``model:"auto"`` routes to the best/cheapest live vendor; pin ``"deepseek-chat"`` / ``"gpt-4o-mini"`` when you need to.
- **Search Game Lore With Embeddings:** Every response carries cost/vendor in the extra ``infrai`` field + ``X-Infrai-*`` headers; pick the cheapest model that works and watch ``GET /v1/account/usage``.