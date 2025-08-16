import { Command } from "../types/commandGenerator.js";

async function resolvedAppName(commandObj: Command) {
  if (!commandObj.placeholder) return commandObj.command;

  const placeholderParts = commandObj.placeholder.split(" ");
  const locIndex = placeholderParts.findIndex((p) => p.includes("<app_name>"));
  if (locIndex === -1) return commandObj.command;

  const cmdParts = commandObj.command.split(" ");
  const appName = cmdParts[locIndex] || "";
  if (!appName) return commandObj.command;

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
    let bestScore = -Infinity;
    for (const c of candidates) {
      const score = similarityPercent(name, c);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return { best, bestScore };
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  let appCandidates: string[] = [];

  async function getAppsInDir(dir: string) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.endsWith(".app"))
          appCandidates.push(path.basename(file, ".app"));
      }
    } catch {}
  }

  await getAppsInDir("/Applications");
  await getAppsInDir(`${process.env.HOME}/Applications`);

  const { best, bestScore } = closestMatch(
    appName.replace(/"/g, ""),
    appCandidates
  );
  console.log(best, bestScore);
  if (best && bestScore >= 50) {
    cmdParts[locIndex] = `"${best}"`;
  }

  return cmdParts.join(" ");
}

export default resolvedAppName;
