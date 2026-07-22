import SharedNavbar from "./navbar";
import SharedFooter from "./footer";

interface PageShellProps {
  children: React.ReactNode;
  /** Wraps children in a centered max-width container with vertical padding. */
  contained?: boolean;
}

/**
 * PageShell — standard public-page wrapper.
 * Use for static marketing pages (About, Contact, FAQ, Privacy, Terms).
 */
const PageShell = ({ children, contained = true }: PageShellProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <SharedNavbar showAuth />
    <main className="flex-1">
      {contained ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">{children}</div>
      ) : (
        children
      )}
    </main>
    <SharedFooter />
  </div>
);

export default PageShell;
