
import { useLanguage as useLanguageContext } from '@/contexts/LanguageContext';

export const useLanguage = () => {
  return useLanguageContext();
};
