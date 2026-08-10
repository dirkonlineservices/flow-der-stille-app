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

  // 1. Produkte als Array initialisieren (Batch-Registrierung aller verfügbaren Produkte)
  registerAllProducts: (products: any[]) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) return;
      const store = CdvPurchase.store;

      const registeredSet = new Set<string>();

      products.forEach((p) => {
        const playId = getPlayStoreProductId(p);
        const dbId = typeof p === 'object' ? p.id : p;

        [playId, dbId].forEach((idToReg) => {
          if (idToReg && !registeredSet.has(idToReg)) {
            registeredSet.add(idToReg);
            try {
              store.register({
                id: idToReg,
                type: CdvPurchase.ProductType.NON_CONSUMABLE,
                platform: CdvPurchase.Platform.GOOGLE_PLAY
              });
            } catch (e) {}
          }
        });
      });
    } catch (err) {
      console.warn("registerAllProducts notice:", err);
    }
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

      try {
        store.register({
          id: playId,
          type: CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: CdvPurchase.Platform.GOOGLE_PLAY
        });
      } catch (e) {}

      if (playId !== productId) {
        try {
          store.register({
            id: productId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
        } catch (e) {}
      }

      // a) Produkt-Updates
      try {
        store.when().productUpdated((product: any) => {
          if (product.id === playId || product.id === productId) {
            safeOnReady();
            if (product.owned === true) {
              pushToDataLayer('purchase_restored', { item_id: product.id });
            }
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
            const verificationResult = await onSuccess(transaction);
            const confirmedOrderId = verificationResult?.orderId || txId;
            const confirmedItemName = verificationResult?.productTitle || verificationResult?.productId || playId;
            const confirmedPrice = verificationResult?.price || 1.99;

            if (typeof transaction.finish === 'function') {
              await transaction.finish();
            }

            // 3. Dynamisches Tracking für "purchase" mit spezifischer item_id, item_name & price
            pushToDataLayer('purchase', {
              ecommerce: {
                transaction_id: confirmedOrderId,
                value: confirmedPrice,
                currency: 'EUR',
                items: [{
                  item_id: verificationResult?.productId || playId,
                  item_name: confirmedItemName,
                  price: confirmedPrice,
                  quantity: 1
                }]
              }
            });
          } catch (err: any) {
            console.error("Fehler bei der Kaufbestätigung:", err);
            pushToDataLayer('purchase_failed', { error_message: err?.message || 'Verifizierung fehlgeschlagen' });
            onFailure(err?.message || "Kauf konnte von Supabase nicht verifiziert werden.");
          }
        });
      } catch (e) {}

      // c) Globales Fehler-Handling
      try {
        store.error((error: any) => {
          let errJson = "";
          try { errJson = JSON.stringify(error); } catch (e) { errJson = String(error); }
          console.error("Billing Error:", errJson, error?.message, error?.code);

          const errorMsg = error?.message || (typeof error === 'string' ? error : errJson);
          const isAlreadyOwned = (error?.code === 6) || 
                                (errorMsg && (
                                  errorMsg.includes("ITEM_ALREADY_OWNED") || 
                                  errorMsg.includes("already owned") || 
                                  errorMsg.includes("bereits gekauft")
                                ));

          safeOnReady();

          if (isAlreadyOwned) {
            pushToDataLayer('purchase_restored', { item_id: playId });
            onFailure("Kauf gefunden. Inhalte werden synchronisiert...");
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
      } catch (e) {}

      if (typeof store.ready === 'function') {
        try {
          store.ready(() => safeOnReady());
        } catch (e) { safeOnReady(); }
      }

      try {
        store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
      } catch (initErr) {
        try { store.initialize(); } catch (e2) {}
      }

      setTimeout(() => safeOnReady(), 1000);
      
    } catch (error) {
      console.error("Fehler in Billing init:", error);
      onReady();
    }
  },

  // 3. Dynamisches Tracking für "begin_checkout" mit spezifischer item_id, item_name & price
  startPurchase: async (produkt: any, onFailure?: (errorMsg: string) => void) => {
    try {
      const CdvPurchase = (window as any).CdvPurchase;
      
      if (!CdvPurchase || !CdvPurchase.store) {
        if (onFailure) onFailure("Google Play Store Bezahl-Plugin auf diesem Gerät nicht verfügbar.");
        return;
      }

      const dbId = typeof produkt === 'object' ? produkt.id : produkt;
      const playId = getPlayStoreProductId(produkt);
      const itemName = (typeof produkt === 'object' && produkt.titel) ? produkt.titel : (typeof produkt === 'object' && produkt.title) ? produkt.title : dbId;
      const itemPrice = (typeof produkt === 'object' && produkt.preis) ? parseFloat(produkt.preis) : 1.99;

      // 📊 GA4 DataLayer Event (begin_checkout) mit DYNAMISCHEN Werten
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

      let product = store.get(playId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(playId)
                 || store.get(dbId, CdvPurchase.Platform.GOOGLE_PLAY)
                 || store.get(dbId);

      if (!product) {
        try {
          store.register({
            id: playId,
            type: CdvPurchase.ProductType.NON_CONSUMABLE,
            platform: CdvPurchase.Platform.GOOGLE_PLAY
          });
          product = store.get(playId) || store.get(dbId);
        } catch (regErr) {}
      }

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
          } catch (eOffer) {}
        }
      }

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
          } catch (eStr) {}
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