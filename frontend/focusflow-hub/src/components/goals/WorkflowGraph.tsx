import { CheckCircle2, Lock, Play, Circle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskItem {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'ready' | 'blocked' | 'paused' | 'cancelled';
  subtasks?: string[];
  blockedBy?: string;
  unlocks?: string;
  waitingFor?: string[];
  estimated_minutes?: number | null;
  priority?: string | null;
}

interface WorkflowGraphProps {
  tasks: TaskItem[];
  dependencies: { task_id: number; depends_on_task_id: number }[];
  onTaskClick: (taskId: number) => void;
  onAddDependency: (taskId: number) => void;
}

// Layout constants
const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const LAYER_GAP = 280;  // horizontal gap between layers
const NODE_GAP = 40;    // vertical gap between nodes
const PADDING_LEFT = 40;
const PADDING_TOP = 40;

// Simple topological / depth-based layout algorithm
function computeLayout(tasks: TaskItem[], dependencies: { task_id: number; depends_on_task_id: number }[]) {
  const adj = new Map<number, number[]>();
  const inDegree = new Map<number, number>();
  const depths = new Map<number, number>();

  tasks.forEach((t) => {
    adj.set(t.id, []);
    inDegree.set(t.id, 0);
    depths.set(t.id, 0);
  });

  dependencies.forEach((dep) => {
    const from = dep.depends_on_task_id;
    const to = dep.task_id;
    if (adj.has(from) && adj.has(to)) {
      adj.get(from)!.push(to);
      inDegree.set(to, inDegree.get(to)! + 1);
    }
  });

  // Calculate depths using BFS
  const queue: number[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      queue.push(id);
      depths.set(id, 0);
    }
  });

  let visits = 0;
  const maxVisits = tasks.length * 2; // Cycle guard
  while (queue.length > 0 && visits < maxVisits) {
    visits++;
    const curr = queue.shift()!;
    const currDepth = depths.get(curr) || 0;
    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const nextDepth = Math.max(depths.get(neighbor) || 0, currDepth + 1);
      depths.set(neighbor, nextDepth);
      queue.push(neighbor);
    }
  }

  // Group by depth
  const layers = new Map<number, number[]>();
  let maxDepth = 0;
  depths.forEach((depth, id) => {
    if (!layers.has(depth)) {
      layers.set(depth, []);
    }
    layers.get(depth)!.push(id);
    if (depth > maxDepth) maxDepth = depth;
  });

  // Find maximum node count in any layer
  let maxNodesInLayer = 0;
  layers.forEach((nodes) => {
    if (nodes.length > maxNodesInLayer) {
      maxNodesInLayer = nodes.length;
    }
  });

  const totalHeight = Math.max(300, maxNodesInLayer * (NODE_HEIGHT + NODE_GAP) - NODE_GAP + PADDING_TOP * 2);
  const totalWidth = (maxDepth + 1) * LAYER_GAP + PADDING_LEFT * 2;

  const positions = new Map<number, { x: number; y: number }>();

  layers.forEach((nodeIds, layerIndex) => {
    const layerHeight = nodeIds.length * (NODE_HEIGHT + NODE_GAP) - NODE_GAP;
    const startY = (totalHeight - layerHeight) / 2;

    nodeIds.forEach((id, nodeIndex) => {
      const x = PADDING_LEFT + layerIndex * LAYER_GAP;
      const y = startY + nodeIndex * (NODE_HEIGHT + NODE_GAP);
      positions.set(id, { x, y });
    });
  });

  return { positions, totalHeight, totalWidth };
}

export function WorkflowGraph({ tasks, dependencies, onTaskClick, onAddDependency }: WorkflowGraphProps) {
  const { positions, totalHeight, totalWidth } = computeLayout(tasks, dependencies);

  const hasEdges = dependencies.length > 0;

  return (
    <div className="flex flex-col gap-3 font-sans w-full">
      {/* Informative helper label */}
      {!hasEdges && (
        <div className="text-[13px] text-[#9E988E] italic bg-[#FAF9F7] border border-[#E8E6E1] px-4 py-2.5 rounded-lg mb-2">
          💡 Tips: Add dependencies between tasks using the "+" button on each card to build a custom workflow graph.
        </div>
      )}

      {/* Outer wrapper to enable horizontal/vertical scrolling if graph overflows */}
      <div className="w-full overflow-auto border border-[#E8E6E1] bg-[#FCFBF9] rounded-2xl relative shadow-sm">
        <div
          className="relative"
          style={{ width: `${totalWidth}px`, height: `${totalHeight}px`, minWidth: '100%' }}
        >
          {/* SVG layer for connections */}
          <svg
            className="absolute inset-0 pointer-events-none z-0"
            style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#4F46E5" />
              </marker>
              <marker
                id="arrowhead-completed"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#9E988E" />
              </marker>
            </defs>

            {dependencies.map((dep, idx) => {
              const from = positions.get(dep.depends_on_task_id);
              const to = positions.get(dep.task_id);
              if (!from || !to) return null;

              const targetTask = tasks.find((t) => t.id === dep.task_id);
              const sourceTask = tasks.find((t) => t.id === dep.depends_on_task_id);

              const isCompleted = sourceTask?.status === 'completed';
              const isBlocked = targetTask?.status === 'blocked';

              const x1 = from.x + NODE_WIDTH;
              const y1 = from.y + NODE_HEIGHT / 2;
              const x2 = to.x - 6; // slightly before card boundary for clean arrow pointing
              const y2 = to.y + NODE_HEIGHT / 2;

              const controlOffset = Math.min(100, (x2 - x1) / 2);
              const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={`${dep.depends_on_task_id}-${dep.task_id}-${idx}`}
                  d={pathData}
                  fill="none"
                  stroke={isCompleted ? "#9E988E" : "#4F46E5"}
                  strokeWidth={2}
                  strokeDasharray={isBlocked ? "4 4" : undefined}
                  markerEnd={`url(#${isCompleted ? 'arrowhead-completed' : 'arrowhead'})`}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* HTML layer for nodes */}
          {tasks.map((task) => {
            const pos = positions.get(task.id);
            if (!pos) return null;

            const isCompleted = task.status === 'completed';
            const isActive = task.status === 'active';
            const isBlocked = task.status === 'blocked';

            // Left stripe color
            const stripeColor = isCompleted
              ? 'bg-[#059669]'
              : isActive
              ? 'bg-[#4F46E5]'
              : isBlocked
              ? 'bg-[#D97706]'
              : 'bg-[#9E988E]';

            // Border color
            const borderColorClass = isCompleted
              ? 'border-[#059669]/30 hover:border-[#059669]/60'
              : isActive
              ? 'border-[#4F46E5]/40 hover:border-[#4F46E5]/80'
              : isBlocked
              ? 'border-[#D97706]/30 hover:border-[#D97706]/60'
              : 'border-[#E8E6E1] hover:border-[#9E988E]';

            return (
              <div
                key={task.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${NODE_WIDTH}px`,
                  height: `${NODE_HEIGHT}px`,
                }}
                className={cn(
                  "bg-white rounded-xl border overflow-hidden flex transition-all duration-200 shadow-sm cursor-pointer select-none z-10",
                  borderColorClass,
                  isCompleted && "opacity-80 hover:opacity-100",
                  isBlocked && "opacity-75 hover:opacity-100",
                  isActive && "scale-[1.02] shadow-[0_4px_12px_rgba(79,70,229,0.08)]"
                )}
                onClick={() => onTaskClick(task.id)}
              >
                {/* Status Stripe */}
                <div className={cn("w-1.5 shrink-0", stripeColor)} />

                {/* Node Details */}
                <div className="p-3 flex-1 flex flex-col justify-between min-w-0 relative">
                  {/* Small add dependency button */}
                  {!isCompleted && (
                    <button
                      type="button"
                      title="Add dependency"
                      className="absolute right-2 top-2 p-1 rounded-md text-[#9E988E] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-colors z-20"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click / navigate
                        onAddDependency(task.id);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Title */}
                  <h4 className={cn(
                    "text-[13px] font-semibold leading-snug truncate pr-6 font-sans",
                    isCompleted ? "text-[#6B6660] line-through" : "text-[#1A1A1A]"
                  )}>
                    {task.title}
                  </h4>

                  {/* Metadata: Status Icon & Time */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9E988E] font-medium font-sans">
                    {isCompleted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] fill-[#059669] text-white shrink-0" />
                    )}
                    {isActive && (
                      <Play className="w-3.5 h-3.5 text-[#4F46E5] fill-[#4F46E5] text-white shrink-0" />
                    )}
                    {isBlocked && (
                      <Lock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                    )}
                    {!isCompleted && !isActive && !isBlocked && (
                      <Circle className="w-3.5 h-3.5 text-[#9E988E] shrink-0" />
                    )}

                    <span className="capitalize">{task.status}</span>
                    {task.estimated_minutes !== undefined && task.estimated_minutes !== null && (
                      <>
                        <span className="text-[#E8E6E1]">•</span>
                        <span>{task.estimated_minutes} min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
