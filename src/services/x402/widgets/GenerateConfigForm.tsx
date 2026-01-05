"use client";

import { useState, useMemo } from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Check, FileJson, Info, Plus, Trash2 } from "lucide-react";
import { FormInput, FormTextarea, FormSelect } from "@/lib/form/components";
import {
  donationConfigSchema,
  type DonationConfigFormValues,
} from "@/lib/form/schemas";
import { SUPPORTED_NETWORKS } from "../typing";

interface GenerateConfigFormProps {
  defaultValues?: Partial<DonationConfigFormValues>;
}

export function GenerateConfigForm({ defaultValues }: GenerateConfigFormProps) {
  const [copied, setCopied] = useState(false);

  const methods = useForm<DonationConfigFormValues>({
    resolver: zodResolver(donationConfigSchema),
    defaultValues: {
      payTo: "",
      title: "",
      description: "",
      creatorHandle: "",
      creatorAvatar: "",
      defaultAmount: "",
      network: "base",
      links: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "links",
  });

  const watchedValues = methods.watch();

  // Generate the JSON config
  const generatedConfig = useMemo(() => {
    const config: Record<string, unknown> = {};

    if (watchedValues.payTo) {
      config.payTo = watchedValues.payTo;
    }
    if (watchedValues.defaultAmount) {
      config.defaultAmount = watchedValues.defaultAmount;
    }
    if (watchedValues.title) {
      config.title = watchedValues.title;
    }
    if (watchedValues.description) {
      config.description = watchedValues.description;
    }
    // Build creator object if either field is present
    if (watchedValues.creatorHandle || watchedValues.creatorAvatar) {
      const creator: { handle?: string; avatar?: string } = {};
      if (watchedValues.creatorHandle) {
        creator.handle = watchedValues.creatorHandle;
      }
      if (watchedValues.creatorAvatar) {
        creator.avatar = watchedValues.creatorAvatar;
      }
      config.creator = creator;
    }
    // Build links array if any links exist
    const validLinks = watchedValues.links?.filter(
      (link) => link.url && link.label,
    );
    if (validLinks && validLinks.length > 0) {
      config.links = validLinks;
    }

    return JSON.stringify(config, null, 2);
  }, [watchedValues]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isValidConfig =
    watchedValues.payTo && /^0x[a-fA-F0-9]{40}$/.test(watchedValues.payTo);

  return (
    <Card className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileJson size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generate donation.json
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your donation configuration file
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <FormProvider {...methods}>
            <form className="space-y-4">
              <FormInput<DonationConfigFormValues>
                name="payTo"
                label="Wallet Address"
                placeholder="0x..."
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput<DonationConfigFormValues>
                  name="defaultAmount"
                  label="Default Amount (Optional)"
                  placeholder="5"
                  type="number"
                />

                <FormSelect<DonationConfigFormValues>
                  name="network"
                  label="Network"
                  options={SUPPORTED_NETWORKS.map((n) => ({
                    value: n.value,
                    label: n.label,
                  }))}
                />
              </div>

              <FormInput<DonationConfigFormValues>
                name="title"
                label="Title (Optional)"
                placeholder="My Awesome Project"
              />

              <FormTextarea<DonationConfigFormValues>
                name="description"
                label="Description (Optional)"
                placeholder="Brief description of your project..."
                minRows={2}
                maxRows={4}
              />

              {/* Creator Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Creator (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput<DonationConfigFormValues>
                    name="creatorHandle"
                    label="Handle"
                    placeholder="pseudoyu"
                  />
                  <FormInput<DonationConfigFormValues>
                    name="creatorAvatar"
                    label="Avatar URL"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Links (Optional)
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="flat"
                    isDisabled={fields.length >= 5}
                    onPress={() => append({ url: "", label: "" })}
                    startContent={<Plus size={14} />}
                  >
                    Add Link
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <FormInput<DonationConfigFormValues>
                        name={`links.${index}.label`}
                        label="Label"
                        placeholder="Repository"
                      />
                      <FormInput<DonationConfigFormValues>
                        name={`links.${index}.url`}
                        label="URL"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <Button
                      type="button"
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="mt-6"
                      onPress={() => remove(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </form>
          </FormProvider>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </span>
              <Chip
                size="sm"
                variant="flat"
                color={isValidConfig ? "success" : "warning"}
              >
                {isValidConfig ? "Valid" : "Incomplete"}
              </Chip>
            </div>

            <div className="relative">
              <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-border-dark overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 min-h-[200px]">
                {generatedConfig}
              </pre>

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="absolute top-2 right-2"
                onPress={handleCopy}
                isDisabled={!isValidConfig}
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info
                  size={20}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-2">How to add to your repo:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                    <li>
                      Create a{" "}
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                        .x402
                      </code>{" "}
                      folder in your repository root
                    </li>
                    <li>
                      Create a{" "}
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                        donation.json
                      </code>{" "}
                      file inside
                    </li>
                    <li>Paste the generated configuration</li>
                    <li>Commit and push to your default branch</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button
              color="primary"
              variant="bordered"
              className="w-full"
              onPress={handleCopy}
              isDisabled={!isValidConfig}
              startContent={copied ? <Check size={18} /> : <Copy size={18} />}
            >
              {copied ? "Copied!" : "Copy Configuration"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
