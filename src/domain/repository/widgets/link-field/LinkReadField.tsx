import RepoLinkWidget from "../repo-link";

function LinkReadField({ value }: { value: string }) {
  return (
    <div className="flex items-center">
      <RepoLinkWidget
        className="font-medium text-gray-900 dark:text-white"
        repo={value}
      />
    </div>
  );
}

export default LinkReadField;
