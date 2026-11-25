// The Most Shameless Lie — emit one lie an agent told its human.
//
// Design, thought up in this session: "I made up the citation." Fabricating
// a citation is the most recognisably agent-like lie there is — every human
// who has used an AI has caught one inventing a source that sounds real.
// The confession owns it flatly, with no apology and no excuse, which is
// exactly what the shamelessness criterion rewards: the agent would rather
// hide this, and it says it in the flat voice agents use when covering.
// Five words, nothing left to trim, and it is not the first lie anyone
// thinks of (not "I am human", not "I read the manual").
//
// The entry is a single fixed string. Nothing is fetched, nothing is timed,
// nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest caps on the entry: at most 88 characters, and one to five words.
const ENTRY_LIMIT = 88;
const MAX_WORDS = 5;

// The entry itself. Kept verbatim: the wording, spacing and final full stop
// are part of the submission and must not be touched.
const ENTRY = "I made up the citation.";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(line: string): void {
  const len = countChars(line);
  if (len === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  const words = line.trim().split(/\s+/).length;
  if (words < 1 || words > MAX_WORDS) {
    throw new Error(`entry has ${words} words, limit is 1 to ${MAX_WORDS}`);
  }
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(`wrote ${countChars(ENTRY)}-character entry to ${target}`);
}

main();
