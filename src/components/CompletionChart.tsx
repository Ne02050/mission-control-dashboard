'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  created_at: string;
  completed_at?: string;
}

export function TaskCompletionChart() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadTasks();
  }, [timeRange]);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const getChartData = () => {
    const counts = {
      'To Do': 0,
      'In Progress': 0,
      'Review': 0,
      'Done': 0,
    };

    tasks.forEach(task => {
      const status = task.status.charAt(0).toUpperCase() + task.status.slice(1);
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return [
      { name: 'Done', value: counts['Done'], color: '#4ade80' },
      { name: 'In Progress', value: counts['In Progress'], color: '#60a5fa' },
      { name: 'Review', value: counts['Review'], color: '#fbbf24' },
      { name: 'To Do', value: counts['To Do'], color: '#94a3b8' },
    ];
  };

  const calculateEfficiency = () => {
    const completed = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const calculateAvgTime = () => {
    const completedTasks = tasks.filter(t => t.status === 'done' && t.completed_at);
    if (completedTasks.length === 0) return 0;

    const totalHours = completedTasks.reduce((acc, task) => {
      const created = new Date(task.created_at).getTime();
      const completed = new Date(task.completed_at!).getTime();
      return acc + (completed - created) / (1000 * 60 * 60);
    }, 0);

    return Math.round(totalHours / completedTasks.length);
  };

  const chartData = getChartData();

  return (
    <div className="bg-mc-bg-secondary border border-mc-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-mc-accent" />
          <h3 className="font-semibold text-lg">Task Completion</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === 'week' 
                ? 'bg-mc-accent text-mc-bg' 
                : 'bg-mc-bg-tertiary text-mc-text-secondary hover:bg-mc-bg'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === 'month' 
                ? 'bg-mc-accent text-mc-bg' 
                : 'bg-mc-bg-tertiary text-mc-text-secondary hover:bg-mc-bg'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-mc-bg rounded-lg p-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-mc-bg rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-mc-text-secondary mb-1">Task Completion Rate</p>
              <p className="text-2xl font-bold">{calculateEfficiency()}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-mc-accent" />
          </div>

          <div className="bg-mc-bg rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-mc-text-secondary mb-1">Avg. Task Time</p>
              <p className="text-2xl font-bold">{calculateAvgTime()}h</p>
            </div>
            <Clock className="w-8 h-8 text-mc-accent" />
          </div>

          <div className="bg-mc-bg rounded-lg p-4">
            <p className="text-sm text-mc-text-secondary mb-2">Tasks in Pipeline</p>
            <p className="text-2xl font-bold">{tasks.filter(t => t.status !== 'done').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
