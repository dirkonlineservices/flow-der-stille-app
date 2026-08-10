interface BillingInitProps {
  productId: string;
  onReady: () => void;
  onSuccess: (transaction?: any) => Promise<any> | any;
  onFailure: (errorMsg: string) => void;
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

// 🛑 Set zur Verhinderung von Endlosschleifen (Idempotenz-Sperre)
const processedTransactionsSet = new Set<string>();

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

      // 2. Striktes Decoupling der Event-Listener (OHNE Method Chaining)
      
      // a) Produkt-Updates & Proaktiver Ownership Check
      try {
        store.when().productUpdated((product: any) => {
          if (product.id === playId || product.id === productId) {
            safeOnReady();
            if (product.owned === true) {
              pushToDataLayer('purchase_restored', { item_id: product.id });
            }
          }
        });
      } catch (e) {
        console.warn("productUpdated listener notice:", e);
      }

      // b) Erfolgreicher Kauf (Approved) - transaction.finish() NUR wenn Supabase Status 200 liefert!
      try {
        store.when().approved(async (transaction: any) => {
          const txId = transaction?.transactionId || transaction?.id || transaction?.purchaseToken || `tx_${Date.now()}`;

          // 🛑 Idempotenz-Sperre: Verhindere doppelte Verarbeitung
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
            // 1. Sende Receipt/PurchaseToken an Supabase Edge Function (Backend Verification & DB Insert)
            const verificationResult = await onSuccess(transaction);
            const confirmedOrderId = verificationResult?.orderId || txId;

            // 2. WICHTIG: transaction.finish() ausschließlich aufrufen, wenn Supabase 200 OK zurückgibt!
            if (typeof transaction.finish === 'function') {
              await transaction.finish();
            }

            // 3. GA4 E-Commerce Tracking (DataLayer Push NACH transaction.finish())
            pushToDataLayer('purchase', {
              ecommerce: {
                transaction_id: confirmedOrderId,
                value: 1.99,
                currency: 'EUR',
                items: [{
                  item_name: 'Premium Freischaltung',
                  item_category: 'In App Kauf',
                  price: 1.99,
                  quantity: 1
                }]
              }
            });
          } catch (err: any) {
            console.error("Fehler bei der Kaufbestätigung (Supabase Backend):", err);
            pushToDataLayer('purchase_failed', { error_message: err?.message || 'Verifizierung fehlgeschlagen' });
            onFailure(err?.message || "Kauf konnte von Supabase nicht verifiziert werden.");
            // Keinem ungültigen Kauf ein finish() ausstellen!
          }
        });
      } catch (e) {
        console.warn("approved listener notice:", e);
      }

      // c) Globales Fehler-Handling (store.error) - Sauberes Formatiertes Logging & Graceful ITEM_ALREADY_OWNED
      try {
        store.error((error: any) => {
          let errJson = "";
          try { errJson = JSON.stringify(error); } catch (e) { errJson = String(error); }
          
          // 1. Error-Logging lesbar machen (ohne [object Object])
          console.error("Billing Error:", errJson, error?.message, error?.code);

          const errorMsg = error?.message || (typeof error === 'string' ? error : errJson);
          const isAlreadyOwned = (error?.code === 6) || 
                                (errorMsg && (
                                  errorMsg.includes("ITEM_ALREADY_OWNED") || 
                                  errorMsg.includes("already owned") || 
                                  errorMsg.includes("bereits gekauft") ||
                                  errorMsg.includes("Already Owned")
                                ));

          // 2. Infinite Error Loop verhindern: Spinner sofort killen
          safeOnReady();

          // 4. Graceful Error Handling für "Already Owned" (Code 6)
          if (isAlreadyOwned) {
            console.log("Graceful Handling für ITEM_ALREADY_OWNED getriggert.");
            pushToDataLayer('purchase_restored', { item_id: playId });
            onFailure("Kauf gefunden. Inhalte werden synchronisiert...");

            // Triggere transaction.finish() für das Produkt, um den Google Cache zu leeren
            try {
              const p = store.get(playId) || store.get(productId);
              if (p && p.transaction && typeof p.transaction.finish === 'function') {
                p.transaction.finish();
              }
            } catch (fErr) {}
            return;
          }

          pushToDataLayer('purchase_failed', { error_message: errorMsg || 'Billing Error' });
          onFailure(errorMsg || "Kaufvorgang konnte nicht abgeschlossen werden.");
        });
      } catch (e) {
        console.warn("store.error listener notice:", e);
      }

      // 3. store.ready() als eigenständiger Aufruf
      if (typeof store.ready === 'function') {
        try {
          store.ready(() => {
            safeOnReady();
          });
        } catch (e) {
          safeOnReady();
        }
      }

      // 4. store.initialize() erst aufrufen, NACHDEM alle Listener isoliert registriert sind
      try {
        store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
      } catch (initErr) {
        console.warn("Store initialize notice:", initErr);
        try {
          store.initialize();
        } catch (e2) {
          console.warn("Store initialize fallback notice:", e2);
        }
      }

      // 5. Safety Fallback Timeout (max. 1 Sek.), damit UI nie hängen bleibt
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

      // 📊 GA4 DataLayer Event (begin_checkout) kurz vor store.order(product)
      pushToDataLayer('begin_checkout', {
        ecommerce: {
          items: [{
            item_name: 'Premium Freischaltung',
            item_category: 'In App Kauf',
            price: 1.99,
            currency: 'EUR'
          }]
        }
      });

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
            if (res && res.error) {
              const isOwned = res.error.code === 6 || String(res.error.message).includes("ITEM_ALREADY_OWNED");
              if (isOwned) {
                pushToDataLayer('purchase_restored', { item_id: playId });
                if (onFailure) onFailure("Kauf gefunden. Inhalte werden synchronisiert...");
              } else {
                pushToDataLayer('purchase_failed', { error_message: res.error.message || 'Kauf abgebrochen' });
                if (onFailure) onFailure(`Play Store: ${res.error.message || 'Kauf abgebrochen'}`);
              }
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
          if (res && res.error) {
            const isOwned = res.error.code === 6 || String(res.error.message).includes("ITEM_ALREADY_OWNED");
            if (isOwned) {
              pushToDataLayer('purchase_restored', { item_id: playId });
              if (onFailure) onFailure("Kauf gefunden. Inhalte werden synchronisiert...");
            } else {
              pushToDataLayer('purchase_failed', { error_message: res.error.message || 'Kauf abgebrochen' });
              if (onFailure) onFailure(`Play Store Rückmeldung: ${res.error.message || 'Kauf abgebrochen'}`);
            }
          }
          return;
        } catch (eOrder: any) {
          console.warn("store.order(targetOffer) notice:", eOrder);
          // Versuche 3: Direct String Fallback store.order(playId)
          try {
            const resStr = await store.order(playId);
            if (resStr && resStr.error) {
              const isOwned = resStr.error.code === 6 || String(resStr.error.message).includes("ITEM_ALREADY_OWNED");
              if (isOwned) {
                pushToDataLayer('purchase_restored', { item_id: playId });
                if (onFailure) onFailure("Kauf gefunden. Inhalte werden synchronisiert...");
              } else {
                pushToDataLayer('purchase_failed', { error_message: resStr.error.message || 'Kauf abgebrochen' });
                if (onFailure) onFailure(`Play Store Rückmeldung: ${resStr.error.message || 'Kauf abgebrochen'}`);
              }
            }
            return;
          } catch (eStr) {
            console.error("store.order(playId) fallback failed:", eStr);
          }
        }
      }

      if (onFailure) {
        pushToDataLayer('purchase_failed', { error_message: 'Widget konnte nicht geöffnet werden' });
        onFailure(`Google Play Bezahl-Widget für "${playId}" konnte nicht geöffnet werden.`);
      }
      
    } catch (error: any) {
      console.error("Fataler Fehler bei startPurchase:", error);
      pushToDataLayer('purchase_failed', { error_message: error?.message || 'Unerwarteter Fehler' });
      if (onFailure) onFailure(`Bezahlfehler: ${error?.message || 'Unerwarteter Fehler'}`);
    }
  }
};