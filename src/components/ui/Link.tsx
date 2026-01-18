interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function Link({ href, children, className = "", external = true }: LinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      className={`font-semibold hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...externalProps}
    >
      {children}
    </a>
  );
}

interface TextLinkProps {
  url: string;
  label: string;
  className?: string;
}

export function TextLink({ url, label, className = "" }: TextLinkProps) {
  return (
    <p>
      <Link href={url} className={className}>
        {label}
      </Link>
    </p>
  );
}
