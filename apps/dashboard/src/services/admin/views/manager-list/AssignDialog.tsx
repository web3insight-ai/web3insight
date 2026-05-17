import { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Button,
} from "@/components/ui";

import type { AssignDialogProps } from "./typing";

function AssignDialog({
  record,
  ecosystems,
  visible,
  onClose,
  onChange,
}: AssignDialogProps) {
  const [assigned, setAssigned] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const computedAssigned = useMemo(
    () => assigned || record.ecosystems || [],
    [assigned, record],
  );

  const closeDialog = () => {
    setAssigned(null);
    onClose();
  };

  const handleConfirm = () => {
    setLoading(true);

    onChange(assigned || [])
      .then((res) => {
        if (res.success) {
          closeDialog();
        } else {
          alert(`Failed to assign ecosystems: ${res.message}`);
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
              <div>
                Assign ecosystems for <code>{record.username}</code>
              </div>
            </ModalHeader>
            <ModalBody>
              <Select
                selectedKeys={computedAssigned}
                placeholder="Choose ecosystems"
                selectionMode="multiple"
                onChange={(e) => {
                  setAssigned(e.target.value.split(","));
                }}
              >
                {ecosystems.map((eco) => (
                  <SelectItem
                    key={`${eco.replaceAll(" ", "")}`}
                    textValue={eco}
                  >
                    {eco}
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

export default AssignDialog;
