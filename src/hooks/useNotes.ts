import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'msword-notes-app';
const ACTIVE_KEY = 'msword-notes-active';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Storage full or unavailable
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const loaded = loadNotes();
    if (loaded.length === 0) {
      const defaultNote: Note = {
        id: generateId(),
        title: 'Welcome',
        content: '# Welcome to Word Notes\n\nStart writing your notes here. This app supports **Markdown** formatting.\n\n## Features\n- Create and delete notes\n- Markdown editing with live preview\n- Instant search\n- Keyboard shortcuts\n- Auto-save to local storage\n\n## Keyboard Shortcuts\n- `Ctrl+N` — New note\n- `Ctrl+S` — Save (auto-saved)\n- `Ctrl+P` — Toggle preview\n- `Ctrl+F` — Focus search\n- `Ctrl+D` — Delete current note\n- `Arrow Up/Down` — Navigate notes\n\nHappy writing!',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return [defaultNote];
    }
    return loaded;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_KEY) || '';
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist notes with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(notes);
    }, 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [notes]);

  // Persist active note
  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const activeNote = notes.find(n => n.id === activeId) || notes[0] || null;

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveId(newNote.id);
    return newNote;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (id === activeId) {
        if (filtered.length > 0) {
          setActiveId(filtered[0].id);
        } else {
          setActiveId('');
        }
      }
      return filtered;
    });
  }, [activeId]);

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const setActiveNote = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return {
    notes,
    activeNote,
    activeId: activeNote?.id || '',
    createNote,
    deleteNote,
    updateNote,
    setActiveNote,
  };
}
