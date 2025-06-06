import { useState, useMemo } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Select, SelectItem, Button,
} from "@nextui-org/react";

import type { MarkDialogProps } from "./typing";

const options = [
  { value: 0, label: "Irrelevant", description: "No meaningful relationship to the ecosystem. Exclude entirely (not counted in metrics)." },
  { value: 1, label: "Tangential", description: "Loosely related; only worth recording user participation (no functional/non-functional relevance)." },
  { value: 2, label: "Peripheral", description: "Superficial connection; minor ecosystem overlap (e.g., shared tooling but no integration)." },
  { value: 3, label: "Incidental", description: "Niche utility; limited ecosystem value (e.g., minor utility scripts used in a few projects)." },
  { value: 4, label: "Marginal", description: "Narrow use case; solves isolated problems but lacks broader adoption/impact." },
  { value: 5, label: "Relevant", description: "Clearly aligned; provides ecosystem value but not widely adopted (e.g., community plugins)." },
  { value: 6, label: "Notable", description: "Actively used; integrates with core tools/docs but not mission-critical." },
  { value: 7, label: "Important", description: "High impact; widely relied upon for key workflows (e.g., CI/CD utilities or major libraries)." },
  { value: 8, label: "Strategic", description: "Foundation-level; shapes best practices or enables major ecosystem capabilities." },
  { value: 9, label: "Pillar", description: "Near-core; anchors critical infrastructure (e.g., governance tools, security frameworks, or key SDKs)." },
  { value: 10, label: "Core", description: "Essential project—central to the ecosystem’s identity, functionality, or growth (e.g., core APIs)." },
];

function MarkDialog({ record, visible, onClose, onChange }: MarkDialogProps) {
  const [mark, setMark] = useState(record.customMark && Number(record.customMark) > -1 ? `${record.customMark}` : "");
  const [loading, setLoading] = useState(false);

  const computedMark = useMemo(() => mark || `${record.customMark}`, [mark, record]);
  console.log("mark", mark || undefined, record.customMark, computedMark);

  const closeDialog = () => {
    setMark("");
    onClose();
  };

  const handleConfirm = () => {
    setLoading(true);

    onChange(mark)
      .then(res => {
        if (res.success) {
          closeDialog();
        } else {
          alert(`Failed to mark repository: ${res.message}`);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={visible}
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        closeButton: "hidden",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div>Mark repository <code>{record.fullName}</code></div>
            </ModalHeader>
            <ModalBody>
              <Select
                selectedKeys={[computedMark]}
                placeholder="Choose a level"
                onChange={e => {
                  setMark(e.target.value);
                }}
              >
                {options.map(opt => (
                  <SelectItem key={`${opt.value}`} textValue={opt.label}>
                    <div>
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="bordered"
                onClick={closeDialog}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                isDisabled={!mark || mark === `${record.customMark}`}
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default MarkDialog;
