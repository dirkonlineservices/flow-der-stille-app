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
        title="Premium Mediathek – Hörbücher, Meditationen & Selbsthypnosen"
        description="Entdecke exklusive Hörbücher, geführte Meditationen und gezielte Selbsthypnosen einzeln ab 1,99 € ohne monatliches Abonnement. Sofort anhören & downloaden."
        schemaJson={productsSchema}
      />
      <PremiumDashboard />
    </div>
  );
}
