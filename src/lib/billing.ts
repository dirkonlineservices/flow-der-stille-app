interface BillingInitProps {
  productId: string;
  onReady: () => void;
  onSuccess: () => void;
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
            onSuccess();
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

  startPurchase: (productId: string) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      
      if (!CdvPurchase || !CdvPurchase.store) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('mock_purchase_failed'));
        }, 1500);
        return;
      }

      const store = CdvPurchase.store;
      const product = store.get(productId, CdvPurchase.Platform.GOOGLE_PLAY);

      if (!product) {
        console.error("Produkt nicht gefunden:", productId);
        return;
      }

      // Natives Google Play Bezahlfenster aufrufen
      store.order(product);
      
    } catch (error) {
      console.error("Fataler Fehler bei startPurchase:", error);
    }
  }
};