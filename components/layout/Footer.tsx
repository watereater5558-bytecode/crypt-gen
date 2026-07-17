export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-5 sm:px-8">
      <div className="flex flex-col gap-1 text-xs text-ivory-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Every operation runs locally in your browser via the Web Crypto API. Nothing leaves this device.</p>
        <p className="font-mono">CryptGen</p>
      </div>
    </footer>
  );
}
