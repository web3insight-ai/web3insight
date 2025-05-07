import { useState, useMemo } from "react";
import { Link } from "@remix-run/react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
} from "@nextui-org/react";
import { History } from "lucide-react";

import type { SearchHistoryProps } from "./typing";

function SearchHistory({ history, placeholder }: SearchHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Deduplicate history items based on documentId
  const uniqueHistory = useMemo(() => {
    const seen = new Set();
    return history.filter(item => {
      const key = item.documentId || item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [history]);

  return (
    <Popover
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <Button
          variant="light"
          size="sm"
          startContent={<History size={16} />}
          className="text-gray-500"
        >
          Recent
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="w-full p-2">
          <div className="text-sm font-medium text-gray-900 mb-2">
            Recent Searches
          </div>
          <Divider className="my-2" />
          {(!uniqueHistory || uniqueHistory.length === 0) ? (
            <div className="text-center py-3">
              <p className="text-sm text-gray-500 mb-2">No recent searches</p>
              <p className="text-xs text-gray-400">{placeholder}</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {uniqueHistory.map((item, index) => (
                <Link
                  key={`${item.documentId || item.id}-${index}`}
                  to={`/query/${item.documentId || item.id}`}
                  className="block p-2 text-sm text-gray-600 hover:bg-gray-100 rounded my-1 truncate"
                  onClick={() => setIsOpen(false)}
                >
                  {item.query}
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SearchHistory;
