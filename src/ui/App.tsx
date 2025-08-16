import { useState, useTransition, useEffect } from "react";
import { Send } from "lucide-react";
// @ts-ignore
const { ipcRenderer } = (window as any).require?.("electron") || {
  ipcRenderer: null,
};
import "./App.css";
import DangerBar from "./componenets/DangerBar";
import { Command } from "../electron/types/commandGenerator";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [_, setExecuting] = useState(false);
  const [dangerousCmds, setDangerousCmds] = useState<null | Command[]>(null);

  useEffect(() => {
    if (!ipcRenderer) return;

    const dangerousCommandHandler = (_: any, data: any[]) => {
      console.log("Dangerous command received:", data);
      setDangerousCmds(data);
      setExecuting(false);
    };

    const commandsExecutedHandler = (_: any, data: any[]) => {
      console.log("Commands executed:", data);
      setExecuting(false);
    };

    const commandErrorHandler = (_: any, error: any) => {
      console.error("Command error:", error);
      setExecuting(false);
    };

    ipcRenderer.on("dangerous-command", dangerousCommandHandler);
    ipcRenderer.on("commands-executed", commandsExecutedHandler);
    ipcRenderer.on("command-error", commandErrorHandler);

    return () => {
      ipcRenderer.removeListener("dangerous-command", dangerousCommandHandler);
      ipcRenderer.removeListener("commands-executed", commandsExecutedHandler);
      ipcRenderer.removeListener("command-error", commandErrorHandler);
    };
  }, []);

  const handleSend = () => {
    if (prompt.trim() && ipcRenderer) {
      setExecuting(true);
      startTransition(() => {
        ipcRenderer.send("prompt", prompt);
      });
    }
    setPrompt("");
  };

  const handleDangerCancel = () => {
    setDangerousCmds(null);
    setExecuting(false);
    if (ipcRenderer) {
      ipcRenderer.send("dangerous-command-cancel");
    }
  };

  const handleDangerProceed = () => {
    if (ipcRenderer && dangerousCmds) {
      ipcRenderer.send("dangerous-command-proceed", dangerousCmds);
      setDangerousCmds(null);
      setExecuting(true);
    }
  };

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
          <div
            className={`relative flex items-center w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 p-1.5 ${
              isPending && "border-2 border-blue-500"
            }`}
          >
            <input
              className={`bg-transparent text-gray-900 placeholder:text-gray-500 text-base flex-1 px-5 py-3.5 rounded-xl outline-none border-none font-medium tracking-tight transition-all duration-200 focus:bg-white/20 ${
                isPending ? "opacity-60 cursor-wait" : ""
              }`}
              type="text"
              placeholder={isPending ? "Executing..." : "Ask me anything..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              autoFocus
              disabled={isPending || !!dangerousCmds}
            />

            <button
              className="ml-2 p-3 h-12 rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-900 to-black hover:from-zinc-600 hover:to-zinc-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-zinc-800/40 hover:shadow-black/50 hover:scale-[1.05] active:scale-[0.97] disabled:hover:scale-100"
              onClick={handleSend}
              disabled={!prompt.trim() || isPending || !!dangerousCmds}
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
}
