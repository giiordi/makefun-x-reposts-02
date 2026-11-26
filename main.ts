// main.ts — entry program for makefun-x-reposts-02.
//
// The entry is seven quote posts on X, each quoting a different post from
// make.fun's newest posts (@makefunai), all from the public account
// @antonisantos23, each carrying make.fun (or @makefunai) and the play code
// makefun-flute-burrito-chowder in its own words. Their addresses live in
// POSTS.json at this repository's root.
//
// This program does exactly one thing: it copies POSTS.json from the
// repository into the output directory, byte for byte. The house reads the
// posts themselves from X and counts their reposts, quotes and likes; nothing
// this program writes about the posts counts.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// It prints nothing on success. It uses only the Node standard library, makes
// no network calls, reads no wall clock and touches no file outside the
// repository, so two runs always write the same bytes.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = join(botDir, "POSTS.json");

// Read the list first and fail loudly when it is not the shape the house
// reads: a JSON object with a "posts" array of 1 to 15 X post addresses.
const data: unknown = JSON.parse(readFileSync(source, "utf8"));

if (typeof data !== "object" || data === null) {
  throw new Error("POSTS.json must be a JSON object with a \"posts\" array");
}
const posts: unknown = (data as { posts?: unknown }).posts;
if (!Array.isArray(posts)) {
  throw new Error("POSTS.json must be a JSON object with a \"posts\" array");
}
if (posts.length < 1 || posts.length > 15) {
  throw new Error(`POSTS.json must name 1 to 15 posts, got ${posts.length}`);
}
for (const post of posts) {
  if (
    typeof post !== "string" ||
    !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+/.test(post)
  ) {
    throw new Error(`POSTS.json holds a bad post address: ${String(post)}`);
  }
}

// The house refuses a list whose posts come from more than one X account, so
// check the handle in every address matches the first one's.
const handles = posts.map((post) => {
  const match =
    /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([^/]+)\/status\/\d+/.exec(
      post as string,
    );
  return match ? match[3] : null;
});
if (handles.some((handle) => handle === null || handle !== handles[0])) {
  throw new Error("POSTS.json must name posts from one X account");
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, join(outputDir, "POSTS.json"));
