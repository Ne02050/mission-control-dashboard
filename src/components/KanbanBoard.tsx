'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, GripVertical, Plus } from 'lucide-react';
import type { Task } from '@/lib/types';

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const stages = [
    { id: 'todo', name: 'To Do', color: 'border-mc-border' },
    { id: 'in-progress', name: 'In Progress', color: 'border-mc-accent' },
    { id: 'review', name: 'Review', color: 'border-mc-accent/70' },
    { id: 'done', name: 'Done', color: 'border-mc-accent-green' },
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!draggedTask) return;

    setTasks(tasks.map(task => 
      task.id === draggedTask.id ? { ...task, status: stageId } : task
    ));
    setDraggedTask(null);
  };

  const getStageTasks = (stageId: string) => {
    return tasks.filter(task => task.status === stageId);
  };

  return (
    <div className="min-h-screen bg-mc-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Kanban Board</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-mc-accent text-mc-bg rounded-lg">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map(stage => (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="bg-mc-bg-secondary border-2 border-dashed border-mc-border rounded-xl p-4 min-h-[400px]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${stage.id === 'done' ? 'bg-mc-accent-green' : 'bg-current'}`} />
                <h3 className="font-semibold">{stage.name}</h3>
                <span className="ml-auto px-2 py-1 bg-mc-bg-tertiary rounded-full text-sm">
                  {getStageTasks(stage.id).length}
                </span>
              </div>

              <div className="space-y-3">
                {getStageTasks(stage.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className={`bg-mc-bg border ${stage.color} rounded-lg p-3 cursor-move hover:shadow-lg transition-all ${
                      task.status === 'in-progress' && draggedTask?.id === task.id
                        ? 'ring-2 ring-mc-accent'
                        : ''
                    }`}
                  >
                    <p className="text-sm font-medium mb-2">{task.title}</p>
                    <div className="flex items-center gap-1 text-xs text-mc-text-secondary">
                      {task.assigned_agent && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
