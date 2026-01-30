import type { ReactNode } from "react";

interface EditorPaneProps {
  title: string;
  children: ReactNode;
}

export function EditorPane({ title, children }: EditorPaneProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="shrink-0 px-3 py-1 text-xs font-medium text-gray-400 bg-[#252526] border-b border-[#3c3c3c]">
        {title}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
