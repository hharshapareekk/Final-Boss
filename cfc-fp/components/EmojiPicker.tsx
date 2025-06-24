'use client';

const EMOJIS = [
  { value: 'excellent', emoji: '😍', label: 'Excellent' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'average', emoji: '😐', label: 'Average' },
  { value: 'poor', emoji: '😞', label: 'Poor' },
  { value: 'terrible', emoji: '😠', label: 'Terrible' }
];

export default function EmojiPicker({ onSelect, selected }: {
  onSelect: (emoji: string) => void;
  selected?: string;
}) {
  return (
    <div className="flex justify-center space-x-4">
      {EMOJIS.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.emoji)}
          className={`text-4xl p-2 rounded-full transition-all ${
            selected === item.emoji 
              ? 'scale-125 bg-blue-100' 
              : 'hover:scale-110 hover:bg-gray-100'
          }`}
          aria-label={item.label}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
}