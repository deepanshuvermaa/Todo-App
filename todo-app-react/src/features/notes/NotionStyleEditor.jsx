import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ContentEditable component that doesn't lose cursor position
const ContentEditable = ({ blockId, content, className, onUpdate, onKeyDown, refCallback, as: Component = 'div' }) => {
  const elementRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = elementRef.current;
    if (el && isFirstRender.current) {
      el.innerText = content;
      isFirstRender.current = false;
    }
  }, []);

  return (
    <Component
      ref={(el) => {
        elementRef.current = el;
        if (refCallback) refCallback(el);
      }}
      contentEditable
      className={className}
      onInput={(e) => onUpdate(e.target.innerText)}
      onKeyDown={onKeyDown}
      suppressContentEditableWarning
    />
  );
};

const NotionStyleEditor = ({ note, onSave, onCancel }) => {
  const [blocks, setBlocks] = useState(note?.blocks || [
    { id: Date.now().toString(), type: 'text', content: '', placeholder: 'Start writing...' }
  ]);
  const [title, setTitle] = useState(note?.title || '');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const contentEditableRefs = useRef({});

  // Note templates
  const templates = [
    {
      id: 'meeting',
      name: 'Meeting Notes',
      icon: '📝',
      blocks: [
        { type: 'heading1', content: 'Meeting Notes' },
        { type: 'heading2', content: 'Date & Attendees' },
        { type: 'text', content: 'Date: ' },
        { type: 'text', content: 'Attendees: ' },
        { type: 'heading2', content: 'Agenda' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Discussion Points' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Action Items' },
        { type: 'todo', content: '', checked: false },
        { type: 'heading2', content: 'Next Steps' },
        { type: 'text', content: '' }
      ]
    },
    {
      id: 'daily',
      name: 'Daily Journal',
      icon: '📅',
      blocks: [
        { type: 'heading1', content: 'Daily Journal' },
        { type: 'text', content: `Date: ${new Date().toLocaleDateString()}` },
        { type: 'heading2', content: 'Today\'s Goals' },
        { type: 'todo', content: '', checked: false },
        { type: 'heading2', content: 'Gratitude' },
        { type: 'bullet', content: 'I am grateful for...' },
        { type: 'heading2', content: 'Reflections' },
        { type: 'text', content: '' },
        { type: 'heading2', content: 'Tomorrow\'s Priorities' },
        { type: 'numbered', content: '' }
      ]
    },
    {
      id: 'project',
      name: 'Project Plan',
      icon: '🚀',
      blocks: [
        { type: 'heading1', content: 'Project Plan' },
        { type: 'heading2', content: 'Project Overview' },
        { type: 'text', content: '' },
        { type: 'heading2', content: 'Goals & Objectives' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Timeline' },
        { type: 'table', content: { headers: ['Milestone', 'Date', 'Status'], rows: [[]] } },
        { type: 'heading2', content: 'Resources Needed' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Success Metrics' },
        { type: 'numbered', content: '' }
      ]
    },
    {
      id: 'brainstorm',
      name: 'Brainstorming',
      icon: '💡',
      blocks: [
        { type: 'heading1', content: 'Brainstorming Session' },
        { type: 'heading2', content: 'Main Topic' },
        { type: 'text', content: '' },
        { type: 'heading2', content: 'Ideas' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Pros & Cons' },
        { type: 'toggle', content: 'Pros', children: [{ type: 'bullet', content: '' }] },
        { type: 'toggle', content: 'Cons', children: [{ type: 'bullet', content: '' }] },
        { type: 'heading2', content: 'Next Actions' },
        { type: 'todo', content: '', checked: false }
      ]
    },
    {
      id: 'cornell',
      name: 'Cornell Notes',
      icon: '📚',
      blocks: [
        { type: 'heading1', content: 'Cornell Notes' },
        { type: 'text', content: `Date: ${new Date().toLocaleDateString()}` },
        { type: 'text', content: 'Topic: ' },
        { type: 'divider' },
        { type: 'heading2', content: 'Key Questions' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Main Notes' },
        { type: 'text', content: '' },
        { type: 'heading2', content: 'Summary' },
        { type: 'callout', content: '', color: 'blue' }
      ]
    }
  ];

  // Block types for slash menu
  const blockTypes = [
    { type: 'text', label: 'Text', icon: 'Aa', shortcut: 'text' },
    { type: 'heading1', label: 'Heading 1', icon: 'H1', shortcut: 'h1' },
    { type: 'heading2', label: 'Heading 2', icon: 'H2', shortcut: 'h2' },
    { type: 'heading3', label: 'Heading 3', icon: 'H3', shortcut: 'h3' },
    { type: 'bullet', label: 'Bullet List', icon: '•', shortcut: 'bullet' },
    { type: 'numbered', label: 'Numbered List', icon: '1.', shortcut: 'number' },
    { type: 'todo', label: 'To-do', icon: '☐', shortcut: 'todo' },
    { type: 'toggle', label: 'Toggle', icon: '▶', shortcut: 'toggle' },
    { type: 'quote', label: 'Quote', icon: '"', shortcut: 'quote' },
    { type: 'callout', label: 'Callout', icon: '💡', shortcut: 'callout' },
    { type: 'divider', label: 'Divider', icon: '—', shortcut: 'divider' },
    { type: 'code', label: 'Code', icon: '</>', shortcut: 'code' },
    { type: 'table', label: 'Table', icon: '⊞', shortcut: 'table' }
  ];

  // Apply template
  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newBlocks = template.blocks.map(block => ({
        ...block,
        id: Date.now().toString() + Math.random()
      }));
      setBlocks(newBlocks);
      setTitle(template.blocks[0]?.content || template.name);
      setSelectedTemplate(templateId);
    }
  };

  // Handle slash command
  const handleSlashCommand = (blockId, value) => {
    const slashIndex = value.lastIndexOf('/');
    if (slashIndex !== -1) {
      const command = value.substring(slashIndex + 1).toLowerCase();
      const matchingTypes = blockTypes.filter(bt =>
        bt.shortcut.toLowerCase().startsWith(command) ||
        bt.label.toLowerCase().startsWith(command)
      );

      if (matchingTypes.length > 0 || command === '') {
        setActiveBlockId(blockId);
        setShowSlashMenu(true);
        // Calculate position
        const blockElement = contentEditableRefs.current[blockId];
        if (blockElement) {
          const rect = blockElement.getBoundingClientRect();
          setSlashMenuPosition({
            x: rect.left,
            y: rect.bottom + 5
          });
        }
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  // Add new block
  const addBlock = (afterId, type = 'text') => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'table'
        ? { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', '']] }
        : '',
      checked: type === 'todo' ? false : undefined,
      children: type === 'toggle' ? [] : undefined
    };

    const index = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);

    // Focus on new block
    setTimeout(() => {
      const newBlockElement = contentEditableRefs.current[newBlock.id];
      if (newBlockElement) {
        newBlockElement.focus();
      }
    }, 0);
  };

  // Delete block
  const deleteBlock = (id) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  // Update block
  const updateBlock = (id, updates) => {
    setBlocks(prevBlocks => prevBlocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // Export note
  const exportNote = (format) => {
    const noteContent = {
      title,
      blocks,
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(noteContent, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${title || 'note'}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'markdown') {
      let markdown = `# ${title}\n\n`;
      blocks.forEach(block => {
        switch (block.type) {
          case 'heading1':
            markdown += `# ${block.content}\n\n`;
            break;
          case 'heading2':
            markdown += `## ${block.content}\n\n`;
            break;
          case 'heading3':
            markdown += `### ${block.content}\n\n`;
            break;
          case 'bullet':
            markdown += `- ${block.content}\n`;
            break;
          case 'numbered':
            markdown += `1. ${block.content}\n`;
            break;
          case 'todo':
            markdown += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
            break;
          case 'quote':
            markdown += `> ${block.content}\n\n`;
            break;
          case 'code':
            markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
            break;
          case 'divider':
            markdown += `---\n\n`;
            break;
          default:
            markdown += `${block.content}\n\n`;
        }
      });

      const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(markdown);
      const exportFileDefaultName = `${title || 'note'}.md`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'html') {
      let html = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    blockquote { border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
    .todo { list-style: none; }
    .todo input { margin-right: 8px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
`;

      blocks.forEach(block => {
        switch (block.type) {
          case 'heading1':
            html += `  <h1>${block.content}</h1>\n`;
            break;
          case 'heading2':
            html += `  <h2>${block.content}</h2>\n`;
            break;
          case 'heading3':
            html += `  <h3>${block.content}</h3>\n`;
            break;
          case 'bullet':
            html += `  <ul><li>${block.content}</li></ul>\n`;
            break;
          case 'numbered':
            html += `  <ol><li>${block.content}</li></ol>\n`;
            break;
          case 'todo':
            html += `  <div class="todo"><input type="checkbox" ${block.checked ? 'checked' : ''}>${block.content}</div>\n`;
            break;
          case 'quote':
            html += `  <blockquote>${block.content}</blockquote>\n`;
            break;
          case 'code':
            html += `  <pre><code>${block.content}</code></pre>\n`;
            break;
          case 'divider':
            html += `  <hr>\n`;
            break;
          default:
            html += `  <p>${block.content}</p>\n`;
        }
      });

      html += `</body>
</html>`;

      const dataUri = 'data:text/html;charset=utf-8,'+ encodeURIComponent(html);
      const exportFileDefaultName = `${title || 'note'}.html`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  // Render block based on type
  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading1':
        return (
          <ContentEditable
            as="h1"
            blockId={block.id}
            content={block.content}
            className="text-3xl font-bold mb-4 outline-none"
            onUpdate={(content) => updateBlock(block.id, { content })}
            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
            refCallback={el => contentEditableRefs.current[block.id] = el}
          />
        );
      case 'heading2':
        return (
          <ContentEditable
            as="h2"
            blockId={block.id}
            content={block.content}
            className="text-2xl font-bold mb-3 outline-none"
            onUpdate={(content) => updateBlock(block.id, { content })}
            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
            refCallback={el => contentEditableRefs.current[block.id] = el}
          />
        );
      case 'heading3':
        return (
          <ContentEditable
            as="h3"
            blockId={block.id}
            content={block.content}
            className="text-xl font-semibold mb-2 outline-none"
            onUpdate={(content) => updateBlock(block.id, { content })}
            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
            refCallback={el => contentEditableRefs.current[block.id] = el}
          />
        );
      case 'bullet':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <ContentEditable
              blockId={block.id}
              content={block.content}
              className="flex-1 outline-none"
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </div>
        );
      case 'numbered':
        const index = blocks.filter((b, i) =>
          b.type === 'numbered' && blocks.indexOf(b) < blocks.indexOf(block)
        ).length + 1;
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1">{index}.</span>
            <ContentEditable
              blockId={block.id}
              content={block.content}
              className="flex-1 outline-none"
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </div>
        );
      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              className="mt-1"
            />
            <ContentEditable
              blockId={block.id}
              content={block.content}
              className={`flex-1 outline-none ${block.checked ? 'line-through text-gray-500' : ''}`}
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </div>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic">
            <ContentEditable
              blockId={block.id}
              content={block.content || 'Quote'}
              className="outline-none"
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </blockquote>
        );
      case 'callout':
        return (
          <div className={`p-4 rounded-lg ${
            block.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500' :
            block.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500' :
            block.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500' :
            'bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500'
          }`}>
            <ContentEditable
              blockId={block.id}
              content={block.content || 'Callout'}
              className="outline-none"
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </div>
        );
      case 'divider':
        return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
      case 'code':
        return (
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <ContentEditable
              as="code"
              blockId={block.id}
              content={block.content || 'Code'}
              className="outline-none font-mono text-sm"
              onUpdate={(content) => updateBlock(block.id, { content })}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
              refCallback={el => contentEditableRefs.current[block.id] = el}
            />
          </pre>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead>
                <tr>
                  {block.content?.headers?.map((header, i) => (
                    <th key={i} className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => {
                          const newHeaders = [...block.content.headers];
                          newHeaders[i] = e.target.value;
                          updateBlock(block.id, { content: { ...block.content, headers: newHeaders } });
                        }}
                        className="bg-transparent outline-none w-full"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content?.rows?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...block.content.rows];
                            newRows[rowIndex][cellIndex] = e.target.value;
                            updateBlock(block.id, { content: { ...block.content, rows: newRows } });
                          }}
                          className="bg-transparent outline-none w-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return (
          <ContentEditable
            blockId={block.id}
            content={block.content}
            className="outline-none min-h-[24px]"
            onUpdate={(content) => {
              updateBlock(block.id, { content });
              handleSlashCommand(block.id, content);
            }}
            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
            refCallback={el => contentEditableRefs.current[block.id] = el}
          />
        );
    }
  };

  // Handle keyboard navigation
  const handleBlockKeyDown = (e, blockId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === 'Backspace' && e.target.innerText === '') {
      e.preventDefault();
      deleteBlock(blockId);
    }
  };

  // Save note
  const handleSave = () => {
    onSave({
      title,
      content: JSON.stringify(blocks), // Store blocks as JSON string
      blocks, // Also store structured blocks
      folder: note?.folder || 'Personal',
      tags: note?.tags || [],
      template: selectedTemplate
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Notion-Style Editor</h2>
          <div className="flex items-center gap-2">
            {/* Template selector */}
            <select
              value={selectedTemplate || ''}
              onChange={(e) => e.target.value && applyTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Select Template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </select>

            {/* Export menu */}
            <div className="relative group">
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                Export
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => exportNote('markdown')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  📝 Markdown
                </button>
                <button
                  onClick={() => exportNote('html')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  🌐 HTML
                </button>
                <button
                  onClick={() => exportNote('json')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  📦 JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-4xl font-bold bg-transparent outline-none placeholder-gray-400"
        />
      </div>

      {/* Editor blocks */}
      <div className="space-y-2 min-h-[400px]">
        {blocks.map(block => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            {/* Block controls */}
            <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => addBlock(block.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Add block below"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {renderBlock(block)}
          </motion.div>
        ))}
      </div>

      {/* Slash menu */}
      <AnimatePresence>
        {showSlashMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed',
              left: slashMenuPosition.x,
              top: slashMenuPosition.y
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 max-w-xs z-50"
          >
            <div className="text-xs text-gray-500 mb-2 px-2">BASIC BLOCKS</div>
            {blockTypes.map(blockType => (
              <button
                key={blockType.type}
                onClick={() => {
                  if (activeBlockId) {
                    // Clear the slash command from content
                    const block = blocks.find(b => b.id === activeBlockId);
                    if (block) {
                      const content = block.content;
                      const slashIndex = content.lastIndexOf('/');
                      if (slashIndex !== -1) {
                        updateBlock(activeBlockId, {
                          content: content.substring(0, slashIndex),
                          type: blockType.type
                        });
                      }
                    }
                  }
                  setShowSlashMenu(false);
                }}
                className="flex items-center gap-3 w-full px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <span className="w-8 text-center text-gray-500">{blockType.icon}</span>
                <div className="text-left">
                  <div className="text-sm">{blockType.label}</div>
                  <div className="text-xs text-gray-500">/{blockType.shortcut}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export default NotionStyleEditor;