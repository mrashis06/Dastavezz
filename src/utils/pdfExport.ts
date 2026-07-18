import { ExportSettings } from '../types';

interface OriginalStyleInfo {
  element: HTMLStyleElement | HTMLLinkElement;
  wasDisabled: boolean;
}

/**
 * Converts a modern CSS Color Module Level 4 color function (oklch, oklab, lab, lch, color)
 * into a standard rgba() string that html2canvas can parse.
 */
function convertModernColorToRgba(colorString: string): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return colorString;
    ctx.fillStyle = colorString;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  } catch {
    return colorString;
  }
}

/**
 * Parses CSS text and replaces any modern color function calls with their rgba() equivalents.
 */
function replaceModernColorsInCss(cssText: string): string {
  const colorRegex = /(oklch|oklab|lab|lch|color)\([^)]+\)/gi;
  return cssText.replace(colorRegex, (match) => {
    return convertModernColorToRgba(match);
  });
}

export async function exportToPDF(
  elementId: string,
  documentTitle: string,
  settings: ExportSettings,
  outputFormat: 'save' | 'blob' = 'save'
): Promise<Blob | void> {
  const originalStyles: OriginalStyleInfo[] = [];
  const tempElements: HTMLStyleElement[] = [];

  try {
    // 1. Process all stylesheets to convert modern color functions to rgba format
    const styleSheets = Array.from(document.styleSheets);
    
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i];
      const owner = sheet.ownerNode as HTMLStyleElement | HTMLLinkElement | null;
      if (!owner) continue;

      let cssText = '';
      let isAccessible = false;

      try {
        const rules = sheet.cssRules;
        for (let j = 0; j < rules.length; j++) {
          cssText += rules[j].cssText + '\n';
        }
        isAccessible = true;
      } catch {
        if (owner.tagName === 'STYLE') {
          cssText = owner.textContent || '';
          isAccessible = true;
        } else if (owner.tagName === 'LINK') {
          const href = (owner as HTMLLinkElement).href;
          if (href && href.startsWith(window.location.origin)) {
            try {
              const res = await fetch(href);
              if (res.ok) {
                cssText = await res.text();
                isAccessible = true;
              }
            } catch {
              // Ignore fetch failures
            }
          }
        }
      }

      if (isAccessible && cssText) {
        const modifiedCss = replaceModernColorsInCss(cssText);
        
        const tempStyle = document.createElement('style');
        tempStyle.className = 'temp-pdf-export-style';
        tempStyle.textContent = modifiedCss;
        document.head.appendChild(tempStyle);
        tempElements.push(tempStyle);

        originalStyles.push({
          element: owner,
          wasDisabled: owner.disabled
        });
        
        owner.disabled = true;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (await import('html2pdf.js') as any).default;
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`PDF export element with id "${elementId}" not found`);
    }

    const fileName = (documentTitle || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    let renderWidth = 794;
    let renderHeight = 1123;
    switch (settings.pageSize) {
      case 'Letter': renderWidth = 816; renderHeight = 1056; break;
      case 'Legal': renderWidth = 816; renderHeight = 1344; break;
      case 'A3': renderWidth = 1123; renderHeight = 1587; break;
      case 'A5': renderWidth = 559; renderHeight = 794; break;
      case 'B5': renderWidth = 665; renderHeight = 941; break;
      case 'A4':
      default: renderWidth = 794; renderHeight = 1123; break;
    }
    if (settings.orientation === 'landscape') {
      const temp = renderWidth;
      renderWidth = renderHeight;
      renderHeight = temp;
    }

    let pdfMargins: [number, number, number, number] = [20, 15, 20, 15];
    if (settings.margins === 'narrow') {
      pdfMargins = [10, 10, 10, 10];
    } else if (settings.margins === 'wide') {
      pdfMargins = [25, 25, 25, 25];
    } else if (settings.margins === 'custom') {
      pdfMargins = [
        settings.customMargins.top,
        settings.customMargins.left,
        settings.customMargins.bottom,
        settings.customMargins.right
      ];
    }

    const opt = {
      margin: pdfMargins,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true,
        width: renderWidth,
        windowWidth: renderWidth
      },
      jsPDF: { unit: 'mm', format: settings.pageSize.toLowerCase(), orientation: settings.orientation },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      enableLinks: true
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worker = html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setProperties({
        title: documentTitle || 'Dastavezz Document',
        author: 'Dastavezz User',
        subject: 'Exported Document',
        creator: 'Dastavezz Application'
      });

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(140, 140, 140);

        pdf.setLineWidth(0.35);
        pdf.setDrawColor(160, 160, 160);
        pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

        const pageText = `PAGE ${i} OF ${totalPages}`;
        let pageTextWidth = 0;
        if (typeof pdf.getTextWidth === 'function') {
          pageTextWidth = pdf.getTextWidth(pageText);
        } else {
          pageTextWidth = (pdf.getStringUnitWidth(pageText) * 8) / pdf.internal.scaleFactor;
        }
        pdf.text(pageText, pageWidth - 15 - pageTextWidth, pageHeight - 10);
      }
    });

    if (outputFormat === 'blob') {
      const blob = await worker.output('blob');
      return blob;
    } else {
      await worker.save();
    }
  } finally {
    originalStyles.forEach((style) => {
      style.element.disabled = style.wasDisabled;
    });
    tempElements.forEach((temp) => {
      if (temp.parentNode) {
        temp.parentNode.removeChild(temp);
      }
    });
  }
}
