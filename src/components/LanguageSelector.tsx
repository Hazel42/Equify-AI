
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: t('language.english'), flag: '🇺🇸' },
    { code: 'id' as Language, name: t('language.indonesian'), flag: '🇮🇩' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="text-xs font-medium">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] bg-white border shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${
              language === lang.code ? 'bg-green-50 text-green-700' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
