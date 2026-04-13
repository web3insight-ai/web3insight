import type { SocialLinkProps } from "./typing";

function SocialLink({ children, url }: SocialLinkProps) {
  return (
    <a
      className="text-fg hover:text-accent hover:underline"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {children || url}
    </a>
  );
}

export default SocialLink;
