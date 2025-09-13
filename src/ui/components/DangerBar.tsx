import React from "react";
import { Command } from "../../electron/types/commandGenerator.js";

interface DangerBarProps {
  dangerousCmds: Command[];
  handleDangerCancel: () => void;
  handleDangerProceed: () => void;
}

const DangerBar: React.FC<DangerBarProps> = ({
  dangerousCmds,
  handleDangerCancel,
  handleDangerProceed,
}) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="mx-2 w-full px-2 py-0.5 bg-red-400 text-white text-xs font-medium shadow flex justify-between items-center rounded-xs">
        <div className="flex-1">⚠ Dangerous Command Detected</div>

        <div className="flex gap-1 items-center">
          <button
            className="px-2 py-0.5 rounded text-xs font-semibold hover:bg-gray-200 transition"
            onClick={handleDangerCancel}
          >
            Stop
          </button>

          <button
            className="px-2 py-0.5 rounded text-xs font-semibold hover:bg-red-700 transition"
            onClick={handleDangerProceed}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerBar;
