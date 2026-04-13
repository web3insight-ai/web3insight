import dayjs from "dayjs";

function CreatedTimeField({ value }: { value: string }) {
  return (
    <span className="text-xs text-fg-muted font-normal">
      {dayjs(value).format("MMM D, YYYY, h:mm A")}
    </span>
  );
}

export default CreatedTimeField;
