interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
      <p className="text-sm">{error}</p>
    </div>
  );
} 