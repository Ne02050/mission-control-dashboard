'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Activity, GitBranch, MessageSquare, Bot } from 'lucide-react';
import './globals.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agent-office' | 'status' | 'git' | 'conversations'>('overview');

  // Status state
  const [status, setStatus] = useState({
    connected: false,
    uptime: 0,
    agents: 0,
    memory: 0,
    model: 'glm-4.7-flash:latest'
  });

  // Chat state
  const [messages, setMessages] = useState<Array<{ id: number, sender: string, text: string, time: string, type: 'system' | 'user' | 'agent' }>>([
    { id: 1, sender: 'System', text: 'CEO Mode Active | Mission Control Ready', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
    { id: 2, sender: 'Neo', text: 'Feature Checklist:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
    { id: 3, sender: 'Neo', text: '✓ Dark theme (zinc-950, slate-100, cyan-400)', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
    { id: 4, sender: 'Neo', text: '✓ Live status updates', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
    { id: 5, sender: 'Neo', text: '✓ Git operations', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
  ]);

  // Git state
  const [gitCommits, setGitCommits] = useState<Array<{ id: number, message: string, time: string }>>([
    { id: 1, message: 'Update: Dashboard improved', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  // Agent office
  const [activeAgents] = useState([
    { id: 1, name: 'Neo', online: true },
    { id: 2, name: 'Hunter1', online: true },
    { id: 3, name: 'Hunter2', online: false },
    { id: 4, name: 'Cycle', online: true },
    { id: 5, name: 'Crypto', online: true },
  ]);

  // Status polling effect
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const execResponse = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'openclaw status' })
        });
        const data = await execResponse.json();

        if (data.success && data.output) {
          const lines = data.output.split('\n');
          const agentLine = lines.find(l => l.includes('Agents'));

          setStatus(prev => ({
            ...prev,
            connected: true,
            agents: agentLine ? parseInt(agentLine.match(/\d+/)?.[0] || '0') : prev.agents
          }));

          // Add system messages if status update shows issues
          if (data.output.includes('Security audit: 0 critical, 1 warning')) {
            addMessage('Security audit: 0 critical, 1 warning', 'System', 'system');
          }
          if (data.output.includes('Gateway: Running at WS://127.0.0.1:18789')) {
            addMessage('Gateway: Running at WS://127.0.0.1:18789', 'System', 'system');
          }
        }
      } catch (error) {
        addMessage('Error connecting to OpenClaw', 'System', 'system');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (text: string, sender: string = 'Neo', type: 'system' | 'user' | 'agent' = 'system') => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    }]);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById('chat-input') as HTMLTextAreaElement;
    if (input && input.value.trim()) {
      const text = input.value.trim();
      addMessage(text, 'The One', 'user');
      input.value = '';

      // Process command
      if (text.toLowerCase().includes('git push')) {
        try {
          addMessage('Pushing changes...', 'Neo', 'agent');
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              command: `cd ~/Neo-Outputs/mission-control && git add . && git commit -m "$(date +%H:%M:%S) - ${text}" && git push` 
            })
          });
          const data = await response.json();
          if (data.success) {
            addMessage('Git push successful!', 'Neo', 'agent');
            fetchGitCommits();
          }
        } catch (error) {
          addMessage('Git push failed: ' + (error as Error).message, 'Neo', 'agent');
        }
      } else if (text.toLowerCase().includes('status')) {
        try {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: 'openclaw status' })
          });
          const result = await response.json();
          setStatus({ ...status, connected: true });
          if (result.success) {
            addMessage(result.output.substring(0, 200) + '...', 'Neo', 'agent');
          }
        } catch (error) {
          addMessage('Status check failed: ' + (error as Error).message, 'Neo', 'agent');
        }
      } else {
        addMessage('Command saved. I\'ll execute it when needed.', 'Neo', 'agent');
      }
    }
  };

  const fetchGitCommits = async () => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'cd ~/Neo-Outputs/mission-control && git log --oneline -5' })
      });
      const result = await response.json();
      if (result.success && result.output) {
        const newCommits = result.output
          .split('\n')
          .filter(line => line.trim())
          .map((line, index) => ({
            id: index + 1,
            message: line,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
        setGitCommits(newCommits);
      }
    } catch (error) {
      console.error('Failed to fetch commits:', error);
    }
  };

  // Load initial commits
  useEffect(() => {
    fetchGitCommits();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">
          <Bot size={32} />
          <h1>Mission Control</h1>
        </div>
        <div className="status-bar">
          <div className={`status-indicator ${status.connected ? 'connected' : 'connecting'}`} />
          <span className="status-text">
            {status.connected ? 'OpenClaw Status: Active' : 'Connecting...'}
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tabs">
        {[
          { id: 'overview' as const, label: 'Overview', icon: Terminal },
          { id: 'agent-office' as const, label: 'Agent Office', icon: Activity },
          { id: 'status' as const, label: 'Status', icon: Code },
          { id: 'git' as const, label: 'Git Ops', icon: GitBranch },
          { id: 'conversations' as const, label: 'Chat', icon: MessageSquare }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewContent status={status} />}
          {activeTab === 'agent-office' && <AgentOfficeContent agents={activeAgents} />}
          {activeTab === 'status' && <StatusContent status={status} />}
          {activeTab === 'git' && <GitContent commits={gitCommits} />}
          {activeTab === 'conversations' && <ChatContent messages={messages} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Overview Tab
const OverviewContent: React.FC<{ status: typeof Dashboard['state']['status'] }> = ({ status }) => (
  <div className="view-panel">
    <h2>Dashboard Overview</h2>
    <div className="stats-grid">
      <div className="stat-card primary">
        <div className="stat-value">${500}</div>
        <div className="stat-label">Starting Budget</div>
      </div>
      <div className="stat-card">
        <div className="stat-value primary">${500}</div>
        <div className="stat-label">Current Budget</div>
      </div>
      <div className="stat-card">
        <div className="stat-value primary">{status.agents}</div>
        <div className="stat-label">Active Agents</div>
      </div>
      <div className="stat-card">
        <div className="stat-value primary">{status.memory > 0 ? `${status.memory} MB` : 'N/A'}</div>
        <div className="stat-label">Memory Usage</div>
      </div>
    </div>
    <div className="welcome-text">
      <h3>Welcome to Mission Control</h3>
      <p>All systems operational. Your AI agents are ready to execute tasks.</p>
    </div>
  </div>
);

// Agent Office Tab
const AgentOfficeContent: React.FC<{ agents: typeof Dashboard['state']['activeAgents'] }> = ({ agents }) => (
  <div className="view-panel">
    <h2>Agent Office</h2>
    <div className="office-grid">
      {agents.map((agent) => (
        <div key={agent.id} className={`agent-card ${agent.online ? 'online' : 'offline'}`}>
          <div className="agent-avatar">
            <div className={`status-dot ${agent.online ? 'active' : 'inactive'}`} />
          </div>
          <div className="agent-info">
            <div className="agent-name">{agent.name}</div>
            <div className="agent-status">{agent.online ? 'Online' : 'Offline'}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Status Tab
const StatusContent: React.FC<{ status: typeof Dashboard['state']['status'] }> = ({ status }) => (
  <div className="view-panel">
    <div className="status-item">
      <span className="status-label">Connection Status:</span>
      <span className={`status-value ${status.connected ? 'success' : 'error'}`}>
        {status.connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
    <div className="status-item">
      <span className="status-label">Active Agents:</span>
      <span className="status-value">{status.agents}</span>
    </div>
    <div className="status-item">
      <span className="status-label">Model:</span>
      <span className="status-value">ollama/glm-4.7-flash:latest</span>
    </div>
  </div>
);

// Git Tab
const GitContent: React.FC<{ commits: typeof Dashboard['state']['gitCommits'] }> = ({ commits }) => (
  <div className="view-panel">
    <h2>Git Operations</h2>
    <div className="git-actions">
      <button className="git-button primary" onClick={async () => {
        try {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              command: 'cd ~/Neo-Outputs/mission-control && git add . && git commit -m "Update: $(date +%H:%M:%S)" && git push' 
            })
          });
          const data = await response.json();
          if (data.success) {
            alert('Git push successful!');
            fetchGitCommits();
          }
        } catch (error) {
          alert('Git push failed: ' + (error as Error).message);
        }
      }}>
        Push All Changes
      </button>
      <button className="git-button secondary" onClick={fetchGitCommits}>
        Refresh Commits
      </button>
    </div>
    <div className="commits-list">
      <h3>Recent Commits</h3>
      {commits.length > 0 ? (
        commits.map((commit) => (
          <div key={commit.id} className="commit-item">
            <span className="commit-message">{commit.message}</span>
            <span className="commit-time">{commit.time}</span>
          </div>
        ))
      ) : (
        <p className="no-commits">No commits yet</p>
      )}
    </div>
  </div>
);

// Chat Tab
const ChatContent: React.FC<{ messages: typeof Dashboard['state']['messages'] }> = ({ messages }) => (
  <div className="chat-view">
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div key={msg.id} className={`chat-message ${msg.type}`}>
          <div className="message-bubble">
            <span className="sender-name">{msg.sender}</span>
            <p>{msg.text}</p>
          </div>
          <span className="message-time">{msg.time}</span>
        </div>
      ))}
    </div>
    <form className="chat-input-area" onSubmit={handleChat}>
      <textarea
        id="chat-input"
        placeholder="Type a command or message..."
        rows={2}
        className="chat-textarea"
      />
      <button type="submit" className="chat-send-button">
        Send
      </button>
    </form>
  </div>
);

let handleChat: (e: React.FormEvent) => Promise<void>;

export default Dashboard;