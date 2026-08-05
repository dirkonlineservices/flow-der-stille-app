import CookieBanner, { 
  ConsentChoice, 
  COOKIE_STORAGE_KEY, 
  updateGtagConsent, 
  openCookieConsentModal 
} from './CookieBanner';

export type { ConsentChoice };
export { COOKIE_STORAGE_KEY, updateGtagConsent, openCookieConsentModal, CookieBanner };
export default CookieBanner;
