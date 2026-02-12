import { Service } from "../types/services";

export const SERVICES: Service[] = [
  // =========================================================
  // BRIDAL
  // =========================================================
  {
    id: "bridal",
    name: "Bridal",
    tagline: "Luxury bridal artistry by Chirag Sharma",
    images: ["/photos/chirag1.jpeg", "/photos/chirag2.jpeg"],
    packages: [
      {
        id: "bridal-signature",
        serviceId: "bridal",
        name: "Signature Bridal Makeup",
        price: 99999,
        features: [
          "Signature bridal look by Chirag",
          "Premium high-end luxury products",
          "Fully customized luxury finish",
          "Complimentary mini touch-up kit",
          "*Excluding travel and accommodation",
        ],
      },
      {
        id: "bridal-hd",
        serviceId: "bridal",
        name: "Luxury Bridal Makeup (HD / Brush)",
        price: 79999,
        features: [
          "HD brush technique",
          "Flawless long-wear photo-ready finish",
          "*Excluding travel and accommodation",
        ],
      },
      {
        id: "bridal-event",
        serviceId: "bridal",
        name: "Reception / Engagement / Cocktail",
        price: 59999,
        features: [
          "Glam event styling",
          "Customized according to outfit & occasion",
          "*Excluding travel and accommodation",
        ],
      },
    ],
  },

  // =========================================================
  // PARTY
  // =========================================================
  {
    id: "party",
    name: "Party",
    tagline: "Glam makeup for celebrations",
    images: ["/photos/chirag4.jpeg"],
    packages: [
      {
        id: "party-chirag",
        serviceId: "party",
        name: "Party Makeup – By Chirag Sharma",
        price: 19999,
        features: [
          "Luxury high-end products",
          "Event-specific styling",
          "*Excluding travel and accommodation",
        ],
      },
      {
        id: "party-senior",
        serviceId: "party",
        name: "Party Makeup – By Senior Artist",
        price: 6999,
        features: [
          "Professional party look",
          "*Excluding travel and accommodation",
        ],
      },
    ],
  },

  // =========================================================
  // HALDI / MEHENDI
  // =========================================================
  {
    id: "haldi-mehendi",
    name: "Cocktail",
    tagline: "Fresh, festive, radiant looks",
    images: ["/photos/chirag5.jpeg"],
    packages: [
      {
        id: "haldi-chirag",
        serviceId: "haldi-mehendi",
        name: "Haldi / Mehendi – By Chirag Sharma",
        price: 44999,
        features: [
          "Fresh festive finish",
          "Sweat-resistant glow makeup",
          "*Excluding travel and accommodation",
        ],
      },
      {
        id: "haldi-senior",
        serviceId: "haldi-mehendi",
        name: "Haldi / Mehendi – By Senior Artist",
        price: 19999,
        features: [
          "Soft traditional styling",
          "*Excluding travel and accommodation",
        ],
      },
    ],
  },

  // =========================================================
  // GROOM
  // =========================================================
  {
    id: "groom",
    name: "Groom",
    tagline: "Luxury groom styling",
    images: ["/photos/chirag3.jpeg"],
    packages: [
      {
        id: "groom-photo",
        serviceId: "groom",
        name: "Picture Perfect Photo-Ready Makeup",
        price: 14999,
        features: [
          "Luxury high-end products",
          "Hairstyling included",
          "*Excluding travel and accommodation",
        ],
      },
      {
        id: "groom-reception",
        serviceId: "groom",
        name: "Wedding Reception Groom Makeup",
        price: 19999,
        features: [
          "Soft flawless HD finish",
          "Hairstyling included",
          "*Excluding travel and accommodation",
        ],
      },
    ],
  },
];
