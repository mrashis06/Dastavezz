import React from 'react';

/**
 * Parses bold (**text**) and italic (*text*) modifiers inline.
 */
function parseInlineStyles(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Regular expressions to find bold and italic segments
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // Add text preceding the match
    if (matchIndex > currentIndex) {
      parts.push(text.substring(currentIndex, matchIndex));
    }
    
    if (match[2] !== undefined) {
      // Bold matches (**text**)
      parts.push(<strong key={matchIndex} className="font-bold text-gray-900">{match[2]}</strong>);
    } else if (match[4] !== undefined) {
      // Italic matches (*text*)
      parts.push(<em key={matchIndex} className="italic text-gray-800">{match[4]}</em>);
    }
    
    currentIndex = regex.lastIndex;
  }
  
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

/**
 * A lightweight markdown compiler that converts string markdown to structured JSX
 */
export function compileMarkdown(markdown: string): React.ReactNode {
  if (!markdown) return <p className="text-gray-400 italic">No content written yet.</p>;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  
  let listItems: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  
  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3.5 space-y-1.5 text-gray-700">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {parseInlineStyles(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      // Filter out divider row if it exists (e.g. | :--- | :--- |)
      const cleanRows = tableRows.filter(row => !row.every(cell => /^[:-|\s]+$/.test(cell)));
      
      if (cleanRows.length > 0) {
        const headerRow = cleanRows[0];
        const bodyRows = cleanRows.slice(1);
        
        elements.push(
          <div key={`table-${key}`} className="my-5 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-4 py-2.5 border-b border-gray-200">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 border-b border-gray-100 font-mono text-[11px]">
                        {parseInlineStyles(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Check if line is a table row (starts and ends with |)
    const isTableRow = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
    
    if (isTableRow) {
      flushList(index);
      inTable = true;
      // Split by | and filter out empty items on ends
      const cells = trimmedLine.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // Horizontal Rule
    if (trimmedLine === '---' || trimmedLine === '***') {
      flushList(index);
      elements.push(<hr key={index} className="my-5 border-t border-gray-300" />);
      return;
    }

    // Headings
    if (trimmedLine.startsWith('# ')) {
      flushList(index);
      elements.push(
        <h1 key={index} className="text-2xl font-bold tracking-tight text-gray-900 mt-6 mb-3 first:mt-0">
          {parseInlineStyles(trimmedLine.substring(2))}
        </h1>
      );
      return;
    }
    if (trimmedLine.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h2 key={index} className="text-lg font-bold tracking-tight text-gray-900 mt-5 mb-2.5 border-b border-gray-100 pb-1">
          {parseInlineStyles(trimmedLine.substring(3))}
        </h2>
      );
      return;
    }
    if (trimmedLine.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h3 key={index} className="text-sm font-semibold tracking-tight text-gray-800 mt-4 mb-2">
          {parseInlineStyles(trimmedLine.substring(4))}
        </h3>
      );
      return;
    }

    // Unordered List Items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      listItems.push(trimmedLine.substring(2));
      return;
    }

    // Empty Lines (Paragraph breakers)
    if (trimmedLine === '') {
      flushList(index);
      elements.push(<div key={index} className="h-3" />);
      return;
    }

    // Default Paragraph line
    flushList(index);
    elements.push(
      <p key={index} className="text-sm leading-relaxed text-gray-700 my-2">
        {parseInlineStyles(line)}
      </p>
    );
  });

  // Flush remaining lists or tables at end
  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}
