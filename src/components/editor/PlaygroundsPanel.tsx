import { useState, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { useEditor } from "~/context/EditorContext";
import {
  getPlaygrounds,
  savePlayground,
  updatePlayground,
  deletePlayground,
  loadPlayground,
  type SavedPlayground,
} from "~/lib/playgrounds";

interface PlaygroundsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function PlaygroundsPanel({ open, onClose }: PlaygroundsPanelProps) {
  const { state, dispatch } = useEditor();
  const [playgrounds, setPlaygrounds] = useState<SavedPlayground[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getPlaygrounds().then(setPlaygrounds);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await savePlayground(newName.trim(), {
      html: state.html,
      css: state.css,
      typescript: state.typescript,
    });
    setPlaygrounds(await getPlaygrounds());
    setNewName("");
    setSaving(false);
  };

  const handleLoad = async (id: string) => {
    const workspace = await loadPlayground(id);
    if (workspace) {
      dispatch({ type: "LOAD_STATE", payload: workspace });
      onClose();
    }
  };

  const handleUpdate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updatePlayground(id, {
      html: state.html,
      css: state.css,
      typescript: state.typescript,
    });
    setPlaygrounds(await getPlaygrounds());
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePlayground(id);
    setPlaygrounds(await getPlaygrounds());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 left-4 z-50 w-72 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl">
        <div className="px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-sm font-semibold text-gray-200">Playgrounds</h2>
        </div>

        <div className="p-3 border-b border-[#3c3c3c]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Playground name..."
              className="flex-1 px-2 py-1.5 text-xs bg-[#1e1e1e] border border-[#3c3c3c] rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#0e639c]"
            />
            <button
              onClick={handleSave}
              disabled={!newName.trim() || saving}
              className="px-3 py-1.5 text-xs font-medium bg-[#0e639c] text-white rounded hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {playgrounds.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-500">
              No saved playgrounds yet
            </div>
          ) : (
            <ul className="py-1">
              {playgrounds.map((pg) => (
                <li
                  key={pg.id}
                  onClick={() => handleLoad(pg.id)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-200 truncate">
                      {pg.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(pg.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleUpdate(pg.id, e)}
                      className="p-1 text-gray-500 hover:text-blue-400"
                      title="Override save"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(pg.id, e)}
                      className="p-1 text-gray-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
