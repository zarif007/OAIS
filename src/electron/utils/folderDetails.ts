import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function getTopmostFolder() {
  try {
    // Simplified AppleScript with proper structure for osascript
    const theCmd = `
    osascript -e 'tell application "Finder"
        if (count of Finder windows) > 0 then
            try
                set currentFolder to target of front Finder window
                return POSIX path of (currentFolder as alias)
            on error
                try
                    set currentFolder to folder of front Finder window
                    return POSIX path of (currentFolder as alias)
                on error
                    return POSIX path of (path to desktop folder)
                end try
            end try
        else
            return POSIX path of (path to desktop folder)
        end if
    end tell'`;

    const { stdout, stderr } = await execPromise(theCmd);
    if (stderr) {
      return null;
    }
    const folderPath = stdout.trim();
    return folderPath;
  } catch (err) {
    return null;
  }
}
