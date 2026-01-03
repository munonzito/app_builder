import { useState, useCallback } from 'react';
import { PlanTask, PlanTaskStatus } from '../models';

interface UsePlanTasksResult {
  planTasks: PlanTask[];
  setPlanTasks: React.Dispatch<React.SetStateAction<PlanTask[]>>;
  updateTaskStatus: (taskId: string, status: PlanTaskStatus) => void;
  clearPlanTasks: () => void;
}

export function usePlanTasks(): UsePlanTasksResult {
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([]);

  const updateTaskStatus = useCallback((taskId: string, status: PlanTaskStatus) => {
    setPlanTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  }, []);

  const clearPlanTasks = useCallback(() => {
    setPlanTasks([]);
  }, []);

  return {
    planTasks,
    setPlanTasks,
    updateTaskStatus,
    clearPlanTasks,
  };
}
