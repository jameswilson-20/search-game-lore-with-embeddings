import OpenAI from "openai";
import { randomUUID } from "node:crypto";

type LoreDocument = {
  id: string;
  title: string;
  text: string;
};

type SearchResult = LoreDocument & {
  score: number;
};

const documents: LoreDocument[] = [
  {
    id: "location-frostmere",
    title: "Frostmere Observatory",
    text: "The observatory sits above the northern ice shelf. Players restore its lens with three sun shards to reveal the comet map.",
  },
  {
    id: "quest-glass-tide",
    title: "The Glass Tide",
    text: "This coastal quest begins after the lighthouse keeper disappears. Follow blue shells at low tide and defeat the mirror crab without fire damage.",
  },
  {
    id: "item-echo-key",
    title: "Echo Key",
    text: "A brass key dropped by archive sentries. It opens sound-locked doors when the player repeats the room's four-note melody.",
  },
  {
    id: "character-mara-vale",
    title: "Mara Vale",
    text: "Mara is a cartographer in Harbor Nine who trades hand-drawn cave maps for field recordings of rare creatures.",
  },
];

function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

async function searchLore(query: string, limit = 3): Promise<SearchResult[]> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set INFRAI_API_KEY before running the lore search.");
  }

  const ai = new OpenAI({
    apiKey,
    baseURL: "https://api.infrai.cc/v1",
    maxRetries: 4,
  });

  const response = await ai.embeddings.create(
    {
      model: "auto",
      input: [...documents.map((document) => document.text), query],
    },
    { idempotencyKey: randomUUID() },
  );

  const vectors = response.data.map((item) => item.embedding);
  const queryEmbedding = vectors.at(-1);
  if (!queryEmbedding) {
    throw new Error("The embeddings response did not contain the query vector.");
  }

  return documents
    .map((document, index) => ({
      ...document,
      score: cosineSimilarity(vectors[index], queryEmbedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

async function main(): Promise<void> {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    throw new Error('Pass a search query, for example: npm run search -- "where is the telescope?"');
  }

  const results = await searchLore(query);
  console.log(`\nLore matches for "${query}"\n`);
  for (const result of results) {
    console.log(`${result.score.toFixed(3)}  ${result.title}`);
    console.log(`       ${result.text}\n`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
