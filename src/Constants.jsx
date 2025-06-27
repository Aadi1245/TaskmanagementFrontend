const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const PRIORITY_COLORS = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
  default: 'border-l-gray-500'
};
const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  inProgress: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800'
};

export {STATUS_COLORS,PRIORITY_COLORS,PRIORITY_ORDER};