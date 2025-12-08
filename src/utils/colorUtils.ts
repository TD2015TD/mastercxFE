/**
 * Utility functions for mapping lookup colors to Tailwind CSS classes
 */

/**
 * Map a color name from lookup to Tailwind CSS badge classes
 * @param color - Color name from lookup (e.g., 'red', 'blue', 'green')
 * @returns Tailwind CSS classes for badge styling
 */
export const getColorClasses = (color?: string | null): string => {
  if (!color) return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
  
  const colorMap: Record<string, string> = {
    red: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    pink: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400',
    gray: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
    indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
    teal: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
    cyan: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    lime: 'text-lime-600 bg-lime-100 dark:bg-lime-900/30 dark:text-lime-400',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
    violet: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400',
    fuchsia: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    slate: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400',
  };
  
  return colorMap[color.toLowerCase()] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
};

/**
 * Map a color name to text color only (for icons, text, etc.)
 * @param color - Color name from lookup
 * @returns Tailwind CSS text color classes
 */
export const getTextColorClass = (color?: string | null): string => {
  if (!color) return 'text-gray-600 dark:text-gray-400';
  
  const colorMap: Record<string, string> = {
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    gray: 'text-gray-600 dark:text-gray-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    teal: 'text-teal-600 dark:text-teal-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    lime: 'text-lime-600 dark:text-lime-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    violet: 'text-violet-600 dark:text-violet-400',
    fuchsia: 'text-fuchsia-600 dark:text-fuchsia-400',
    slate: 'text-slate-600 dark:text-slate-400',
  };
  
  return colorMap[color.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
};

/**
 * Map a color name to background color only
 * @param color - Color name from lookup
 * @returns Tailwind CSS background color classes
 */
export const getBgColorClass = (color?: string | null): string => {
  if (!color) return 'bg-gray-100 dark:bg-gray-900/30';
  
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
    gray: 'bg-gray-100 dark:bg-gray-900/30',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
    teal: 'bg-teal-100 dark:bg-teal-900/30',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    lime: 'bg-lime-100 dark:bg-lime-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    rose: 'bg-rose-100 dark:bg-rose-900/30',
    violet: 'bg-violet-100 dark:bg-violet-900/30',
    fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
    slate: 'bg-slate-100 dark:bg-slate-900/30',
  };
  
  return colorMap[color.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/30';
};

/**
 * Get border color class
 * @param color - Color name from lookup
 * @returns Tailwind CSS border color classes
 */
export const getBorderColorClass = (color?: string | null): string => {
  if (!color) return 'border-gray-200 dark:border-gray-700';
  
  const colorMap: Record<string, string> = {
    red: 'border-red-200 dark:border-red-800',
    orange: 'border-orange-200 dark:border-orange-800',
    yellow: 'border-yellow-200 dark:border-yellow-800',
    green: 'border-green-200 dark:border-green-800',
    blue: 'border-blue-200 dark:border-blue-800',
    purple: 'border-purple-200 dark:border-purple-800',
    pink: 'border-pink-200 dark:border-pink-800',
    gray: 'border-gray-200 dark:border-gray-700',
    indigo: 'border-indigo-200 dark:border-indigo-800',
    teal: 'border-teal-200 dark:border-teal-800',
    cyan: 'border-cyan-200 dark:border-cyan-800',
    emerald: 'border-emerald-200 dark:border-emerald-800',
    lime: 'border-lime-200 dark:border-lime-800',
    amber: 'border-amber-200 dark:border-amber-800',
    rose: 'border-rose-200 dark:border-rose-800',
    violet: 'border-violet-200 dark:border-violet-800',
    fuchsia: 'border-fuchsia-200 dark:border-fuchsia-800',
    slate: 'border-slate-200 dark:border-slate-700',
  };
  
  return colorMap[color.toLowerCase()] || 'border-gray-200 dark:border-gray-700';
};
