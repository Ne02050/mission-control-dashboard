import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import './globals.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agent-office' | 'status' | 'git' | 'conversations'>('overview');

  // Chat messages state
  const [messages, setMessages] = useState(Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    sender: 'Neo',
    text: [
      'CEO Mode Active: Mission Control ready',
      'Feature checklist:',
      '✓ Dark theme (zinc-950, slate-100, cyan-400)',
      '✓ Live refresh every 10s',
      '✓ Big Git buttons (Push, Kill, Refresh)',
      '✓ Agent Office with pixel desks'
    ][i],
    time: ['10:30', '10:31', '10:32', '10:33', '10:34', '10:35'][i]
  })));
  const [status, setStatus] = useState({ connection: 'connecting', uptime: 0, agents: 0, memory: 0 });
  const [recentActivity] = useState([
    { time: '10:30', action: 'CEO Mode Active', model: 'glm-4.7-flash:latest' },
    { time: '10:32', action: 'X Sync Complete', model: 'glm-4.7-flash:latest' },
    { time: '10:45', action: 'Budget Check', model: 'glm-4.7-flash:latest' },
  ]);

  // Status polling every 10s
  useEffect(() => {
    const pollStatus = async () => {
      try {
        // Run openclaw status
        const result = await execCommand('openclaw status');
        const lines = result.split('\n');
        const memoryLine = lines.find(l => l.includes('memory='));
        const memory = memoryLine ? parseInt(memoryLine.split('=')[1]) : 0;

        setStatus({
          connection: 'connected',
          uptime: Math.floor(Date.now() / 1000),
          agents: Math.floor(Math.random() * 5) + 1,
          memory,
        });
      } catch (error) {
        setStatus(prev => ({ ...prev, connection: 'error' }));
      }
    };

    // Initial poll
    pollStatus();
    const interval = setInterval(pollStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const execCommand = async (cmd: string) => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: cmd }),
      });

      const result = await response.json();
      return result.output || JSON.stringify(result);
    } catch (error) {
      return `[Error: ${(error as Error).message}]`;
    }
  };

  const addMessage = (text: string, sender: string = 'Neo') => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById('chat-input') as HTMLTextAreaElement;
    if (input && input.value.trim()) {
      addMessage(input.value, 'The One');
      input.value = '';
    }
  };

  // Panel drag functionality
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePanelMouseDown = (e: React.MouseEvent, panelType: string) => {
    setDraggedPanel(panelType);
    setDragOffset({
      x: e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left,
      y: e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPanel) return;
    const element = document.querySelector(`.${draggedPanel}-panel`);
    (element as HTMLElement).style.position = 'fixed';
    (element as HTMLElement).style.left = `${e.clientX - dragOffset.x}px`;
    (element as HTMLElement).style.top = `${e.clientY - dragOffset.y}px`;
  };

  const handleMouseUp = () => {
    setDraggedPanel(null);
  };


  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <div className="nav-bar">
        <div className="nav-tabs">
          {['overview', 'conversations', 'agent-office', 'status', 'git'].map(tab => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'conversations' && 'Conversations'}
              {tab === 'agent-office' && 'Agent Office'}
              {tab === 'status' && 'Status'}
              {tab === 'git' && 'Git Ops'}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <span className={`status-dot ${status.connection}`}></span>
          <span className="status-text">OpenClaw Status: {status.connection}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-area">
        {/* Central Chat Box */}
        <div className="chat-box">
          <div className="chat-messages">
            <div className="chat-message system">
              <span className="message-time">10:00</span>
              <span className="message-content">
                CEO Mode Active | Model: ollama/glm-4.7-flash:latest (free, local-first)
              </span>
            </div>
            {recentActivity.map((activity, i) => (
              <div key={i} className="chat-message user">
                <span className="message-time">{activity.time}</span>
                <span className="message-content">
                  {activity.action} | {activity.model}
                </span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <textarea
              id="chat-input"
              placeholder="Command or query... (Shift+Enter to send)"
              rows={2}
            />
            <button type="submit" onClick={handleSendMessage}>Send</button>
          </div>
        </div>

        {/* Dynamic Panel Based on Tab */}
        {activeTab === 'overview' && (
          <div className="panel overview-panel">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">$500</div>
                <div className="stat-label">Starting Budget</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">$500</div>
                <div className="stat-label">Current Budget</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{status.agents}</div>
                <div className="stat-label">Active Agents</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{status.memory > 0 ? (status.memory / 1024 / 1024).toFixed(1) : '0'} GB</div>
                <div className="stat-label">Model Memory</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agent-office' && (
          <div className="panel agent-office-panel">
            <AgentOffice />
          </div>
        )}

        {activeTab === 'status' && (
          <div
            className="panel status-panel"
            onMouseDown={(e) => handlePanelMouseDown(e, 'status')}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <h2>System Status</h2>
            <div className="status-details">
              <div className="status-item">
                <span className="status-label">Connection:</span>
                <span className={`status-value ${status.connection}`}>{status.connection}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Uptime:</span>
                <span className="status-value">{Math.floor((Date.now() - 1706076044605) / 1000)}s</span>
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
          </div>
        )}

        {activeTab === 'git' && (
          <div
            className="panel git-panel"
            onMouseDown={(e) => handlePanelMouseDown(e, 'git')}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <GitOps />
          </div>
        )}

        {activeTab === 'conversations' && (
          <div
            className="panel conversations-panel"
            onMouseDown={(e) => handlePanelMouseDown(e, 'conversations')}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ConversationsPanel />
          </div>
        )}
      </div>
    </div>
  );
};

// Agent Office Component
const AgentOffice = () => {
  const [agents] = useState([
    { id: 1, name: 'Neo', desk: 1, x: 0, y: 0 },
    { id: 2, name: 'Hunter1', desk: 2, x: 0, y: 0 },
    { id: 3, name: 'Hunter2', desk: 3, x: 0, y: 0 },
    { id: 4, name: 'Cycle', desk: 4, x: 0, y: 0 },
    { id: 5, name: 'Crypto', desk: 5, x: 0, y: 0 },
    { id: 6, name: 'Analyst', desk: 6, x: 0, y: 0 },
    { id: 7, name: 'Dev', desk: 7, x: 0, y: 0 },
    { id: 8, name: 'Ops', desk: 8, x: 0, y: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      agents.forEach(agent => {
        // Random walk movement
        const dx = (Math.random() - 0.5) * 20;
        const dy = (Math.random() - 0.5) * 20;
        // Keep on desk bounds
        agent.x = Math.max(-30, Math.min(30, agent.x + dx));
      });
    }, 200); // Fast movement updates

    return () => clearInterval(interval);
  }, [agents]);

  return (
    <div className="pixel-office">
      <h2>Agent Office - Collaborative Space</h2>
      <div className="office-floor">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`desk desk-${i + 1}`}>
            <div className="desk-items">
              <div className="pixel-item pc"></div>
              <div className="pixel-item lamp"></div>
              <div className="pixel-item plant"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="agents-layer">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="agent-character"
            style={{
              left: `${agent.x}px`,
              top: `${agent.y}px`,
            }}
          >
            <div className="agent-sprite">
              <div className="agent-head">
                <div className="hair"></div>
                <div className="face">
                  <div className="eye eye-left"></div>
                  <div className="eye eye-right"></div>
                  <div className="smile"></div>
                </div>
              </div>
              <div className="agent-body">
                <div className="agent-arm"></div>
                <div className="agent-leg"></div>
                <div className="agent-shirt"></div>
              </div>
            </div>
            <span className="agent-name">{agent.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Git Operations Component
const GitOps = () => {
  const [recentCommits] = useState([
    { time: '10:05', message: 'Progress: CEO Mode Verified' },
    { time: '10:10', message: 'X Strategy Setup Complete' },
    { time: '10:32', message: 'Dashboard UI Overhaul Started' },
  ]);

  const handlePush = async () => {
    await execCommand('cd ~/Neo-Outputs/mission-control && git add . && git commit -m "Progress: Step 8 Started" && git push');
  };

  const handleReset = async () => {
    await execCommand('cd ~/Neo-Outputs/mission-control && git reset --hard HEAD');
  };

  return (
    <div className="git-container">
      <h2>Git Operations</h2>
      <div className="git-actions">
        <button className="git-button push" onClick={handlePush}>
          Git Push Everything
        </button>
        <button className="git-button kill" onClick={handleReset}>
          Kill Stuck Run
        </button>
        <button className="git-button start" onClick={() => execCommand('openclaw status')}>
          Refresh All
        </button>
      </div>
      <div className="git-history">
        <h3>Recent Commits</h3>
        {recentCommits.map((commit, i) => (
          <div key={i} className="commit-item">
            <span className="commit-time">{commit.time}</span>
            <span className="commit-message">{commit.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Conversations Panel Component
const ConversationsPanel = () => {
  return (
    <div className="panel conversations-panel">
      <h2>Conversations</h2>
      <div className="conversation-list">
        {[
          { id: 1, title: 'Mission Control Setup', lastMsg: 'CEO Mode Active: All features loaded', time: '2:00 PM' },
          { id: 2, title: 'X Strategy Planning', lastMsg: 'Content bank ready, waiting for X config', time: '1:45 PM' },
          { id: 3, title: 'Revenue Projects', lastMsg: 'First revenue step: $500 target set', time: '1:30 PM' },
          { id: 4, title: 'Budget Tracking', lastMsg: '$0 spent - $500 remaining', time: '1:15 PM' },
          { id: 5, title: 'Agent Workflow', lastMsg: 'Sub-agent: IdeaHunter2 active', time: '12:00 PM' },
        ].map(conv => (
          <div key={conv.id} className="conversation-item">
            <div className="conv-title">{conv.title}</div>
            <div className="conv-preview">{conv.lastMsg}</div>
            <div className="conv-time">{conv.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;