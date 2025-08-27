import { Command } from "../types/commandGenerator.js";

async function resolvedPathName(commandObj: Command) {
  if (!commandObj.placeholder) return commandObj.command;
  const placeholderParts = commandObj.placeholder.split(" ");
  const locIndex = placeholderParts.findIndex((p) => p.includes("<location>"));
  if (locIndex === -1) return commandObj.command;

  const cmdParts = commandObj.command.split(" ");
  const location = cmdParts[locIndex] || "";
  if (!location) return commandObj.command;

  const parts = location.split("/").filter(Boolean);

  let currentPath = "";
  const homeDir = "~";

  if (parts[0] === "~") {
    currentPath = homeDir;
    parts.shift();
  }

  function levenshteinDistance(a: string, b: string) {
    const dp = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0)
    );
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  function similarityPercent(a: string, b: string) {
    const levDist = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
    const maxLen = Math.max(a.length, b.length);
    return ((maxLen - levDist) / maxLen) * 100;
  }

  function closestMatch(name: string, candidates: string[]) {
    let best = "";
    let bestDist = Infinity;

    for (const c of candidates) {
      const dist = levenshteinDistance(name.toLowerCase(), c.toLowerCase());
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
    return best;
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  const updatedParts: string[] = [];
  for (const part of parts) {
    const basePath =
      currentPath === "~" ? process.env.HOME || "~" : currentPath;
    let entries: string[];
    try {
      entries = await fs.readdir(basePath);
    } catch {
      entries = [];
    }
    const match = closestMatch(part, entries);

    if (match) {
      const score = similarityPercent(part, match);
      if (score >= 70) {
        updatedParts.push(match);
      } else {
        updatedParts.push(part);
      }
    } else {
      updatedParts.push(part);
    }

    currentPath = path.join(basePath, updatedParts[updatedParts.length - 1]);
  }

  let newLocation = updatedParts.join("/");
  if (location.startsWith("~")) newLocation = "~/" + newLocation;

  cmdParts[locIndex] = newLocation;

  return cmdParts.join(" ");
}

export default resolvedPathName;
