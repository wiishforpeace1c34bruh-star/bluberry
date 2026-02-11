interface FooterProps {
  onDMCA: () => void;
  onContact: () => void;
  onPrivacy: () => void;
}

export function Footer({ onDMCA, onContact, onPrivacy }: FooterProps) {
  return (
    <footer className="w-full bg-background/80 backdrop-blur-xl border-t border-border/15">
      <div className="max-w-[1400px] mx-auto px-4 py-3.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60 hidden sm:block">
          © {new Date().getFullYear()} Sapphire
        </span>

        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <FooterLink onClick={onDMCA}>DMCA</FooterLink>
          <span className="text-border/30">·</span>
          <FooterLink onClick={onContact}>Contact</FooterLink>
          <span className="text-border/30">·</span>
          <FooterLink onClick={onPrivacy}>Privacy</FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-muted-foreground/70 hover:text-foreground px-3 py-1.5 rounded-xl transition-all duration-300 hover:bg-secondary/40"
    >
      {children}
    </button>
  );
}
