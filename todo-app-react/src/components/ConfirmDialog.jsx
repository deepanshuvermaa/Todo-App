import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmDialog — accessible replacement for window.confirm()
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null);
 *
 *   // To trigger:
 *   setConfirmState({
 *     message: 'Delete this item?',
 *     detail: 'This cannot be undone.',
 *     confirmLabel: 'Delete',
 *     danger: true,
 *     onConfirm: () => deleteItem(id),
 *   });
 *
 *   // In JSX:
 *   <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
 */
const ConfirmDialog = ({ state, onClose }) => {
  if (!state) return null;

  const { message, detail, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm } = state;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
        >
          <h3
            id="confirm-dialog-title"
            className={`text-lg font-bold mb-1 ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}
          >
            {message}
          </h3>
          {detail && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{detail}</p>
          )}
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={onClose}
              autoFocus
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
