interface Task {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string | null;
}

/**
 * Shuffles tasks to avoid more than 2 consecutive tasks from the same category
 */
export const shuffleTasks = (tasks: Task[]): Task[] => {
  if (tasks.length <= 2) return tasks;

  // Group tasks by category
  const categoryGroups = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Shuffle each category group
  Object.keys(categoryGroups).forEach(category => {
    categoryGroups[category] = categoryGroups[category].sort(() => Math.random() - 0.5);
  });

  const result: Task[] = [];
  const categories = Object.keys(categoryGroups);
  let lastCategory = "";
  let consecutiveCount = 0;

  while (result.length < tasks.length) {
    // Find available categories (not empty and not causing 3 consecutive)
    const availableCategories = categories.filter(cat => {
      if (categoryGroups[cat].length === 0) return false;
      if (cat !== lastCategory) return true;
      return consecutiveCount < 2;
    });

    if (availableCategories.length === 0) {
      // Fallback: take from any non-empty category
      const nonEmpty = categories.find(cat => categoryGroups[cat].length > 0);
      if (!nonEmpty) break;
      availableCategories.push(nonEmpty);
    }

    // Pick a random category from available ones
    const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const task = categoryGroups[selectedCategory].shift()!;
    
    result.push(task);

    if (selectedCategory === lastCategory) {
      consecutiveCount++;
    } else {
      lastCategory = selectedCategory;
      consecutiveCount = 1;
    }
  }

  return result;
};
