import { useEffect, useCallback } from 'react';

/**
 * useKeyboardShortcuts — registers global keyboard shortcuts
 *
 * shortcuts: Array of { keys: string[], handler: fn, description: string }
 *   keys examples: ['ctrl+k'], ['meta+k'], ['Escape'], ['n']
 *
 * Shortcuts are only fired when no text input/textarea/contenteditable is focused,
 * unless the shortcut explicitly includes a modifier key (Ctrl, Meta, Alt).
 */
const useKeyboardShortcuts = (shortcuts = []) => {
  const handleKeyDown = useCallback((e) => {
    const active = document.activeElement;
    const isTyping = active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.tagName === 'SELECT' ||
      active.getAttribute('contenteditable') === 'true'
    );

    for (const { keys, handler } of shortcuts) {
      const combo = keys.join('+').toLowerCase();
      const hasModifier = combo.includes('ctrl') || combo.includes('meta') || combo.includes('alt');

      // If user is typing, only allow shortcuts with modifier keys
      if (isTyping && !hasModifier) continue;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      let matches = false;

      if (combo === 'ctrl+k' || combo === 'meta+k') {
        matches = ctrl && key === 'k';
      } else if (combo === 'ctrl+shift+k') {
        matches = ctrl && shift && key === 'k';
      } else if (combo === 'escape') {
        matches = key === 'escape';
      } else if (combo.startsWith('ctrl+')) {
        matches = ctrl && key === combo.replace('ctrl+', '');
      } else if (combo.startsWith('alt+')) {
        matches = alt && key === combo.replace('alt+', '');
      } else {
        // Single key shortcut — only when not typing
        matches = !isTyping && key === combo && !ctrl && !shift && !alt;
      }

      if (matches) {
        e.preventDefault();
        handler(e);
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
