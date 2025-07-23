import dayjs from "dayjs";

function CreatedTimeField({ value }: { value: string }) {
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
      {dayjs(value).format("MMM D, YYYY, h:mm A")}
    </span>
  );
}

export default CreatedTimeField;
