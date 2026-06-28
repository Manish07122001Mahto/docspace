export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function textToHtml(content: string) {
  const blocks = content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return '<p></p>';
  }

  return blocks
    .map((block) => `<p>${escapeHtml(block).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

export function isSupportedImportFile(fileName: string, mimeType: string) {
  const normalized = fileName.toLowerCase();

  return (
    normalized.endsWith('.txt') ||
    normalized.endsWith('.md') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown'
  );
}
