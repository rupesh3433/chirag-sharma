import {
    SelectedPackage,
    DiscountRule,
    PriceBreakdown,
  } from "../types/services";
  
  const DISCOUNT_TIERS: DiscountRule[] = [
    { minPackages: 6, discountPercent: 15 },
    { minPackages: 4, discountPercent: 10 },
    { minPackages: 2, discountPercent: 5 },
  ];
  
  export function calculatePriceBreakdown(
    selectedPackages: SelectedPackage[]
  ): PriceBreakdown {
    if (!Array.isArray(selectedPackages) || selectedPackages.length === 0) {
      return {
        subtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        total: 0,
      };
    }
  
    const subtotal = selectedPackages.reduce(
      (sum, pkg) => sum + (pkg.price ?? 0),
      0
    );
  
    const count = selectedPackages.length;
  
    // 🔥 Find highest eligible tier
    const applicableRule =
      DISCOUNT_TIERS.find((rule) => count >= rule.minPackages) ?? null;
  
    const discountPercent = applicableRule?.discountPercent ?? 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;
  
    return {
      subtotal,
      discountPercent,
      discountAmount,
      total,
    };
  }
  