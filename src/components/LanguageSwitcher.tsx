// src/components/ui/LanguageSwitcher.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RemiLocale } from "@/locales";

interface LanguageSwitcherProps {
  lang: RemiLocale;
  onChange: (lang: RemiLocale) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  lang,
  onChange,
}) => {
  const languages: { code: RemiLocale; label: string; flag: string }[] = [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

  const currentLanguage =
    languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="
            gap-2 rounded-full px-3 py-1 h-8
            bg-white               /* <- fondo sólido */
            border border-border
            shadow-sm text-sm font-medium
          "
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {currentLanguage.flag} {currentLanguage.label}
          </span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          bg-white                 /* <- menú blanco opaco */
          border border-border
          shadow-lg rounded-2xl
          p-1
        "
      >
        {languages.map((languageOption) => (
          <DropdownMenuItem
            key={languageOption.code}
            onClick={() => onChange(languageOption.code)}
            className={
              lang === languageOption.code
                ? "rounded-xl text-sm font-medium bg-secondary cursor-pointer"
                : "rounded-xl text-sm cursor-pointer"
            }
          >
            <span className="mr-2 text-xs uppercase">
              {languageOption.flag}
            </span>
            {languageOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
