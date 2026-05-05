// ─── HELPER: color galleries ────────────────────────────────
const teeGallery = {
  black: [
    "/images/product-tee-black.webp",
    "/images/product-tee-black-back.webp",
  ],
  grey: [
    "/images/product-tee-grey.webp",
    "/images/product-tee-grey-back.webp",
  ],
  white: [
    "/images/product-tee-white.webp",
    "/images/product-tee-white-back.webp",
  ],
};

const hoodieGallery = {
  black: [
    "/images/product-hoodie-black.webp",
    "/images/product-hoodie-black-back.webp",
    "/images/product-hoodie-black-flat.webp",
  ],
  grey: [
    "/images/product-hoodie-grey.webp",
    "/images/product-hoodie-grey-flat.webp",
  ],
  white: [
    "/images/product-hoodie-white.webp",
    "/images/product-hoodie-white-back.webp",
    "/images/product-hoodie-white-flat.webp",
  ],
};


const baggyJoggerGallery = {
  black: [
    "/images/product-jogger-baggy-black.png",
    "/images/product-jogger-baggy-black-flat.png",
    "/images/product-jogger-baggy-black-folded.png",
  ],
  grey: [
    "/images/product-jogger-baggy-grey.png",
    "/images/product-jogger-baggy-grey-flat.png",
    "/images/product-jogger-baggy-grey-folded.png",
  ],
  white: [
    "/images/product-jogger-baggy-white.png",
    "/images/product-jogger-baggy-white-flat.png",
    "/images/product-jogger-baggy-white-folded.png",
  ],
};


const sideStripeGallery = {
  black: [
    "/images/product-jogger-stripe-black.png",
    "/images/product-jogger-stripe-black-flat.png",
    "/images/product-jogger-stripe-black-folded.png",
  ],
  grey: [
    "/images/product-jogger-stripe-grey.png",
    "/images/product-jogger-stripe-grey-flat.png",
    "/images/product-jogger-stripe-grey-folded.png",
  ],
  white: [
    "/images/product-jogger-stripe-white.png",
    "/images/product-jogger-stripe-white-flat.png",
    "/images/product-jogger-stripe-white-folded.png",
  ],
};

// ─── SHARED COLOR DEFINITIONS ───────────────────────────────
function teeColors(defaultColor: "black" | "white") {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-tee-black.webp", gallery: teeGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-tee-grey.webp",  gallery: teeGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-tee-white.webp", gallery: teeGallery.white },
  ];
}

function hoodieColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-hoodie-black.webp", gallery: hoodieGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-hoodie-grey.webp",  gallery: hoodieGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-hoodie-white.webp", gallery: hoodieGallery.white },
  ];
}


function sideStripeColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-jogger-stripe-black.png", gallery: sideStripeGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-jogger-stripe-grey.png",  gallery: sideStripeGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-jogger-stripe-white.png", gallery: sideStripeGallery.white },
  ];
}

// ─── FEATURED ───────────────────────────────────────────────
export const featured = [
  {
    id: "xf-tee-essential",
    name: "XF Essential Tee",
    category: "tshirt",
    price: 35,
    description: "Regular Fit. Classic cut for everyday wear. 100% Heavyweight Cotton. Unisex.",
    image: "/images/product-tee-white.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: teeColors("white"),
  },
  {
    id: "xf-jogger-baggy",
    name: "XF JOGGER Baggy Fit",
    category: "jogger",
    price: 50,
    description: "Baggy Fit. Very wide cut — pure streetwear style. Soft Fleece Interior. Unisex.",
    image: "/images/product-jogger-baggy-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#1a1a1a", image: "/images/product-jogger-baggy-black.png", gallery: baggyJoggerGallery.black },
      { name: "Grey",  value: "#888888", image: "/images/product-jogger-baggy-grey.png",  gallery: baggyJoggerGallery.grey  },
      { name: "White", value: "#f5f5f5", image: "/images/product-jogger-baggy-white.png", gallery: baggyJoggerGallery.white },
    ],
  },
];

export const products = [
  ...featured,

  // ─── T-SHIRTS ───────────────────────────────────────────────
  {
    id: "xf-tee-slim",
    name: "XF Slim Fit Tee",
    category: "tshirt",
    price: 33,
    description: "Slim Fit. Close to the body — athletic look. 100% Heavyweight Cotton.",
    image: "/images/product-tee-black.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: teeColors("black"),
  },
  {
    id: "xf-tee-relaxed",
    name: "XF Relaxed Fit Tee",
    category: "tshirt",
    price: 38,
    description: "Relaxed Fit. Comfortable and easy-going — effortless everyday style. 100% Heavyweight Cotton.",
    image: "/images/product-tee-black.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: teeColors("black"),
  },

  // ─── HOODIES ────────────────────────────────────────────────
  {
    id: "xf-hoodie-oversized",
    name: "XF Oversize Hoodie",
    category: "hoodie",
    price: 60,
    description: "Oversized Fit. Big and roomy — streetwear statement. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-black.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: hoodieColors(),
  },
  {
    id: "xf-hoodie-boxy",
    name: "XF Boxy Hoodie",
    category: "hoodie",
    price: 58,
    description: "Boxy Fit. Wide and cropped — modern look. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-grey.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: hoodieColors(),
  },
  {
    id: "xf-hoodie-cropped",
    name: "XF Cropped Hoodie",
    category: "hoodie",
    price: 52,
    description: "Cropped Fit. Short cut — trendy fashion piece. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-black.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: hoodieColors(),
  },

  // ─── JOGGER ─────────────────────────────────────────────────
  {
    id: "xf-jogger-sidestripe",
    name: "XF JOGGER Side Stripe",
    category: "jogger",
    price: 45,
    description: "Straight Fit. Clean side stripe running down the full leg — athletic streetwear look. Soft Interior. Unisex.",
    image: "/images/product-jogger-stripe-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: sideStripeColors(),
  },
];
