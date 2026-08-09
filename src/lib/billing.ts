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
        setTimeout(() => onReady(), 1000);
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
      store.register({
        id: playId,
        type: CdvPurchase.ProductType.NON_CONSUMABLE,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
      });

      // Falls DB-ID anders ist, auch als Fallback registrieren
      if (playId !== productId) {
        try {
          store.register({
            id: productId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
        } catch (e) {}
      }

      // 2. Event-Listener
      store.when()
        .productUpdated((product: any) => {
          if (product.id === playId || product.id === productId) {
            safeOnReady();
          }
        })
        .ready(() => {
          safeOnReady();
        })
        .approved((transaction: any) => {
          try {
            transaction.finish();
            onSuccess(transaction);
          } catch (e) {
            console.error("Fehler beim Abschließen der Transaktion", e);
            onFailure("Fehler beim Bestätigen des Kaufs.");
          }
        })
        .cancelled(() => {
          onFailure("Kaufvorgang wurde abgebrochen.");
        })
        .error((error: any) => {
          console.error("Billing Error:", error);
          safeOnReady();
        });

      // 3. Safety Fallback Timeout (max. 3 Sek.)
      setTimeout(() => {
        safeOnReady();
      }, 3000);

      // 4. Store initialisieren
      store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
      
    } catch (error) {
      console.error("Fataler Fehler in Billing init:", error);
      onFailure("Bezahlsystem konnte nicht geladen werden.");
    }
  },

  startPurchase: (productId: string, onFailure?: (errorMsg: string) => void) => {
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

      if (!product) {
        console.error("Produkt im Store nicht gefunden:", playId);
        if (onFailure) {
          onFailure(`Produkt "${playId}" ist im Play Store noch nicht auf Status Aktiv. Bitte in Google Play Console prüfen.`);
        }
        return;
      }

      // v13 Syntax: Bevorzuge das erste Angebot (offer), ansonsten das Produktobjekt
      const targetOffer = (product.offers && product.offers.length > 0) ? product.offers[0] : product;
      const orderPromise = store.order(targetOffer);

      if (orderPromise && typeof orderPromise.then === 'function') {
        orderPromise.then((res: any) => {
          if (res && res.error) {
            if (onFailure) onFailure(`Play Store Rückmeldung: ${res.error.message || 'Kauf abgebrochen'}`);
          }
        }).catch((err: any) => {
          console.error("store.order catch:", err);
          if (onFailure) onFailure(`Fehler beim Bezahlstart: ${err?.message || 'Unbekannt'}`);
        });
      }
      
    } catch (error: any) {
      console.error("Fataler Fehler bei startPurchase:", error);
      if (onFailure) onFailure(`Bezahlfehler: ${error?.message || 'Unerwarteter Fehler'}`);
    }
  }
};