'use client';

import { RefreshCw, GitCommit, Rocket, Trash2, AlertCircle } from 'lucide-react';

export function OneClickActions() {
  const handleRefreshAll = async () => {
    try {
      await fetch('/api/openclaw/status', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const handleGitPush = async () => {
    try {
      await fetch('/api/git/push', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Git push failed:', error);
    }
  };

  const handleStartRevenue = async () => {
    try {
      await fetch('/api/revenue/start', { method: 'POST' });
    } catch (error) {
      console.error('Start revenue failed:', error);
    }
  };

  const handleKillStuck = async () => {
    try {
      await fetch('/api/stuck/kill', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Kill stuck failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-mc-accent mb-4">
        <AlertCircle className="w-5 h-5" />
        <h2 className="text-xl font-bold">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleRefreshAll}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-mc-bg-secondary border border-mc-border rounded-xl hover:border-mc-accent hover:bg-mc-bg-tertiary transition-all group"
        >
          <RefreshCw className="w-6 h-6 text-mc-accent group-hover:animate-spin" />
          <span className="text-sm font-medium text-mc-text">Refresh All</span>
        </button>

        <button
          onClick={handleGitPush}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-mc-bg-secondary border border-mc-border rounded-xl hover:border-mc-accent hover:bg-mc-bg-tertiary transition-all"
        >
          <GitCommit className="w-6 h-6 text-mc-accent" />
          <span className="text-sm font-medium text-mc-text">Git Push</span>
        </button>

        <button
          onClick={handleStartRevenue}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-mc-bg-secondary border-mc-border rounded-xl hover:border-mc-accent hover:bg-mc-bg-tertiary transition-all col-span-2"
        >
          <Rocket className="w-6 h-6 text-mc-accent" />
          <span className="text-sm font-medium text-mc-text">Start Revenue Step</span>
        </button>

        <button
          onClick={handleKillStuck}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-mc-bg-secondary border border-mc-border rounded-xl hover:border-mc-accent hover:bg-mc-bg-tertiary transition-all col-span-2"
        >
          <Trash2 className="w-6 h-6 text-mc-accent-red" />
          <span className="text-sm font-medium text-mc-accent-red">Kill Stuck Run</span>
        </button>
      </div>
    </div>
  );
}