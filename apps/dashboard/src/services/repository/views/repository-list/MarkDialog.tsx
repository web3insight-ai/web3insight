"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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

import { repoMarkSchema, type RepoMarkInput } from "@/lib/form/schemas";

import type { MarkDialogProps } from "./typing";

const options = [
  {
    value: 0,
    label: "Irrelevant",
    description:
      "No meaningful relationship to the ecosystem. Exclude entirely (not counted in metrics).",
  },
  {
    value: 1,
    label: "Tangential",
    description:
      "Loosely related; only worth recording user participation (no functional/non-functional relevance).",
  },
  {
    value: 2,
    label: "Peripheral",
    description:
      "Superficial connection; minor ecosystem overlap (e.g., shared tooling but no integration).",
  },
  {
    value: 3,
    label: "Incidental",
    description:
      "Niche utility; limited ecosystem value (e.g., minor utility scripts used in a few projects).",
  },
  {
    value: 4,
    label: "Marginal",
    description:
      "Narrow use case; solves isolated problems but lacks broader adoption/impact.",
  },
  {
    value: 5,
    label: "Relevant",
    description:
      "Clearly aligned; provides ecosystem value but not widely adopted (e.g., community plugins).",
  },
  {
    value: 6,
    label: "Notable",
    description:
      "Actively used; integrates with core tools/docs but not mission-critical.",
  },
  {
    value: 7,
    label: "Important",
    description:
      "High impact; widely relied upon for key workflows (e.g., CI/CD utilities or major libraries).",
  },
  {
    value: 8,
    label: "Strategic",
    description:
      "Foundation-level; shapes best practices or enables major ecosystem capabilities.",
  },
  {
    value: 9,
    label: "Pillar",
    description:
      "Near-core; anchors critical infrastructure (e.g., governance tools, security frameworks, or key SDKs).",
  },
  {
    value: 10,
    label: "Core",
    description:
      "Essential project—central to the ecosystem's identity, functionality, or growth (e.g., core APIs).",
  },
];

function MarkDialog({ record, visible, onClose, onChange }: MarkDialogProps) {
  const defaultMark =
    record.customMark && Number(record.customMark) > -1
      ? `${record.customMark}`
      : "";

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RepoMarkInput>({
    resolver: zodResolver(repoMarkSchema),
    defaultValues: {
      mark: defaultMark,
    },
  });

  const markValue = watch("mark");

  // Reset form when record changes
  useEffect(() => {
    if (visible) {
      const newDefaultMark =
        record.customMark && Number(record.customMark) > -1
          ? `${record.customMark}`
          : "";
      reset({ mark: newDefaultMark });
    }
  }, [record, visible, reset]);

  const markMutation = useMutation({
    mutationFn: async (data: RepoMarkInput) => {
      return onChange(data.mark);
    },
    onSuccess: (result) => {
      if (result.success) {
        closeDialog();
      } else {
        alert(`Failed to mark repository: ${result.message}`);
      }
    },
    onError: (error) => {
      alert(
        `Failed to mark repository: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });

  const closeDialog = () => {
    reset({ mark: "" });
    markMutation.reset();
    onClose();
  };

  const onSubmit = (data: RepoMarkInput) => {
    markMutation.mutate(data);
  };

  const isUnchanged = markValue === `${record.customMark}`;

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="text-lg font-semibold text-fg">
                Mark Repository
              </div>
              <div className="text-sm text-fg-muted">
                Repository:{" "}
                <span className="font-mono text-accent">{record.fullName}</span>
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="mark-select"
                    className="text-sm font-medium text-fg mb-2 block"
                  >
                    Custom Mark Level
                  </label>
                  <Controller
                    name="mark"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="mark-select"
                        selectedKeys={field.value ? [field.value] : []}
                        placeholder="Choose a relevance level..."
                        isInvalid={!!errors.mark}
                        errorMessage={errors.mark?.message}
                        classNames={{
                          trigger: "bg-bg-raised border border-rule",
                        }}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {options.map((opt) => (
                          <SelectItem
                            key={`${opt.value}`}
                            textValue={opt.label}
                          >
                            <div className="py-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-[2px] border font-mono text-xs tabular-nums ${
                                    opt.value === 0
                                      ? "border-rule bg-bg-sunken text-fg-muted"
                                      : opt.value <= 3
                                        ? "border-rule bg-bg-sunken text-fg-muted"
                                        : opt.value <= 6
                                          ? "border-rule bg-bg-sunken text-fg"
                                          : "border-accent bg-accent-subtle text-accent"
                                  }`}
                                >
                                  {opt.value}
                                </span>
                                <p className="font-semibold text-fg">
                                  {opt.label}
                                </p>
                              </div>
                              <p className="text-xs text-fg-muted mt-1 ml-8">
                                {opt.description}
                              </p>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>
                {markValue && (
                  <div className="p-4 bg-bg-sunken rounded-[2px] border border-rule">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-[2px] border font-mono text-xs tabular-nums ${
                          Number(markValue) === 0
                            ? "border-rule bg-bg-raised text-fg-muted"
                            : Number(markValue) <= 3
                              ? "border-rule bg-bg-raised text-fg-muted"
                              : Number(markValue) <= 6
                                ? "border-rule bg-bg-raised text-fg"
                                : "border-accent bg-accent-subtle text-accent"
                        }`}
                      >
                        {markValue}
                      </span>
                      <span className="text-sm font-medium text-fg">
                        {
                          options.find((opt) => opt.value === Number(markValue))
                            ?.label
                        }
                      </span>
                    </div>
                    <p className="text-xs text-fg-muted mt-2">
                      {
                        options.find((opt) => opt.value === Number(markValue))
                          ?.description
                      }
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                variant="bordered"
                onClick={closeDialog}
                isDisabled={markMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={markMutation.isPending}
                isDisabled={!markValue || isUnchanged}
              >
                Confirm
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}

export default MarkDialog;
