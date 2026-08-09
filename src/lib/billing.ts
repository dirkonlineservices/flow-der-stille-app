interface BillingInitProps {
  productId: string;
  onReady: () => void;
  onSuccess: (transaction?: any) => void;
  onFailure: (errorMsg: string) => void;
}

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

      let isReadyCalled = false;
      const safeOnReady = () => {
        if (!isReadyCalled) {
          isReadyCalled = true;
          onReady();
        }
      };

      // 1. Produkt sicher registrieren (Strikte v13 Syntax)
      store.register({
        id: productId,
        type: CdvPurchase.ProductType.NON_CONSUMABLE,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
      });

      // 2. Event-Listener (Mit Try-Catch gekapselt gegen WSOD)
      store.when()
        .productUpdated((product: any) => {
          if (product.id === productId) {
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
          // Bei nicht-kritischen Warnings aktivieren wir dennoch den Button
          safeOnReady();
        });

      // 3. Safety Fallback Timeout (max. 3 Sek.), damit Button nie auf 'Verbinde Play Store...' hängen bleibt
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
      const playProductId = productId.replace(/&/g, '_').replace(/__/g, '_');

      let product = store.get(productId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(productId)
                 || store.get(playProductId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(playProductId);

      if (!product) {
        try {
          store.register({
            id: productId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
          product = store.get(productId) || store.get(playProductId);
        } catch (regErr) {
          console.warn("Auto-register fallback notice:", regErr);
        }
      }

      if (!product) {
        console.error("Produkt im Store nicht gefunden:", productId);
        if (onFailure) {
          onFailure(`Produkt "${productId}" ist im Play Store noch nicht auf Status Aktiv. Bitte in Google Play Console prüfen.`);
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