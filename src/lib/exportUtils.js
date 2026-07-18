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

export function downloadPDF(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) return
  const opt = {
    margin: 0.5,
    filename: `${filename || 'note'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }
  html2pdf().set(opt).from(el).save()
}