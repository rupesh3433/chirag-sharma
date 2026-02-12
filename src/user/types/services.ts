// ============================================
// Domain types for makeup artist booking system
// ============================================

export interface Service {
    id: string;
    name: string;
    tagline?: string;
    images: string[];
    packages: Package[];
  }
  
  export interface Package {
    id: string;
    serviceId: string;
    name: string;
    price: number;
    features: string[];
  }
  
  export interface SelectedPackage {
    serviceId: string;
    packageId: string;
    packageName: string;
    price: number;
    quantity: 1; // fixed, reserved for future
  }
  
  export interface DiscountRule {
    minPackages: number;
    discountPercent: number;
  }
  
  export interface PriceBreakdown {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
  }
  
  export interface BookingFormData {
    services: Array<{
      serviceId: string;
      serviceName: string;
      packages: SelectedPackage[];
    }>;
    userDetails: {
      name: string;
      contact: string;
      eventDate: string;
      location: string;
      notes: string;
    };
    pricing: PriceBreakdown;
  }