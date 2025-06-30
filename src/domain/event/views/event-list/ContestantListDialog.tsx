import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Avatar, Link, Button,
} from "@nextui-org/react";

import type { ContestantListDialogProps } from "./typing";

function ContestantListDialog({ dataSource, visible, onClose, onGoto }: ContestantListDialogProps) {
  return (
    <Modal
      size="xl"
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
              <div>Contestants</div>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 max-h-80 overflow-auto">
                {dataSource.map(user => (
                  <div className="flex gap-2" key={user.id}>
                    <Link href={user.html_url} isExternal>
                      <Avatar src={user.avatar_url} size="lg" />
                    </Link>
                    <div>
                      <div className="text-lg font-bold">
                        <Link href={user.html_url} isExternal>{user.login}</Link>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">{user.bio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="bordered" onClick={onClose}>Cancel</Button>
              <Button color="primary" onClick={onGoto}>Confirm</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ContestantListDialog;
