import React from 'react';
import PremiumDashboard from '../components/PremiumDashboard';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { generateSchemaOrgProducts } from '../lib/googleShoppingFeed';

export default function Premium() {
  const { user } = useAuth();
  const session = user ? { user } : null;
  const productsSchema = generateSchemaOrgProducts();

  return (
    <div className="pt-20">
      <SEO 
        title="Ruhe-Shop – Hörbücher, Meditationen & Selbsthypnosen (Ohne Abo)"
        description="Entdecke Hörbücher, geführte Meditationen und gezielte Selbsthypnosen einzeln ab 1,99 € ohne monatliches Abonnement im Flow der Stille Ruhe-Shop. Sofort anhören & downloaden."
        canonicalUrl="https://flow-der-stille.de/premium"
        keywords="Ruhe-Shop, Meditation ohne Abo, Hörbücher kaufen, Selbsthypnose MP3, Flow der Stille Shop, Lisa Ragusa, Jacqueline Schmetzer, Audio Download Meditation"
        schemaJson={productsSchema}
      />
      <PremiumDashboard />
    </div>
  );
}
