export async function copyToClipboard(value: string): Promise<boolean> {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const succeeded = document.execCommand('copy');
      document.body.removeChild(textarea);
      return succeeded;
    } catch {
      return false;
    }
  }
}
