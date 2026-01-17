"use client";

import { cn } from "@/lib/utils";

interface CodeFormProps {
  title: string;
  content: string;
  description: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onDescriptionChange: (description: string) => void;
  className?: string;
}

export function CodeForm({
  title,
  content,
  description,
  onTitleChange,
  onContentChange,
  onDescriptionChange,
  className,
}: CodeFormProps) {
  const characterCount = content.length;
  const maxCharacters = 20000;

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Add Code Snippet Evidence
        </h3>
        <p className="text-sm text-stone-500">
          Share actual code you wrote to demonstrate your technical skills.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., React Custom Hook - useDebounce"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
          maxLength={150}
        />
      </div>

      {/* Code Editor */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Code <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={`// Paste your code here
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}`}
          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm font-mono bg-stone-50 resize-none"
          rows={12}
          maxLength={maxCharacters}
          style={{ tabSize: 2 }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-stone-500">
            Paste your code snippet above
          </p>
          <span
            className={cn(
              "text-xs font-mono",
              characterCount > maxCharacters * 0.9
                ? "text-amber-600"
                : "text-stone-400"
            )}
          >
            {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Description <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Explain what this code does and why it demonstrates your skills..."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Include well-commented, clean code that
          showcases best practices. Functions, hooks, algorithms, and API
          implementations work great.
        </p>
      </div>
    </div>
  );
}

export default CodeForm;
