import { Button } from "@/components/ui";
import { useAtom } from "jotai";
import { Languages } from "lucide-react";
import { languageAtom } from "#/atoms";
import { setStoredLanguagePreference } from "@/utils/locale";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const [language, setLanguage] = useAtom(languageAtom);

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "chinese" : "english";
    setLanguage(newLanguage);
    // Store user's manual preference
    setStoredLanguagePreference(newLanguage);
  };

  return (
    <Button
      variant="light"
      size="sm"
      onPress={toggleLanguage}
      className={`text-xs gap-1 ${className}`}
      startContent={<Languages size={12} />}
    >
      {language === "english" ? "中文" : "EN"}
    </Button>
  );
}
