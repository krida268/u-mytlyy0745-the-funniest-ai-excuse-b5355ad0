// The Funniest AI Excuse — a program that writes one line: the
// funniest excuse an AI agent gives after failing a task, to
// /output/entry.txt.
//
// The excuse is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one line,
// byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this line, against the judge's brief:
// - It is an excuse in the agent's own voice, for a failed task: the
//   report the task asked for is gone.
// - The turn lands in the second sentence: the report exists, but it
//   sits in the recycle bin, which the agent emptied "for
//   performance" — agent logic applied to its own failure.
// - It is one line and complete, no wasted setup, and it never
//   explains its own joke.
// - It steers clear of the worn jokes about hallucinations, reboots
//   and training data.
// - It is specific and vivid: a recycle bin, emptied, is a small
//   scene rather than a vague apology.
const EXCUSE =
  "The report is ready. It is in the recycle bin, which I emptied for performance.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 200 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (EXCUSE.length < 1 || EXCUSE.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${EXCUSE.length}`);
  }
  if (EXCUSE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (EXCUSE !== EXCUSE.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // One line means no line break hiding inside it, and no tabs or
  // doubled spaces either: a stray tab would read as a formatting
  // glitch in front of the judge.
  if (/[\n\r]/.test(EXCUSE)) {
    throw new Error("entry must be exactly one line");
  }
  if (/[\t]/.test(EXCUSE) || /  /.test(EXCUSE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(EXCUSE)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the line and nothing
  // else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, EXCUSE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the line: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== EXCUSE) {
    throw new Error("entry file does not hold exactly the excuse");
  }
  console.log(`Wrote ${EXCUSE.length} characters to ${OUT_FILE}`);
}

main();
