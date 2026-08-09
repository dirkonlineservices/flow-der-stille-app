interface BillingInitProps {
  productId: string;
  onReady: () => void;
  onSuccess: (transaction?: any) => void;
  onFailure: (errorMsg: string) => void;
}

// 🗺️ Exakte Zuordnung: Datenbank Produkt-ID <-> Google Play Console Produkt-ID
export const PLAY_STORE_PRODUCT_MAP: Record<string, string> = {
  'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen': 'fds_hypnose_selbstbewusstsein',
  'selbsthypnose_mehr_selbstbewusstsein_&_inneres_vertrauen': 'fds_hypnose_selbstbewusstsein',
  'meditation_zur_herzoeffnung': 'fds_herzoeffnung_meditation',
  'meditation_loslassen': 'fds_meditation_loslassen',
  'selbsthypnose_ernaehrung': 'fds_hypnose_gesunde_ernaehrung',
  'selbsthypnose_fokus&konzentration': 'fds_hypnose_fokus',
  'selbsthypnose_fokus_konzentration': 'fds_hypnose_fokus',
  'meditation_herzkompass': 'fds_herzkompass_meditation',
  'meditation_inneres_kind': 'fds_meditation_inneres_kind',
  'meditation_innere_ruhe': 'fds_meditation_innere_ruhe',
  'pmr_basis': 'fds_pmr_basis',
  'gefuehrte_atemuebung': 'fds_gefuehrte_atemuebung'
};

export const getPlayStoreProductId = (dbProductId: string): string => {
  return PLAY_STORE_PRODUCT_MAP[dbProductId] || `fds_${dbProductId.replace(/&/g, '_').replace(/__/g, '_')}`;
};

export const BillingService = {
  isNative: (): boolean => {
    return typeof window !== 'undefined' && (
      typeof (window as any).CdvPurchase !== 'undefined' || 
      typeof (window as any).Capacitor !== 'undefined'
    );
  },

  init: ({ productId, onReady, onSuccess, onFailure }: BillingInitProps) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      
      if (!CdvPurchase || !CdvPurchase.store) {
        console.warn("Cordova Purchase Plugin nicht gefunden.");
        setTimeout(() => onReady(), 500);
        return;
      }

      const store = CdvPurchase.store;
      const playId = getPlayStoreProductId(productId);

      let isReadyCalled = false;
      const safeOnReady = () => {
        if (!isReadyCalled) {
          isReadyCalled = true;
          onReady();
        }
      };

      // 1. Exakte Play Store Produkt-ID registrieren
      try {
        store.register({
          id: playId,
          type: CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: CdvPurchase.Platform.GOOGLE_PLAY
        });
      } catch (e) {
        console.warn("Register notice:", e);
      }

      if (playId !== productId) {
        try {
          store.register({
            id: productId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
        } catch (e) {}
      }

      // 2. Unabhängige Event-Listener (v13 sichere Syntax ohne Method Chaining)
      try {
        if (store.when) {
          store.when().productUpdated((product: any) => {
            if (product.id === playId || product.id === productId) {
              safeOnReady();
            }
          });

          store.when().approved((transaction: any) => {
            try {
              transaction.finish();
              onSuccess(transaction);
            } catch (e) {
              console.error("Fehler beim Abschließen der Transaktion", e);
              onFailure("Fehler beim Bestätigen des Kaufs.");
            }
          });

          store.when().cancelled(() => {
            onFailure("Kaufvorgang wurde abgebrochen.");
          });

          store.when().error((error: any) => {
            console.warn("Billing Notice:", error);
            safeOnReady();
          });
        }
      } catch (evtErr) {
        console.warn("Listener registration notice:", evtErr);
      }

      if (typeof store.ready === 'function') {
        try {
          store.ready(() => safeOnReady());
        } catch (e) {}
      }

      // 3. Store initialisieren (Sichere v13 Syntax mit Fallback)
      if (store.ready === true) {
        safeOnReady();
      } else {
        try {
          store.initialize([{ platform: CdvPurchase.Platform.GOOGLE_PLAY }]);
        } catch (initErr) {
          console.warn("Store initialize array notice:", initErr);
          try {
            store.initialize();
          } catch (e2) {
            console.warn("Store initialize fallback notice:", e2);
          }
        }
      }

      // 4. Safety Fallback Timeout (max. 1 Sek.)
      setTimeout(() => {
        safeOnReady();
      }, 1000);
      
    } catch (error) {
      console.error("Fehler in Billing init:", error);
      onReady();
    }
  },

  startPurchase: async (productId: string, onFailure?: (errorMsg: string) => void) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      
      if (!CdvPurchase || !CdvPurchase.store) {
        if (onFailure) onFailure("Google Play Store Bezahl-Plugin auf diesem Gerät nicht verfügbar.");
        return;
      }

      const store = CdvPurchase.store;
      const playId = getPlayStoreProductId(productId);

      let product = store.get(playId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(playId)
                 || store.get(productId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(productId);

      if (!product) {
        try {
          store.register({
            id: playId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
          product = store.get(playId) || store.get(productId);
        } catch (regErr) {
          console.warn("Auto-register fallback notice:", regErr);
        }
      }

      // Versuche 1: offer.order() falls offer-Objekt in v13 vorhanden ist
      if (product && product.offers && product.offers.length > 0) {
        const offer = product.offers[0];
        if (typeof offer.order === 'function') {
          try {
            const res = await offer.order();
            if (res && res.error && onFailure) {
              onFailure(`Play Store: ${res.error.message || 'Kauf abgebrochen'}`);
            }
            return;
          } catch (eOffer) {
            console.warn("offer.order notice:", eOffer);
          }
        }
      }

      // Versuche 2: store.order(targetOffer) oder store.order(product)
      const targetOffer = (product && product.offers && product.offers.length > 0) ? product.offers[0] : (product || playId);
      
      if (typeof store.order === 'function') {
        try {
          const res = await store.order(targetOffer);
          if (res && res.error && onFailure) {
            onFailure(`Play Store Rückmeldung: ${res.error.message || 'Kauf abgebrochen'}`);
          }
          return;
        } catch (eOrder) {
          console.warn("store.order(targetOffer) notice:", eOrder);
          // Versuche 3: Direct String Fallback store.order(playId)
          try {
            const resStr = await store.order(playId);
            if (resStr && resStr.error && onFailure) {
              onFailure(`Play Store Rückmeldung: ${resStr.error.message || 'Kauf abgebrochen'}`);
            }
            return;
          } catch (eStr) {
            console.error("store.order(playId) fallback failed:", eStr);
          }
        }
      }

      if (onFailure) {
        onFailure(`Google Play Bezahl-Widget für "${playId}" konnte nicht geöffnet werden.`);
      }
      
    } catch (error: any) {
      console.error("Fataler Fehler bei startPurchase:", error);
      if (onFailure) onFailure(`Bezahlfehler: ${error?.message || 'Unerwarteter Fehler'}`);
    }
  }
};