// app/blog/admin/components/TagInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { getAllTagsWithCount, TagSuggestion } from "@/lib/client/tags.client";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<TagSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cargar todos los tags al montar
  useEffect(() => {
    loadAllTags();
  }, []);

  // Manejar clics fuera para cerrar sugerencias
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAllTags = async () => {
    const tags = await getAllTagsWithCount();
    setAllTags(tags);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = allTags.filter((tag) =>
        tag.tag.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions(allTags.slice(0, 8));
      setShowSuggestions(true);
    }
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tags actuales */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-bluegreen-eske text-white rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input con autocompletado */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setSuggestions(allTags.slice(0, 8));
            setShowSuggestions(true);
          }}
          placeholder="Escribe un tag y presiona Enter o coma..."
          className="w-full px-4 py-2 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
        />

        {/* Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white-eske border border-gray-eske-30 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-xs text-gray-600 px-2 py-1 font-semibold">
                Tags sugeridos
              </p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.tag}
                  type="button"
                  onClick={() => addTag(suggestion.tag)}
                  className="w-full text-left px-3 py-2 hover:bg-bluegreen-eske-10 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-800 group-hover:text-bluegreen-eske font-medium">
                    {suggestion.tag}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-eske-20 px-2 py-0.5 rounded-full">
                    {suggestion.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600">
        💡 Tip: Presiona Enter o coma para agregar. Usa tags existentes para mejor
        organización.
      </p>
    </div>
  );
}