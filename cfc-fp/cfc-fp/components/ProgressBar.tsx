'use client';

export default function ProgressBar({ current, total }: {
  current: number;
  total: number;
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div 
        className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      >
        <span className="sr-only">
          {percentage}% complete
        </span>
      </div>
      <div className="text-right text-sm text-gray-500 mt-1">
        Question {current} of {total}
      </div>
    </div>
  );
}