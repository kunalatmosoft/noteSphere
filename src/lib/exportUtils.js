import html2pdf from 'html2pdf.js'

export function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename || 'note'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPDF(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) return

  await document.fonts.ready;

  // 1. Force the main container text to black
  const originalColor = el.style.color;
  const originalTransition = el.style.transition;
  
  el.style.color = '#000000'; 
  el.style.transition = 'none'; 

  // 2. THE FIX: Protect code blocks so they have light text on their dark backgrounds
  const codeElements = el.querySelectorAll('pre, code');
  const originalCodeColors = [];
  codeElements.forEach((codeEl, i) => {
    originalCodeColors[i] = codeEl.style.color;
    // Force a light gray/white color specifically for the code elements
    codeEl.style.color = '#f8fafc'; 
  });

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `${filename || 'note'}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0, 
      backgroundColor: '#ffffff',
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  }

  html2pdf().set(opt).from(el).save().then(() => {
    // 3. Restore main container styles
    el.style.color = originalColor;
    el.style.transition = originalTransition;
    
    // 4. Restore original code block styles
    codeElements.forEach((codeEl, i) => {
      codeEl.style.color = originalCodeColors[i];
    });
  })
}