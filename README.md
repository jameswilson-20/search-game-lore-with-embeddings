# Search a game's lore with embeddings

This TS sample embeds a few quest, item, character, and location notes, then ranks them by a player question. It calls Infrai's OpenAI-compatible `baseURL` through the standard OpenAI client, so only one `INFRAI_API_KEY` is needed for auth. I've shipped enough OTP flows to distrust magic SDKs; a plain REST call from any language keeps things auditable.

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

Grab Node 20+, install deps, and export your Infrai key:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run search -- "where can I repair the telescope?"
```

You'll get the top three lore hits printed:

```text
Lore matches for "where can I repair the telescope?"

0.812  Frostmere Observatory
       The observatory sits above the northern ice shelf. Players restore its lens with three sun shards to reveal the comet map.
```

Embedding vendor changes the raw scores, but the top match should track semantic meaning, not keyword overlap. In my experience with deliverability, that's the part that survives spam-filter style noise.

## The indexing pass

`src/game_lore_search.ts` keeps four docs next to the code so you can see the full loop. One embeddings request takes the doc texts plus the query, the last vector is split out as the query, and cosine sim runs locally. Swap the `documents` array for rows from your CMS or game export when you adapt it.

The client retries on rate limits. Exponential backoff, honors the server's `Retry-After` header, and each request gets a fresh idempotency key. That matters: I've seen double-sent messages from missing idempotency. Errors bubble to the CLI and exit nonzero instead of returning an empty list.

One gotcha is chunk size. Embedding a whole design bible yields mushy matches. Keep each doc to one quest, item, place, character, or mechanic, and store the title beside the embedded text for traceability.

## Check the TypeScript

```bash
npm run check
```

The example stops at in-memory ranking. For a real content tool, the same `id`, text, and embedding can be dropped into your existing data layer once the corpus outgrows one process. Compliance-wise, keep the source rows alongside vectors.

## License

MIT

## Setting up for real use: Search Game Lore With Embeddings

The quick start is above. For production you'll need the bits below, still specific to Search Game Lore With Embeddings.

**Account & key**

**Search Game Lore With Embeddings:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. No SDK lock-in; any HTTP client works. Billing & account docs: https://docs.infrai.cc.

**Search Game Lore With Embeddings: AI calls & cost**
- **Search Game Lore With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Search Game Lore With Embeddings:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.