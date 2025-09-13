import {
  useState,
  useTransition,
  useEffect,
  useRef,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { Send, ChevronDown } from "lucide-react";
// Use a more precise type for window.require
interface ElectronWindow extends Window {
  require?: (module: string) => { ipcRenderer: IpcRenderer };
}
interface IpcRenderer {
  on(
    channel: string,
    listener: (event: unknown, ...args: unknown[]) => void
  ): void;
  removeListener(channel: string, listener: (...args: unknown[]) => void): void;
  send(channel: string, ...args: unknown[]): void;
}
const { ipcRenderer }: { ipcRenderer: IpcRenderer | null } = (
  window as ElectronWindow
).require?.("electron") ?? { ipcRenderer: null };
import "./App.css";
import DangerBar from "./components/DangerBar";
import { Command } from "../electron/types/commandGenerator";
import { FolderUtils, FolderSuggestion } from "./../utils/folderSuggest";

const App = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [dangerousCmds, setDangerousCmds] = useState<Command[] | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [currentSuggestion, setCurrentSuggestion] =
    useState<FolderSuggestion | null>(null);
  const [allMatches, setAllMatches] = useState<string[]>([]);
  const [showAllMatches, setShowAllMatches] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ipcRenderer) return;

    // All handlers must match (...args: unknown[]) => void
    const dangerousCommandHandler = (...args: unknown[]): void => {
      // args[0] is usually the event, args[1] is the data
      const data = args[1] as Command[];
      console.log("Dangerous command received:", data);
      setDangerousCmds(data);
    };

    const commandsExecutedHandler = (...args: unknown[]): void => {
      const data = args[1];
      console.log("Commands executed:", data);
    };

    const commandErrorHandler = (...args: unknown[]): void => {
      const error = args[1];
      console.error("Command error:", error);
      setIsExecuting(false);
    };

    const promptCompletedHandler = (..._args: unknown[]): void => {
      console.log("Prompt completed");
      setIsExecuting(false);
    };

    ipcRenderer.on("dangerous-command", dangerousCommandHandler);
    ipcRenderer.on("commands-executed", commandsExecutedHandler);
    ipcRenderer.on("command-error", commandErrorHandler);
    ipcRenderer.on("prompt-completed", promptCompletedHandler);

    return () => {
      ipcRenderer.removeListener("dangerous-command", dangerousCommandHandler);
      ipcRenderer.removeListener("commands-executed", commandsExecutedHandler);
      ipcRenderer.removeListener("command-error", commandErrorHandler);
      ipcRenderer.removeListener("prompt-completed", promptCompletedHandler);
    };
  }, []);

  useEffect(() => {
    if (prompt.includes("/") && FolderUtils.isElectronEnvironment()) {
      const suggestion = FolderUtils.getFolderSuggestion(prompt);
      setCurrentSuggestion(suggestion);

      if (suggestion) {
        const pathPart = prompt.substring(
          suggestion.startIndex,
          suggestion.endIndex
        );
        const matches = FolderUtils.getAllMatchingDirectories(pathPart);
        setAllMatches(matches);
      } else {
        setAllMatches([]);
      }
    } else {
      setCurrentSuggestion(null);
      setAllMatches([]);
      setShowAllMatches(false);
    }
  }, [prompt]);

  const handleSend = () => {
    if (prompt.trim() && ipcRenderer) {
      setIsExecuting(true);
      startTransition(() => {
        ipcRenderer.send("prompt", prompt);
      });
      setPromptHistory((prev) =>
        prompt && prev[prev.length - 1] !== prompt ? [...prev, prompt] : prev
      );
      setHistoryIndex(null);
    }
    setPrompt("");
    setCurrentSuggestion(null);
    setAllMatches([]);
    setShowAllMatches(false);
  };

  const handleDangerCancel = () => {
    setDangerousCmds(null);
    if (ipcRenderer) {
      ipcRenderer.send("dangerous-command-cancel");
    }
  };

  const handleDangerProceed = () => {
    if (ipcRenderer && dangerousCmds) {
      ipcRenderer.send("dangerous-command-proceed", dangerousCmds);
      setDangerousCmds(null);
      setIsExecuting(true);
    }
  };

  const applySuggestion = (suggestionText?: string): void => {
    if (currentSuggestion) {
      const textToApply = suggestionText || currentSuggestion.suggestion;
      const newPrompt =
        prompt.substring(0, currentSuggestion.startIndex) +
        textToApply +
        prompt.substring(currentSuggestion.endIndex);
      setPrompt(newPrompt);
      setCurrentSuggestion(null);
      setShowAllMatches(false);

      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos =
            currentSuggestion.startIndex + textToApply.length;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Tab" && currentSuggestion) {
      e.preventDefault();
      applySuggestion();
      return;
    }

    if (e.key === "ArrowDown" && currentSuggestion && allMatches.length > 1) {
      e.preventDefault();
      setShowAllMatches(true);
      return;
    }

    if (e.key === "Escape" && showAllMatches) {
      e.preventDefault();
      setShowAllMatches(false);
      return;
    }

    if (e.key === "Enter") {
      if (showAllMatches) {
        setShowAllMatches(false);
      } else {
        handleSend();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIndex((prev) => {
        const newIndex =
          prev === null ? promptHistory.length - 1 : Math.max(0, prev - 1);
        if (promptHistory.length > 0 && newIndex >= 0) {
          setPrompt(promptHistory[newIndex]);
          setTimeout(() => {
            inputRef.current?.setSelectionRange(
              promptHistory[newIndex].length,
              promptHistory[newIndex].length
            );
          }, 0);
          return newIndex;
        }
        return prev;
      });
    } else if (e.key === "ArrowDown" && !showAllMatches) {
      e.preventDefault();
      setHistoryIndex((prev) => {
        if (prev === null) return null;
        if (prev >= promptHistory.length - 1) {
          setPrompt("");
          return null;
        }
        const newIndex = prev + 1;
        setPrompt(promptHistory[newIndex]);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(
            promptHistory[newIndex].length,
            promptHistory[newIndex].length
          );
        }, 0);
        return newIndex;
      });
    }
  };

  interface SuggestionDisplay {
    text: string;
    leftOffset: number;
  }
  const getSuggestionDisplay = (): SuggestionDisplay => {
    if (!currentSuggestion || !prompt) return { text: "", leftOffset: 0 };

    const beforeSuggestion = prompt.substring(0, currentSuggestion.endIndex);
    const suggestion = currentSuggestion.suggestion;
    const currentPath = prompt.substring(
      currentSuggestion.startIndex,
      currentSuggestion.endIndex
    );

    if (suggestion.startsWith(currentPath) && suggestion !== currentPath) {
      const remainingText = suggestion.substring(currentPath.length);

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = "16px system-ui, -apple-system, sans-serif";
        const textWidth = context.measureText(beforeSuggestion).width;
        return {
          text: remainingText,
          leftOffset: Math.min(textWidth, 400),
        };
      }

      const charWidth = 8;
      const leftOffset = Math.min(beforeSuggestion.length * charWidth, 400);

      return { text: remainingText, leftOffset };
    }

    return { text: "", leftOffset: 0 };
  };

  const suggestionDisplay = getSuggestionDisplay();

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center relative">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl flex flex-col items-center">
        {dangerousCmds && (
          <DangerBar
            dangerousCmds={dangerousCmds}
            handleDangerProceed={handleDangerProceed}
            handleDangerCancel={handleDangerCancel}
          />
        )}

        <div className="relative w-full">
          {showAllMatches && allMatches.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 max-h-48 overflow-y-auto z-50">
              {allMatches.map((match, index) => (
                <div
                  key={match}
                  className={`px-4 py-2 cursor-pointer transition-all duration-150 hover:bg-blue-50 ${
                    index === 0 ? "rounded-t-xl" : ""
                  } ${index === allMatches.length - 1 ? "rounded-b-xl" : ""}`}
                  onClick={() => applySuggestion(match)}
                >
                  <span className="text-sm text-gray-700 font-medium">
                    {match}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            className={`relative flex items-center w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 p-1.5 border-3 ${
              isExecuting && "border-purple-600/80"
            }`}
          >
            <div className="relative flex-1 overflow-hidden">
              {suggestionDisplay.text && (
                <div
                  className="absolute top-3.5 text-base text-gray-400 pointer-events-none font-medium tracking-tight z-10 overflow-hidden whitespace-nowrap"
                  style={{
                    left: `${20 + suggestionDisplay.leftOffset}px`,
                    maxWidth: `calc(100% - ${
                      20 + suggestionDisplay.leftOffset
                    }px)`,
                    fontFamily: "inherit",
                  }}
                >
                  {suggestionDisplay.text}
                </div>
              )}

              <input
                ref={inputRef}
                className={`bg-transparent text-gray-900 placeholder:text-gray-500 text-base w-full px-5 py-3.5 rounded-xl outline-none border-none font-medium tracking-tight transition-all duration-200 focus:bg-white/20 relative z-20 ${
                  isExecuting ? "opacity-60 cursor-wait" : ""
                }`}
                type="text"
                placeholder={
                  isExecuting
                    ? "Executing..."
                    : FolderUtils.isElectronEnvironment()
                    ? "Ask me anything... (use / for folders)"
                    : "Ask me anything..."
                }
                value={prompt}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPrompt(e.target.value);
                  setHistoryIndex(null);
                  setShowAllMatches(false);
                }}
                onKeyDown={handleKeyDown}
                onInput={(e: ChangeEvent<HTMLInputElement>) => {
                  setCursorPosition(e.target.selectionStart || 0);
                }}
                onSelect={(e: ChangeEvent<HTMLInputElement>) => {
                  setCursorPosition(e.target.selectionStart || 0);
                }}
                autoFocus
                disabled={isExecuting || !!dangerousCmds}
              />
            </div>
            <button
              className="ml-2 p-3 h-12 rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black hover:from-zinc-600 hover:to-zinc-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-zinc-800/40 hover:shadow-black/50 hover:scale-[1.05] active:scale-[0.97] disabled:hover:scale-100"
              onClick={handleSend}
              disabled={!prompt.trim() || isExecuting || !!dangerousCmds}
              aria-label="Send"
            >
              <Send className="w-5 h-5 text-white drop-shadow" />
            </button>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/5 blur-2xl -z-10 transform translate-y-1" />
        </div>
      </div>
    </div>
  );
};

export default App;
