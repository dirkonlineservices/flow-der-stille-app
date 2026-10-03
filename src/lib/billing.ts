import { Capacitor } from '@capacitor/core';

interface BillingInitProps {
  productId: string;
  onReady: () => void;
  onSuccess?: (transaction?: any) => Promise<any> | any;
  onFailure?: (errorMsg: string) => void;
}

// 📊 DataLayer Push Helper für GA4 Tracking
export const pushToDataLayer = (eventName: string, payload?: any) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      ...payload
    });
  }
};

// 📱 Plattform-Erkennung: iOS (App Store) oder Android (Google Play)
export const isIOSApp = (): boolean => {
  try {
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
};

export const getStoreName = (): string => (isIOSApp() ? 'App Store' : 'Google Play');

const getStorePlatform = (CdvPurchase: any) =>
  isIOSApp() ? CdvPurchase.Platform.APPLE_APPSTORE : CdvPurchase.Platform.GOOGLE_PLAY;

// 🛑 Set zur Verhinderung von Endlosschleifen (Idempotenz-Sperre)
const processedTransactionsSet = new Set<string>();
let isGlobalStoreInitialized = false;
let globalSuccessCallback: ((transaction?: any) => Promise<any> | any) | null = null;
let activePurchaseFailureCallback: ((msg: string) => void) | null = null;

// 🗺️ Exakte Zuordnung: Datenbank Produkt-ID <-> Store Produkt-ID
// Die Produkt-IDs werden im App Store identisch zu Google Play angelegt (fds_...).
export const PLAY_STORE_PRODUCT_MAP: Record<string, string> = {
  'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen': 'fds_selbsthypnose_selbstbewusstsein',
  'selbsthypnose_mehr_selbstbewusstsein_&_inneres_vertrauen': 'fds_selbsthypnose_selbstbewusstsein',
  'fds_hypnose_selbstbewusstsein': 'fds_selbsthypnose_selbstbewusstsein',

  'meditation_zur_herzoeffnung': 'fds_herzoeffnung_meditation',
  'meditation_loslassen': 'fds_meditation_loslassen',

  'selbsthypnose_ernaehrung': 'fds_selbsthypnose_gesunde_ernaehrung',
  'fds_hypnose_gesunde_ernaehrung': 'fds_selbsthypnose_gesunde_ernaehrung',

  'selbsthypnose_fokus&konzentration': 'fds_selbsthypnose_fokus_absolute_konzentration',
  'selbsthypnose_fokus_konzentration': 'fds_selbsthypnose_fokus_absolute_konzentration',
  'fds_hypnose_fokus': 'fds_selbsthypnose_fokus_absolute_konzentration',

  'meditation_herzkompass': 'fds_herzkompass_meditation',
  'meditation_inneres_kind': 'fds_meditation_inneres_kind',
  'meditation_innere_ruhe': 'fds_meditation_innere_ruhe',
  'pmr_basis': 'fds_pmr_basis',
  'gefuehrte_atemuebung': 'fds_gefuehrte_atemuebung',

  // Hörbücher
  'mensch_sein': 'fds_mensch_sein',
  'hoerbuch_mensch_sein': 'fds_mensch_sein',
  'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte': 'fds_schmetterling',
  'wo_die_seele_den_wind_beruehrt': 'fds_seele_wind',
  'hoerbuch_wo_die_seele_den_wind_beruehrt': 'fds_seele_wind'
};

export const REVERSE_PLAY_STORE_PRODUCT_MAP: Record<string, string> = {
  'fds_seele_wind': 'wo_die_seele_den_wind_beruehrt',
  'fds_mensch_sein': 'mensch_sein',
  'fds_schmetterling': 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte',
  'fds_selbsthypnose_selbstbewusstsein': 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
  'fds_hypnose_selbstbewusstsein': 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
  'fds_herzoeffnung_meditation': 'meditation_zur_herzoeffnung',
  'fds_meditation_loslassen': 'meditation_loslassen',
  'fds_selbsthypnose_gesunde_ernaehrung': 'selbsthypnose_ernaehrung',
  'fds_hypnose_gesunde_ernaehrung': 'selbsthypnose_ernaehrung',
  'fds_selbsthypnose_fokus_absolute_konzentration': 'selbsthypnose_fokus&konzentration',
  'fds_hypnose_fokus': 'selbsthypnose_fokus&konzentration',
  'fds_herzkompass_meditation': 'meditation_herzkompass',
  'fds_meditation_inneres_kind': 'meditation_inneres_kind',
  'fds_meditation_innere_ruhe': 'meditation_innere_ruhe',
  'fds_pmr_basis': 'pmr_basis',
  'fds_gefuehrte_atemuebung': 'gefuehrte_atemuebung'
};

export const getPlayStoreProductId = (input: any): string => {
  if (typeof input === 'object' && input !== null) {
    if (input.play_store_id && typeof input.play_store_id === 'string' && input.play_store_id.trim().length > 0) {
      return input.play_store_id.trim();
    }
    return getPlayStoreProductId(input.id || '');
  }
  const dbProductId = String(input || '');
  if (dbProductId.startsWith('fds_')) return dbProductId;
  return PLAY_STORE_PRODUCT_MAP[dbProductId] || `fds_${dbProductId.replace(/&/g, '_').replace(/__/g, '_')}`;
};

// Plattformneutraler Name (gleiche IDs für Google Play und App Store)
export const getStoreProductId = getPlayStoreProductId;

// 🔎 Erkennt "bereits gekauft"-Fehler (Google Play)
const isAlreadyOwnedError = (error: any): boolean => {
  if (!error) return false;
  let errJson = '';
  try { errJson = JSON.stringify(error); } catch { errJson = String(error); }
  const msg = String(error?.message || (typeof error === 'string' ? error : ''));
  return (
    error?.code === 6 ||
    error?.code === 6777003 ||
    errJson.includes('ITEM_ALREADY_OWNED') ||
    msg.includes('ITEM_ALREADY_OWNED') ||
    msg.includes('already owned') ||
    msg.includes('bereits gekauft')
  );
};

// 🧾 Einheitliche Auswertung der Rückmeldung von store.order() / offer.order()
const handleOrderResult = (res: any, storeId: string, onFailure?: (msg: string) => void) => {
  if (!res || !res.error) return;
  if (isAlreadyOwnedError(res.error)) {
    pushToDataLayer('purchase_restored', { item_id: storeId });
    if (onFailure) onFailure('Kauf gefunden. Inhalte werden synchronisiert...');
  } else {
    pushToDataLayer('purchase_failed', { error_message: res.error.message || 'Kauf abgebrochen' });
    if (onFailure) onFailure(`${getStoreName()}: ${res.error.message || 'Kauf abgebrochen'}`);
  }
};

export const BillingService = {
  isNative: (): boolean => {
    if (typeof window === 'undefined') return false;

    // Capacitor Native Platform check (true in der Android-/iOS-App, false im Web)
    try {
      if (typeof Capacitor !== 'undefined' && typeof Capacitor.isNativePlatform === 'function') {
        return Capacitor.isNativePlatform();
      }
    } catch (e) {}

    if (typeof (window as any).Capacitor !== 'undefined' && typeof (window as any).Capacitor.isNativePlatform === 'function') {
      return (window as any).Capacitor.isNativePlatform();
    }

    return false;
  },

  isIOS: isIOSApp,
  getStoreName,

  // 1. Einmalige globale Registrierung der Produkte & Event Listener
  registerAllProducts: (products: any[], onSuccessGlobal?: (transaction?: any) => Promise<any> | any) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) return;
      const store = CdvPurchase.store;
      const platform = getStorePlatform(CdvPurchase);

      if (onSuccessGlobal) {
        globalSuccessCallback = onSuccessGlobal;
      }

      const registeredSet = new Set<string>();

      products.forEach((p) => {
        const storeId = getStoreProductId(p);
        const dbId = typeof p === 'object' ? p.id : p;

        // Auf iOS nur die echten App-Store-IDs registrieren (ungültige IDs erzeugen sonst Fehler)
        const idsToRegister = isIOSApp() ? [storeId] : [storeId, dbId];

        idsToRegister.forEach((idToReg) => {
          if (idToReg && !registeredSet.has(idToReg)) {
            registeredSet.add(idToReg);
            try {
              store.register({
                id: idToReg,
                type: CdvPurchase.ProductType.NON_CONSUMABLE,
                platform
              });
            } catch (e) {}
          }
        });
      });

      // EINMALIGE Listener-Registrierung (verhindert mehrfaches Triggern)
      if (!isGlobalStoreInitialized) {
        isGlobalStoreInitialized = true;

        // a) Produkt-Updates
        try {
          store.when().productUpdated((product: any) => {
            if (product.owned === true) {
              pushToDataLayer('purchase_restored', { item_id: product.id });
            }
          });
        } catch (e) {}

        // b) Erfolgreicher Kauf (Approved)
        try {
          store.when().approved(async (transaction: any) => {
            const txId = transaction?.transactionId || transaction?.id || transaction?.purchaseToken || `tx_${Date.now()}`;

            if (processedTransactionsSet.has(txId)) {
              try {
                if (typeof transaction.finish === 'function') {
                  await transaction.finish();
                }
              } catch (e) {}
              return;
            }
            processedTransactionsSet.add(txId);

            try {
              let verificationResult = null;
              if (globalSuccessCallback) {
                verificationResult = await globalSuccessCallback(transaction);
              }
              const confirmedOrderId = verificationResult?.orderId || txId;
              const confirmedItemName = verificationResult?.productTitle || verificationResult?.productId || 'Flow der Stille Premium';
              const confirmedPrice = verificationResult?.price || 1.99;

              if (typeof transaction.finish === 'function') {
                await transaction.finish();
              }

              pushToDataLayer('purchase', {
                ecommerce: {
                  transaction_id: confirmedOrderId,
                  value: confirmedPrice,
                  currency: 'EUR',
                  items: [{
                    item_id: verificationResult?.productId || transaction.productId || 'fds_item',
                    item_name: confirmedItemName,
                    price: confirmedPrice,
                    quantity: 1
                  }]
                }
              });
            } catch (err: any) {
              console.error('Fehler bei Kaufbestätigung:', err);
              pushToDataLayer('purchase_failed', { error_message: err?.message || 'Verifizierung fehlgeschlagen' });
              if (activePurchaseFailureCallback) {
                activePurchaseFailureCallback(err?.message || 'Kauf konnte von Supabase nicht verifiziert werden.');
              }
            }
          });
        } catch (e) {}

        // c) Globales Fehler-Handling
        try {
          store.error((error: any) => {
            let errJson = '';
            try { errJson = JSON.stringify(error); } catch (e) { errJson = String(error); }
            console.error('Billing Error:', errJson, error?.message, error?.code);

            const errorMsg = error?.message || (typeof error === 'string' ? error : errJson);

            if (isAlreadyOwnedError(error)) {
              if (activePurchaseFailureCallback) {
                activePurchaseFailureCallback('Kauf gefunden. Inhalte werden synchronisiert...');
              }
              return;
            }

            pushToDataLayer('purchase_failed', { error_message: errorMsg || 'Billing Error' });
            if (activePurchaseFailureCallback) {
              activePurchaseFailureCallback(errorMsg || 'Kaufvorgang konnte nicht abgeschlossen werden.');
            }
          });
        } catch (e) {}

        try {
          store.initialize([platform]);
        } catch (initErr) {
          try { store.initialize(); } catch (e2) {}
        }
      }
    } catch (err) {
      console.warn('registerAllProducts notice:', err);
    }
  },

  // 2. Produktbezogene Initialisierung für einzelne Buttons
  init: ({ productId, onReady, onSuccess }: BillingInitProps) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;

      if (!CdvPurchase || !CdvPurchase.store) {
        setTimeout(() => onReady(), 500);
        return;
      }

      if (onSuccess) {
        globalSuccessCallback = onSuccess;
      }

      const store = CdvPurchase.store;
      const storeId = getStoreProductId(productId);

      try {
        store.register({
          id: storeId,
          type: CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: getStorePlatform(CdvPurchase)
        });
      } catch (e) {}

      setTimeout(() => onReady(), 300);
    } catch (error) {
      onReady();
    }
  },

  // 3. Start des Kaufprozesses für ein spezifisches Produkt
  startPurchase: async (produkt: any, onFailure?: (errorMsg: string) => void) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;

      if (!CdvPurchase || !CdvPurchase.store) {
        if (onFailure) onFailure(`${getStoreName()}-Bezahlfunktion auf diesem Gerät nicht verfügbar.`);
        return;
      }

      if (onFailure) {
        activePurchaseFailureCallback = onFailure;
      }

      const platform = getStorePlatform(CdvPurchase);
      const dbId = typeof produkt === 'object' ? produkt.id : produkt;
      const storeId = getStoreProductId(produkt);
      const itemName = (typeof produkt === 'object' && produkt.titel) ? produkt.titel : (typeof produkt === 'object' && produkt.title) ? produkt.title : dbId;
      const itemPrice = (typeof produkt === 'object' && produkt.preis) ? parseFloat(produkt.preis) : 1.99;

      pushToDataLayer('begin_checkout', {
        ecommerce: {
          items: [{
            item_id: dbId,
            item_name: itemName,
            price: itemPrice,
            currency: 'EUR'
          }]
        }
      });

      const store = CdvPurchase.store;

      let product = store.get(storeId, platform)
                 || store.get(storeId)
                 || store.get(dbId, platform)
                 || store.get(dbId);

      if (!product) {
        try {
          store.register({
            id: storeId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform
          });
          product = store.get(storeId, platform) || store.get(storeId);
        } catch (regErr) {}
      }

      if (product && product.offers && product.offers.length > 0) {
        const offer = product.offers[0];
        if (typeof offer.order === 'function') {
          try {
            const res = await offer.order();
            handleOrderResult(res, storeId, onFailure);
            return;
          } catch (eOffer) {}
        }
      }

      const targetOffer = (product && product.offers && product.offers.length > 0) ? product.offers[0] : (product || storeId);

      if (typeof store.order === 'function') {
        try {
          const res = await store.order(targetOffer);
          handleOrderResult(res, storeId, onFailure);
          return;
        } catch (eOrder: any) {
          try {
            const resStr = await store.order(storeId);
            handleOrderResult(resStr, storeId, onFailure);
            return;
          } catch (eStr) {}
        }
      }

      if (onFailure) {
        onFailure('Store-Verbindung wird geladen... Bitte tippe in Kürze erneut auf Kaufen.');
      }

    } catch (error: any) {
      console.error('Fataler Fehler bei startPurchase:', error);
      pushToDataLayer('purchase_failed', { error_message: error?.message || 'Unerwarteter Fehler' });
      if (onFailure) onFailure(`Bezahlfehler: ${error?.message || 'Unerwarteter Fehler'}`);
    }
  },

  // 4. Käufe wiederherstellen (von Apple für iOS vorgeschrieben)
  // Wiederhergestellte Käufe laufen automatisch über den approved-Listener zur Freischaltung.
  restorePurchases: async (): Promise<string | null> => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        return `${getStoreName()}-Bezahlfunktion auf diesem Gerät nicht verfügbar.`;
      }
      const err = await CdvPurchase.store.restorePurchases();
      if (err) {
        return err.message || 'Wiederherstellung fehlgeschlagen.';
      }
      pushToDataLayer('purchase_restore_requested', { platform: getStoreName() });
      return null;
    } catch (e: any) {
      return e?.message || 'Wiederherstellung fehlgeschlagen.';
    }
  }
};
