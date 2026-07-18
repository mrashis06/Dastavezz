import React from 'react';

/**
 * Parses bold (**text**), italic (*text*), and link ([text](url)) modifiers inline.
 */
function parseInlineStyles(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Regular expressions to find bold, italic, and markdown link segments
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|\[(.*?)\]\((.*?)\)/g;
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
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // Link matches ([text](url))
      parts.push(
        <a 
          key={matchIndex} 
          href={match[6]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-600 hover:text-indigo-500 underline"
        >
          {match[5]}
        </a>
      );
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

    // Page Break
    if (trimmedLine === '<!-- pagebreak -->' || trimmedLine === '\\pagebreak' || trimmedLine === '<!-- page-break -->') {
      flushList(index);
      elements.push(<div key={index} className="page-break" />);
      return;
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

/**
 * Parses bold (**text**), italic (*text*), and link ([text](url)) modifiers inline to HTML string.
 */
function parseInlineStylesToHtml(text: string): string {
  let html = text;
  // Replace bold matches (**text**)
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  // Replace italic matches (*text*)
  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  // Replace link matches ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}

/**
 * A lightweight markdown compiler that converts string markdown to pure HTML string for DOCX exports.
 */
export function compileMarkdownToHtml(markdown: string): string {
  if (!markdown) return '<p>No content written yet.</p>';

  const lines = markdown.split('\n');
  let html = '';

  let listItems: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = () => {
    if (listItems.length > 0) {
      html += '<ul style="margin-top: 0; margin-bottom: 8pt; padding-left: 20pt;">';
      listItems.forEach((item) => {
        html += `<li style="margin-bottom: 3pt;">${parseInlineStylesToHtml(item)}</li>`;
      });
      html += '</ul>';
      listItems = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const cleanRows = tableRows.filter(row => !row.every(cell => /^[:-|\s]+$/.test(cell)));

      if (cleanRows.length > 0) {
        const headerRow = cleanRows[0];
        const bodyRows = cleanRows.slice(1);

        html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:14pt;border:1px solid #dddddd;">';
        html += '<thead style="background-color:#f7f7f9;font-weight:bold;"><tr>';
        headerRow.forEach((cell) => {
          html += `<th style="border:1px solid #dddddd;padding:8px 10px;text-align:left;font-size:10pt;">${cell.trim()}</th>`;
        });
        html += '</tr></thead><tbody>';

        bodyRows.forEach((row) => {
          html += '<tr>';
          row.forEach((cell) => {
            html += `<td style="border:1px solid #dddddd;padding:8px 10px;text-align:left;font-size:10pt;">${parseInlineStylesToHtml(cell.trim())}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Check if table row
    const isTableRow = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');

    if (isTableRow) {
      flushList();
      inTable = true;
      const cells = trimmedLine.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable();
    }

    // Page Break
    if (trimmedLine === '<!-- pagebreak -->' || trimmedLine === '\\pagebreak' || trimmedLine === '<!-- page-break -->') {
      flushList();
      html += '<hr style="page-break-before:always;break-before:page;" />';
      return;
    }

    // Horizontal Rule
    if (trimmedLine === '---' || trimmedLine === '***') {
      flushList();
      html += '<hr style="border:0;border-top:1px solid #eeeeee;margin:15pt 0;" />';
      return;
    }

    // Headings
    if (trimmedLine.startsWith('# ')) {
      flushList();
      html += `<h1 style="font-size:22pt;font-weight:bold;color:#111111;margin-top:18pt;margin-bottom:8pt;">${parseInlineStylesToHtml(trimmedLine.substring(2))}</h1>`;
      return;
    }
    if (trimmedLine.startsWith('## ')) {
      flushList();
      html += `<h2 style="font-size:16pt;font-weight:bold;color:#333333;margin-top:14pt;margin-bottom:6pt;border-bottom:1px solid #eeeeee;padding-bottom:3pt;">${parseInlineStylesToHtml(trimmedLine.substring(3))}</h2>`;
      return;
    }
    if (trimmedLine.startsWith('### ')) {
      flushList();
      html += `<h3 style="font-size:13pt;font-weight:bold;color:#444444;margin-top:12pt;margin-bottom:4pt;">${parseInlineStylesToHtml(trimmedLine.substring(4))}</h3>`;
      return;
    }

    // Unordered list items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      listItems.push(trimmedLine.substring(2));
      return;
    }

    // Paragraph breaker / Empty Line
    if (trimmedLine === '') {
      flushList();
      html += '<p style="margin-top:0;margin-bottom:8pt;min-height:12pt;"></p>';
      return;
    }

    // Regular line
    flushList();
    html += `<p style="margin-top:0;margin-bottom:8pt;line-height:1.5;">${parseInlineStylesToHtml(line)}</p>`;
  });

  flushList();
  flushTable();

  return html;
}
