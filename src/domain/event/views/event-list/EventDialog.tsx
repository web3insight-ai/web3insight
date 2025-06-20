import { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Button,
} from "@nextui-org/react";

import type { GithubUser } from "../../typing";
import { insertContestantList } from "../../repository";

import type { EventDialogProps } from "./typing";
import { resolveContestants } from "./helper";

function EventDialog({ managerId, visible, onClose }: EventDialogProps) {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const closeDialog = (contestants?: GithubUser[]) => {
    setUserInput("");
    onClose(contestants);
  };

  const handleConfirm = () => {
    const contestants = resolveContestants(userInput);

    if (contestants.length === 0) {
      return alert("Please enter contestants first.");
    }

    setLoading(true);
    insertContestantList({ managerId, urls: contestants })
      .then(res => {
        if (res.success) {
          onClose(res.data);
        } else {
          alert(res.message);
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
              <div>Add Contestant</div>
            </ModalHeader>
            <ModalBody>
              <Textarea
                value={userInput}
                placeholder="Enter GitHub username of contestants, separated by comma"
                minRows={5}
                maxRows={10}
                onValueChange={setUserInput}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="bordered"
                onClick={() => closeDialog()}
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

export default EventDialog;
