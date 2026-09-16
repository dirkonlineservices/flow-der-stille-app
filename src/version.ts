import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Zentrale Versionsdefinition für die gesamte Flow der Stille Plattform
 * (Webseite, PWA und Android App).
 */
export const APP_VERSION = '5.3.0';
export const APP_VERSION_CODE = 100;

/**
 * Ermittelt die exakte App-Version:
 * - Auf nativen Android-Geräten direkt aus dem installierten Android-Paket
 * - Im Webbrowser / PWA aus der zentralen APP_VERSION
 */
export async function getClientAppVersion(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await App.getInfo();
      return info.version || APP_VERSION;
    } catch {
      return APP_VERSION;
    }
  }
  return APP_VERSION;
}
