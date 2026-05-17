import RepoLinkWidget from "../repo-link";

function LinkReadField({ value }: { value: string }) {
  return (
    <div className="flex items-center">
      <RepoLinkWidget className="font-medium text-fg" repo={value} />
    </div>
  );
}

export default LinkReadField;
