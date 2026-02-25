'use client';

import { useState } from 'react';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import type { Task } from '@/lib/types';

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface TaskCommentsProps {
  task: Task;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

export function TaskComments({ task, comments, onAddComment }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="bg-mc-bg-secondary border border-mc-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-mc-accent" />
        <h3 className="font-semibold">Comments</h3>
      </div>

      <div className="space-y-3 mb-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-mc-bg rounded-lg p-3">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-medium">{comment.user}</span>
              <span className="text-xs text-mc-text-secondary">
                {new Date(comment.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">{comment.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="p-2 bg-mc-bg-tertiary rounded-lg hover:bg-mc-bg">
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Add a comment..."
          className="flex-1 bg-mc-bg border border-mc-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-mc-accent"
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="p-2 bg-mc-accent text-mc-bg rounded-lg hover:bg-mc-accent/90 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
