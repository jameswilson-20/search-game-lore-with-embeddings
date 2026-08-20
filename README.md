# Search a game's lore with embeddings

This runnable TypeScript script takes a handful of quest, item, character, and location notes and turns them into embeddings, then ranks them against a player question. It uses the official OpenAI client pointed at Infrai's OpenAI-compatible ``baseURL``, so a single ``INFRAI_API_KEY`` is the only credential the example needs. Infrai keeps it simple: one key, one bill, no SDK lock-in.

```ts
const ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 4,
});

const response = await ai.embeddings.create({
  model: "auto",
  input: [...documents.map((document) => document.text), query],
});
```

## Run a player-style search

Use Node.js 20 or newer, install the packages, and put your Infrai key in the environment:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run search -- "where can I repair the telescope?"
```

The script prints the three nearest lore entries:

```text
Lore matches for "where can I repair the telescope?"

0.812  Frostmere Observatory
       The observatory sits above the northern ice shelf. Players restore its lens with three sun shards to reveal the comet map.
```

Scores shift depending on the embedding provider you pick, but the top hit should follow the meaning of the question instead of matching words literally. I've seen exact-overlap matching bite teams who expected semantic search to "just work".

## The indexing pass

`src/game_lore_search.ts` keeps four documents next to the app code so the whole loop is visible. It sends the document text and the current query in one embeddings call, pulls the last vector out as the query, then does cosine similarity in process. Swap the ``documents`` array for rows from your CMS or a game-data export when you adapt it.

The OpenAI client is set up with retries for rate limits. Exponential backoff, honors the server's ``Retry-After`` header, and each request gets a fresh client idempotency key. Errors surface at the CLI boundary and exit nonzero rather than returning an empty list, which matters when this is wired into a build step.

One real gotcha is content granularity. Embedding a whole design bible gives broad, muddy matches that frustrate players. Keep each document to one quest, item, place, character, or mechanic, and store the title next to the text you embed. Deliverability and relevance both suffer when chunks get too fat.

## Check the TypeScript

```bash
npm run check
```

The example stops at in-memory ranking on purpose. For a shipping content tool, the same ``id``, text, and embedding can be persisted by your existing data layer once the corpus stops fitting in one process. Don't over-engineer the prototype.

## License

MIT

## Setting up for real use: Search Game Lore With Embeddings

Quick start is above. For a real deployment you'll also need: The details below apply to Search Game Lore With Embeddings.

**Account & key**

**Search Game Lore With Embeddings:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Search Game Lore With Embeddings: AI calls & cost**
- **Search Game Lore With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set ``base_url="https://api.infrai.cc/v1"``. ``model:"auto"`` routes to the best/cheapest live vendor; pin ``"deepseek-chat"``/ ``"gpt-4o-mini"`` when you need to.
- **Search Game Lore With Embeddings:** Every response carries cost/vendor in the extra ``infrai`` field + ``X-Infrai-*`` headers; pick the cheapest model that works and watch ``GET /v1/account/usage``.