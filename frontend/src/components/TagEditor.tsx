import { useState, useEffect, useRef } from "react";
import type { Tag } from "../types";
import {
  getUserTags,
  createTag,
  attachTag,
  detachTag,
} from "../api/applications";

const TAG_COLORS = [
  "#6D83DD",
  "#806ed3",
  "#A2C4B2",
  "#AFAEC4",
  "#f0a8b0",
  "#f0c980",
];

interface Props {
  applicationId: string;
  attachedTags: Tag[];
  onUpdate: (updated: Tag[]) => void;
}

export default function TagEditor({
  applicationId,
  attachedTags,
  onUpdate,
}: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);

  useEffect(() => {
    getUserTags()
      .then(setAllTags)
      .catch(() => {});
  }, []);

  const attachedIds = new Set(attachedTags.map((t) => t.id));
  const unattached = allTags.filter((t) => !attachedIds.has(t.id));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleAttach(tag: Tag) {
    const updated = await attachTag(applicationId, tag.id);
    onUpdate(updated.tags);
  }

  async function handleDetach(tagId: string) {
    const updated = await detachTag(applicationId, tagId);
    onUpdate(updated.tags);
  }

  async function handleCreate() {
    const name = tagInput.trim().replace(/^#/, "");
    if (!name) return;
    const tag = await createTag(name, tagColor);
    setAllTags((prev) => [...prev, tag]);
    const updated = await attachTag(applicationId, tag.id);
    onUpdate(updated.tags);
    setTagInput("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Attached tags */}
      <div className="flex flex-wrap gap-1.5">
        {attachedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              backgroundColor: tag.color + "22",
              color: tag.color,
              border: `1px solid ${tag.color}55`,
            }}
          >
            #{tag.name}
            <button
              onClick={() => handleDetach(tag.id)}
              className="hover:opacity-60 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-2.5 py-1 rounded-full border border-dashed border-shadow text-foreground/40 hover:border-primary hover:text-primary transition-colors"
        >
          + tag
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 top-full left-0 mt-1 w-56 bg-white border border-shadow rounded-xl shadow-lg p-3">
          {/* Unattached existing tags */}
          {unattached.map((tag) => (
            <button
              key={tag.id}
              onClick={() => {
                handleAttach(tag);
                setOpen(false);
              }}
              className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-background transition-colors flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              #{tag.name}
            </button>
          ))}

          {/* Create new */}
          <div
            className={`${unattached.length > 0 ? "border-t border-shadow mt-2 pt-2" : ""}`}
          >
            <p className="text-xs text-foreground/40 mb-1.5">Create new tag</p>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="Tag name"
              className="w-full text-xs bg-background border border-shadow rounded-lg px-2 py-1.5 mb-2 focus:outline-none"
            />
            <div className="flex gap-1 mb-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setTagColor(c)}
                  className="w-4 h-4 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: tagColor === c ? c : "transparent",
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              className="w-full text-xs secondary-button py-1.5"
            >
              Create & attach
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
