"use client";

import { useState, useRef, MouseEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Button,
} from "@/components/ui";

import FileUpload from "$/controls/file-upload";

import { insertOne } from "../../repository/client";

import type { EventDialogPayload, EventDialogProps } from "./typing";
import { resolveContestants } from "./helper";

function EventDialog({ visible, onClose }: EventDialogProps) {
  const [description, setDescription] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleCsvUpload = (evt: MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    uploadRef.current?.click();
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserInput(e.target?.result as string);

      if (uploadRef.current) {
        uploadRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const closeDialog = (payload?: EventDialogPayload) => {
    setDescription("");
    setUserInput("");
    onClose(payload);
  };

  const handleConfirm = () => {
    const resolvedDescription = description && description.trim();

    if (!resolvedDescription) {
      return alert("Please enter event name first.");
    }

    const contestants = resolveContestants(userInput);

    if (contestants.length === 0) {
      return alert("Please enter contestants first.");
    }

    setLoading(true);
    insertOne({ urls: contestants, description: resolvedDescription })
      .then((res) => {
        if (res.success) {
          closeDialog({
            eventId: res.extra!.eventId,
            contestants: res.data,
            failedAccounts: res.extra?.fail || [],
          });
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
      onClose={() => !loading && closeDialog()}
      placement="center"
      size="lg"
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
      classNames={{
        base: "max-w-2xl mx-4",
        wrapper: "overflow-visible",
        backdrop: "bg-background-dark/50",
        header: "border-b border-rule",
        body: "p-0",
        closeButton: "hover:bg-bg-sunken transition-colors",
      }}
    >
      <ModalContent className="bg-bg-raised border border-rule rounded-[2px]">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-fg">Add Event</h2>
                <p className="font-mono text-xs text-fg-muted mt-1">
                  create a new event to track contestants and their activities
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="px-6 py-6 space-y-6 relative">
                <div className="space-y-4">
                  <Textarea
                    value={description}
                    placeholder="Enter event name (e.g., OpenBuild Hackathon)"
                    label="Event Name"
                    labelPlacement="outside"
                    isRequired
                    onValueChange={setDescription}
                    classNames={{
                      base: "w-full",
                      label: "text-sm font-medium text-fg mb-2",
                      input: "bg-bg-raised border-rule",
                    }}
                  />

                  <Textarea
                    value={userInput}
                    placeholder="Enter GitHub username of contestants, separated by comma"
                    label="Contestants"
                    labelPlacement="outside"
                    minRows={5}
                    maxRows={10}
                    isRequired
                    onValueChange={setUserInput}
                    classNames={{
                      base: "w-full",
                      label: "text-sm font-medium text-fg mb-2",
                      input: "bg-bg-raised border-rule",
                    }}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-fg-muted">
                      Input manually above or
                    </span>
                    <FileUpload
                      ref={uploadRef}
                      type="csv"
                      onChange={handleFileChange}
                    >
                      <Button
                        onClick={handleCsvUpload}
                        size="sm"
                        variant="bordered"
                        className="border-rule hover:bg-bg-sunken dark:hover:bg-white/10"
                      >
                        import from CSV file
                      </Button>
                    </FileUpload>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-rule px-6 py-4">
              <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="bordered"
                  onClick={() => closeDialog()}
                  isDisabled={loading}
                  className="flex-1 sm:flex-none border-rule hover:bg-bg-sunken dark:hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleConfirm}
                  className="flex-1 sm:flex-none"
                >
                  Confirm
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default EventDialog;
