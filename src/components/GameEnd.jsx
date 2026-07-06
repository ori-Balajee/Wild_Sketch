import React from "react";

function GameEnd({ players, onReturnHome }) {
  // Sort players by score in descending order
  const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = rankedPlayers[0];

  return (
    <div className="text-center w-full max-w-md mx-auto flex flex-col items-center p-4">
      {/* Trophy / Winner Podium Card */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 w-full mb-6 shadow-lg animate-pulse duration-1000">
        <span className="text-5xl" role="img" aria-label="crown">👑</span>
        <h2 className="text-2xl font-black text-amber-400 mt-3 tracking-wide uppercase">
          Grand Champion!
        </h2>
        <p className="text-xl font-bold text-white mt-1">
          {winner?.playerName || "Unknown Artist"}
        </p>
        <p className="text-xs text-amber-300/70 font-mono mt-0.5">
          {winner?.score || 0} Total Points
        </p>
      </div>

      {/* Final Rankings Leaderboard List */}
      <div className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 shadow-inner">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
          Final Standings
        </h3>
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {rankedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold border ${
                index === 0
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                  : index === 1
                  ? "bg-slate-800/80 border-slate-600/50 text-slate-200"
                  : "bg-slate-900/40 border-slate-800/40 text-slate-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">#{index + 1}</span>
                {player.playerName}
              </span>
              <span className="font-mono text-emerald-400">{player.score || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReturnHome}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-md uppercase tracking-wider text-sm transition-all transform hover:scale-105"
      >
        Return to Main Menu
      </button>
    </div>
  );
}

export default GameEnd;