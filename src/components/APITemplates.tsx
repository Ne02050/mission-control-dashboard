'use client';

import { useState } from 'react';
import { Code, Copy, Check, Terminal } from 'lucide-react';

interface APITemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

const templates: APITemplate[] = [
  {
    id: 'email-send',
    name: 'Email Send',
    description: 'Send an email with personalization',
    code: `// Email template
const email = {
  to: 'user@example.com',
  subject: 'Welcome to Mission Control',
  body: \`Dear {{user}},\\n\\nWelcome aboard! We're excited to have you.\\n\\nBest regards,\\nNeo2050\`,
  template: true
};`
  },
  {
    id: 'slack-post',
    name: 'Slack Post',
    description: 'Post to Slack channel',
    code: `// Slack template
const slack = {
  channel: '#mission-control',
  text: \`Task #{{task_id}} is now in progress. Assigned to Neo2050.\`,
  attachments: [{
    color: '#36a64f',
    fields: [
      { title: 'Task', value: '{{task_name}}', short: true },
      { title: 'Status', value: 'In Progress', short: true }
    ]
  }]
};`
  },
  {
    id: 'x-post',
    name: 'X/Twitter Post',
    description: 'Create X post template',
    code: `// X/Twitter post template
const xPost = {
  text: \`🦞 Neo2050 Mission Control is live!\\nBuilt with local AI + CEO-CEO assistant framework.\\n\\n#MissionControl #AI \\${{task_count}} tasks tracked. 📊\`,
  platform: 'twitter'
};`
  },
  {
    id: 'api-call',
    name: 'External API Call',
    description: 'API request template with error handling',
    code: `// API call template
const apiCall = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: '{{task_data}}',
        agent: 'Neo2050',
        model: 'ollama/glm-4.7-flash:latest'
      })
    });
    
    if (!response.ok) throw new Error('API call failed');
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};`
  }
];

export function APITemplates() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied('general');
  };

  const handleCopyTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      navigator.clipboard.writeText(template.code);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="bg-mc-bg-secondary border border-mc-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Terminal className="w-5 h-5 text-mc-accent" />
        <h3 className="font-semibold text-lg">API Templates</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div key={template.id} className="bg-mc-bg rounded-lg border border-mc-border p-4 hover:border-mc-accent/50 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-mc-text-secondary">{template.description}</p>
              </div>
              <button
                onClick={() => handleCopyTemplate(template.id)}
                className={`p-2 rounded hover:bg-mc-bg-tertiary transition-colors ${
                  copied === template.id ? 'text-mc-accent' : ''
                }`}
              >
                {copied === template.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="bg-mc-bg-tertiary rounded px-4 py-2 overflow-x-auto">
              <pre className="text-xs text-mc-text-secondary">
                <code>{template.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
