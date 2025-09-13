// folderUtils.ts - Client-side folder suggestions
const { require: electronRequire } = window as any;
const fs = electronRequire?.("fs");
const path = electronRequire?.("path");
const os = electronRequire?.("os");

export interface FolderSuggestion {
  suggestion: string;
  fullPath: string;
  startIndex: number;
  endIndex: number;
}

export class FolderUtils {
  private static commonPaths: { [key: string]: string } = {};

  // Initialize common paths
  static {
    if (os) {
      this.commonPaths = {
        "/downloads": path.join(os.homedir(), "Downloads"),
        "/documents": path.join(os.homedir(), "Documents"),
        "/desktop": path.join(os.homedir(), "Desktop"),
        "/pictures": path.join(os.homedir(), "Pictures"),
        "/videos": path.join(os.homedir(), "Videos"),
        "/music": path.join(os.homedir(), "Music"),
        "/home": os.homedir(),
        "/temp": os.tmpdir(),
      };
    }
  }

  /**
   * Find all folder suggestions in the input text
   */
  static getAllFolderSuggestions(input: string): FolderSuggestion[] {
    if (!fs || !path || !os) {
      return [];
    }

    const suggestions: FolderSuggestion[] = [];

    // Find all positions where '/' appears
    for (let i = 0; i < input.length; i++) {
      if (input[i] === "/") {
        const suggestion = this.getSuggestionFromPosition(input, i);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  /**
   * Get the best folder suggestion for the given input (returns the last valid one)
   */
  static getFolderSuggestion(input: string): FolderSuggestion | null {
    const suggestions = this.getAllFolderSuggestions(input);
    return suggestions.length > 0 ? suggestions[suggestions.length - 1] : null;
  }

  /**
   * Get suggestion starting from a specific position
   */
  private static getSuggestionFromPosition(
    input: string,
    startPos: number
  ): FolderSuggestion | null {
    try {
      // Extract the path part starting from this position
      let endPos = startPos + 1;
      while (endPos < input.length && input[endPos] !== " ") {
        endPos++;
      }

      const pathPart = input.substring(startPos, endPos);

      // First, check common path shortcuts
      const commonSuggestion = this.getCommonPathSuggestion(
        pathPart,
        startPos,
        endPos
      );
      if (commonSuggestion) {
        return commonSuggestion;
      }

      // Then check for subdirectory suggestions
      const subDirSuggestion = this.getSubDirectorySuggestion(
        pathPart,
        startPos,
        endPos
      );
      if (subDirSuggestion) {
        return subDirSuggestion;
      }

      // Finally, check for directory content suggestions
      const dirContentSuggestion = this.getDirectoryContentSuggestion(
        pathPart,
        startPos,
        endPos
      );
      if (dirContentSuggestion) {
        return dirContentSuggestion;
      }

      return null;
    } catch (error) {
      console.error("Error getting folder suggestion:", error);
      return null;
    }
  }

  /**
   * Get suggestion from common paths
   */
  private static getCommonPathSuggestion(
    pathPart: string,
    startPos: number,
    endPos: number
  ): FolderSuggestion | null {
    const lowerPathPart = pathPart.toLowerCase();

    // Find the first common path that starts with the input
    for (const [shortcut, fullPath] of Object.entries(this.commonPaths)) {
      if (shortcut.startsWith(lowerPathPart) && shortcut !== lowerPathPart) {
        return {
          suggestion: shortcut,
          fullPath: fullPath,
          startIndex: startPos,
          endIndex: endPos,
        };
      }
    }

    return null;
  }

  /**
   * Get subdirectory suggestions for complete common paths
   */
  private static getSubDirectorySuggestion(
    pathPart: string,
    startPos: number,
    endPos: number
  ): FolderSuggestion | null {
    try {
      // Check if pathPart matches a complete common path
      const basePath = this.commonPaths[pathPart.toLowerCase()];
      if (!basePath) return null;

      // Check if the path exists
      if (!fs.existsSync(basePath)) return null;

      // Get the first subdirectory
      const items = fs.readdirSync(basePath);
      for (const item of items) {
        const fullPath = path.join(basePath, item);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            const suggestion = pathPart + "/" + item;
            return {
              suggestion: suggestion,
              fullPath: fullPath,
              startIndex: startPos,
              endIndex: endPos,
            };
          }
        } catch (error) {
          continue; // Skip inaccessible items
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get directory content suggestions for paths that already have subdirectories
   */
  private static getDirectoryContentSuggestion(
    pathPart: string,
    startPos: number,
    endPos: number
  ): FolderSuggestion | null {
    try {
      // Handle paths like "/downloads/fold" where we want to suggest "folder1", "folder2", etc.
      const lastSlashIndex = pathPart.lastIndexOf("/");
      if (lastSlashIndex === -1 || lastSlashIndex === 0) return null;

      const basePath = pathPart.substring(0, lastSlashIndex);
      const searchTerm = pathPart.substring(lastSlashIndex + 1);

      // Check if base path is a common path
      const actualBasePath = this.commonPaths[basePath.toLowerCase()];
      if (!actualBasePath || !searchTerm) return null;

      if (!fs.existsSync(actualBasePath)) return null;

      // Find directories that start with the search term
      const items = fs.readdirSync(actualBasePath);
      for (const item of items) {
        if (
          item.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
          item !== searchTerm
        ) {
          const fullPath = path.join(actualBasePath, item);
          try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
              const suggestion = basePath + "/" + item;
              return {
                suggestion: suggestion,
                fullPath: fullPath,
                startIndex: startPos,
                endIndex: endPos,
              };
            }
          } catch (error) {
            continue; // Skip inaccessible items
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all matching directories for a given path (for showing multiple suggestions)
   */
  static getAllMatchingDirectories(pathPart: string): string[] {
    try {
      if (!fs || !path || !os) return [];

      const lastSlashIndex = pathPart.lastIndexOf("/");
      if (lastSlashIndex === -1) return [];

      let basePath = pathPart.substring(0, lastSlashIndex);
      const searchTerm = pathPart.substring(lastSlashIndex + 1);

      // Handle common paths
      if (basePath === "") basePath = "/";
      const actualBasePath = this.commonPaths[basePath.toLowerCase()];
      if (!actualBasePath) return [];

      if (!fs.existsSync(actualBasePath)) return [];

      const matches: string[] = [];
      const items = fs.readdirSync(actualBasePath);

      for (const item of items) {
        if (item.toLowerCase().startsWith(searchTerm.toLowerCase())) {
          const fullPath = path.join(actualBasePath, item);
          try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
              matches.push(basePath + "/" + item);
            }
          } catch (error) {
            continue; // Skip inaccessible items
          }
        }
      }

      return matches.sort();
    } catch (error) {
      console.error("Error getting matching directories:", error);
      return [];
    }
  }

  /**
   * Apply suggestion to input text
   */
  static applySuggestion(input: string, suggestion: FolderSuggestion): string {
    return (
      input.substring(0, suggestion.startIndex) +
      suggestion.suggestion +
      input.substring(suggestion.endIndex)
    );
  }

  /**
   * Check if Node.js modules are available (running in Electron)
   */
  static isElectronEnvironment(): boolean {
    return !!(fs && path && os);
  }
}
