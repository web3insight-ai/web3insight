import { Link } from "@nextui-org/react";

export function Footer() {
  return (
    <div className="py-24 text-center">
      <small>
        Made with ❤️ by{" "}
        <Link size="sm" href="https://github.com/pseudoyu">
          pseudoyu
        </Link>{" "}
      </small>
    </div>
  );
}
