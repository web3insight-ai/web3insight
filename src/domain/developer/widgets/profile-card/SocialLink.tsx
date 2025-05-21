import type { SocialLinkProps } from "./typing";

function SocialLink({ children, url }: SocialLinkProps) {
  return (
    <a
      className="text-gray-700 dark:text-gray-300 hover:text-primary hover:underline"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {children || url}
    </a>
  );
}

export default SocialLink;
