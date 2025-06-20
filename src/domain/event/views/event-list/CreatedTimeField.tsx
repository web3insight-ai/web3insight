import dayjs from "dayjs";

function CreatedTimeField({ value }: { value: string }) {
  return dayjs(value).format("MMM D, YYYY, h:mm A");
}

export default CreatedTimeField;
