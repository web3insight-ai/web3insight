'use client';

import { useState, useRef, MouseEvent } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Button,
} from "@nextui-org/react";
import { Calendar } from "lucide-react";

import FileUpload from "@/components/control/file-upload";

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
      .then(res => {
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
        header: "border-b border-border dark:border-border-dark",
        body: "p-0",
        closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
      }}
    >
      <ModalContent className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 px-6 py-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Event
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Create a new event to track contestants and their activities
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="px-6 py-6 space-y-6 relative">
                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Creating event...
                      </p>
                    </div>
                  </div>
                )}

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
                      label: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                      input: "bg-white dark:bg-surface-dark border-border dark:border-border-dark",
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
                      label: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                      input: "bg-white dark:bg-surface-dark border-border dark:border-border-dark",
                    }}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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
                        className="border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        import from CSV file
                      </Button>
                    </FileUpload>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-border dark:border-border-dark px-6 py-4">
              <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="bordered"
                  onClick={() => closeDialog()}
                  isDisabled={loading}
                  className="flex-1 sm:flex-none border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10"
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
