'use client';

import React, { useState } from 'react';
import { Eye, Maximize2, Minimize2 } from 'lucide-react';
import { ExportSettings } from '../../types';
import { compileMarkdown } from '../../utils/markdown';

interface LivePreviewProps {
  content: string;
  title: string;
  settings: ExportSettings;
  onSettingsChange?: (newSettings: ExportSettings) => void;
}

export default function LivePreview({
  content,
  title,
  settings,
  onSettingsChange
}: LivePreviewProps) {
  const [zoom, setZoom] = useState(85);
  const [zoomInput, setZoomInput] = useState('85');
  const [isZoomFocused, setIsZoomFocused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set default zoom on mobile to fit screen width
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Mobile/Tablet screen width
        const screenWidth = window.innerWidth;
        const padding = 32; // padding space
        const sheetWidth = 794; // A4 default width
        const fitZoom = Math.floor(((screenWidth - padding) / sheetWidth) * 100);
        const clampedZoom = Math.max(35, Math.min(100, fitZoom));
        setZoom(clampedZoom);
        setZoomInput(clampedZoom.toString());
      } else {
        // Desktop default zoom
        setZoom(85);
        setZoomInput('85');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for Escape key to exit fullscreen mode
  React.useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleZoomOut = () => {
    const nextZoom = Math.max(25, zoom - 25);
    setZoom(nextZoom);
    setZoomInput(nextZoom.toString());
  };

  const handleZoomIn = () => {
    const nextZoom = Math.min(200, zoom + 25);
    setZoom(nextZoom);
    setZoomInput(nextZoom.toString());
  };

  const handleZoomInputSubmit = () => {
    let cleanVal = parseInt(zoomInput.replace(/[^0-9]/g, ''), 10);
    if (isNaN(cleanVal)) {
      cleanVal = 100;
    }
    const clamped = Math.max(25, Math.min(200, cleanVal));
    setZoom(clamped);
    setZoomInput(clamped.toString());
  };

  // Map margins to responsive padding
  const getMarginClass = (margins: ExportSettings['margins']) => {
    if (margins === 'custom') return '';
    switch (margins) {
      case 'narrow':
        return 'p-4 sm:p-8';
      case 'wide':
        return 'p-6 sm:p-16';
      case 'standard':
      default:
        return 'p-5 sm:p-12';
    }
  };

  // Inline custom margin style mapper
  const getMarginStyle = (margins: ExportSettings['margins'], customMargins: ExportSettings['customMargins']) => {
    if (margins === 'custom') {
      const fallbackMargins = customMargins || { top: 20, right: 20, bottom: 20, left: 20 };
      return {
        paddingTop: `${fallbackMargins.top}mm`,
        paddingRight: `${fallbackMargins.right}mm`,
        paddingBottom: `${fallbackMargins.bottom}mm`,
        paddingLeft: `${fallbackMargins.left}mm`
      };
    }
    return {};
  };

  // Map font settings to css configurations
  const getThemeClass = (theme: ExportSettings['theme']) => {
    switch (theme) {
      case 'minimal':
        return 'doc-theme-minimal font-mono tracking-tight text-gray-800';
      case 'academic':
        return 'doc-theme-academic font-serif leading-relaxed text-gray-900';
      case 'professional':
      default:
        return 'doc-theme-professional font-sans tracking-wide text-gray-850';
    }
  };

  // Map font sizing parameters
  const getFontSizeClass = (fontSize: ExportSettings['fontSize']) => {
    switch (fontSize) {
      case 'sm':
        return 'text-[11px] prose-sm';
      case 'lg':
        return 'text-[14px] sm:text-[15px] prose-lg';
      case 'base':
      default:
        return 'text-[12px] sm:text-[13px] prose-base';
    }
  };

  // Calculate paper minHeight and width based on size standard formats
  const getPaperDimensions = (pageSize: ExportSettings['pageSize'], orientation: ExportSettings['orientation']) => {
    let width = 794;
    let height = 1123;

    switch (pageSize) {
      case 'Letter':
        width = 816;
        height = 1056;
        break;
      case 'Legal':
        width = 816;
        height = 1344;
        break;
      case 'A3':
        width = 1123;
        height = 1587;
        break;
      case 'A5':
        width = 559;
        height = 794;
        break;
      case 'B5':
        width = 665;
        height = 941;
        break;
      case 'A4':
      default:
        width = 794;
        height = 1123;
        break;
    }

    if (orientation === 'landscape') {
      return {
        width: `${height}px`,
        minHeight: `${width}px`,
      };
    } else {
      return {
        width: `${width}px`,
        minHeight: `${height}px`,
      };
    }
  };

  const paperStyles = getPaperDimensions(settings.pageSize, settings.orientation);
  const marginStyles = getMarginStyle(settings.margins, settings.customMargins);

  return (
    <div className={`flex flex-col bg-white dark:bg-[#18181d] lg:border lg:border-slate-200 lg:dark:border-white/[0.07] lg:rounded-[18px] overflow-hidden lg:shadow-sm dark:shadow-black/30 transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 rounded-none border-0 w-screen h-screen' 
        : 'h-full'
    }`}>
      {/* Live Preview Panel Header & Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#18181d] px-3 sm:px-3.5 py-2.5 shrink-0 sticky top-0 z-10 w-full overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <Eye className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 select-none whitespace-nowrap">
            LIVE PREVIEW
          </span>
        </div>
        
        {/* Quick layout status badges & Zoom controls */}
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-bold flex-nowrap shrink-0">
          {/* Theme selector */}
          <div className="relative flex items-center shrink-0">
            <span className="absolute left-2 pointer-events-none text-indigo-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.18.03.35-.06.38-.24l.58-3.5c.03-.18-.06-.35-.24-.38A6.99 6.99 0 0 1 4 12c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.94-.78 3.69-2.05 4.95a.25.25 0 0 0 .17.43c2.72 0 4.88-2.16 4.88-4.88A10 10 0 0 0 12 2Z"></path><path d="m14 10-6 6"></path></svg>
            </span>
            <select
              value={settings.theme}
              onChange={(e) => {
                if (onSettingsChange) {
                  onSettingsChange({
                    ...settings,
                    theme: e.target.value as ExportSettings['theme']
                  });
                }
              }}
              className="w-[135px] sm:w-[146px] bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.07] text-[10px] sm:text-[11px] font-bold rounded-full pl-6 sm:pl-7 pr-5 py-1 select-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-[28px] capitalize text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_6px_center] bg-no-repeat"
            >
              <option value="professional">Professional Theme</option>
              <option value="minimal">Minimal Theme</option>
              <option value="academic">Academic Theme</option>
            </select>
          </div>

          {/* Page size select */}
          <select
            value={settings.pageSize}
            onChange={(e) => {
              if (onSettingsChange) {
                onSettingsChange({
                  ...settings,
                  pageSize: e.target.value as ExportSettings['pageSize']
                });
              }
            }}
            className="w-[52px] sm:w-[58px] bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.07] text-[10px] sm:text-[11px] font-bold rounded-lg py-1 select-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-[28px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_6px_center] bg-no-repeat pr-3 pl-1.5 text-center text-slate-700 dark:text-slate-300"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
            <option value="A3">A3</option>
            <option value="A5">A5</option>
            <option value="B5">B5</option>
          </select>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.07]" />

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-white dark:bg-[#111114] rounded-lg p-0.5 border border-slate-200 dark:border-white/[0.07] select-none h-[28px]">
            <button 
              onClick={handleZoomOut} 
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition cursor-pointer flex items-center justify-center font-bold h-6 w-6 text-xs"
              title="Zoom Out"
            >
              —
            </button>
            
            <input 
              type="text"
              value={isZoomFocused ? zoomInput : `${zoom}%`}
              onFocus={() => setIsZoomFocused(true)}
              onChange={(e) => {
                const val = e.target.value.replace(/%/g, '');
                setZoomInput(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleZoomInputSubmit();
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                setIsZoomFocused(false);
                handleZoomInputSubmit();
              }}
              className="text-[10px] sm:text-[11px] font-bold w-9 sm:w-10 text-center text-foreground font-mono bg-transparent border-0 focus:outline-none focus:ring-0 rounded py-0.5 h-full"
            />

            <button 
              onClick={handleZoomIn} 
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition cursor-pointer flex items-center justify-center font-bold h-6 w-6 text-xs"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.07]" />

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 border border-slate-200 dark:border-white/[0.07] rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] cursor-pointer transition flex items-center justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* A4 Sheet Viewport Wrapper — Responsively scrollable on mobile */}
      <div 
        style={{ WebkitOverflowScrolling: 'touch' }} 
        className="flex-1 overflow-auto preview-viewport-scrollbar bg-slate-100 dark:bg-[#060608] p-3 sm:p-6 lg:p-8 text-center block whitespace-nowrap"
      >
        <div 
          style={{ 
            zoom: zoom / 100,
            transition: 'zoom 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            ...paperStyles,
            ...marginStyles
          }}
          className={`a4-sheet max-w-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white text-black shadow-[0_4px_24px_rgba(0,0,0,0.06),_0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] inline-block text-left align-top whitespace-normal ${getMarginClass(
            settings.margins
          )} ${getThemeClass(settings.theme)} ${getFontSizeClass(settings.fontSize)}`}
        >
          {/* Header watermark in preview */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4 sm:mb-6 text-[9px] sm:text-[10px] text-gray-400 tracking-wider uppercase font-mono select-none">
            <span>Dastavezz PDF Preview</span>
            <span className="truncate max-w-[150px]">{title ? title : 'Untitled_Document'}</span>
          </div>

          {/* Formatted Content Container */}
          <div className="prose max-w-none break-words">
            {compileMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
