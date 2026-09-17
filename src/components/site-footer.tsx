export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-page px-8 py-5">
      <p className="text-center text-[13px] text-muted">
        Powered by{" "}
        <a
          href="https://typesafe.ai"
          target="_blank"
          rel="noreferrer"
          className="text-main transition-opacity hover:opacity-70"
        >
          TypeSafe
        </a>
      </p>
    </footer>
  );
}
