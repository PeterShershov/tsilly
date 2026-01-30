import { useState, useRef, useEffect } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { useEditor } from "~/context/EditorContext";
import type { Layout } from "~/types/editor";

interface LayoutOption {
  value: Layout;
  label: string;
  icon: React.ReactNode;
}

function VerticalIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function StackedIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

const layouts: LayoutOption[] = [
  { value: "vertical", label: "Vertical", icon: <VerticalIcon /> },
  { value: "stacked", label: "Stacked", icon: <StackedIcon /> },
  { value: "sidebar", label: "Sidebar", icon: <SidebarIcon /> },
];

export function LayoutDropdown() {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = (layout: Layout) => {
    dispatch({ type: "SET_LAYOUT", payload: layout });
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 p-1.5 rounded transition-colors ${
          open
            ? "text-white bg-[#0e639c]"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c]"
        }`}
        title="Layout"
      >
        <LayoutGrid size={16} />
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {layouts.map((layout) => (
            <button
              key={layout.value}
              onClick={() => handleSelect(layout.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                state.layout === layout.value
                  ? "bg-[#0e639c] text-white"
                  : "text-gray-300 hover:bg-[#3c3c3c]"
              }`}
            >
              {layout.icon}
              {layout.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
