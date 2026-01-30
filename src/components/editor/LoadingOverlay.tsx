import { Logo } from "./Logo";

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#e759d2] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-[#e759d2] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-[#e759d2] rounded-full animate-bounce" />
        </div>
        <p className="text-sm text-gray-500">Loading editors...</p>
      </div>
    </div>
  );
}
