// ─── HELPER: color galleries ────────────────────────────────
const essentialTeeGallery = {
  black: ["/images/product-tee-essential-black.png", "/images/product-tee-black-back.webp"],
  grey:  ["/images/product-tee-essential-grey.png",  "/images/product-tee-grey-back.webp"],
  white: ["/images/product-tee-essential-white.png", "/images/product-tee-white-back.webp"],
};

const slimTeeGallery = {
  black: ["/images/product-tee-slim-black.png", "/images/product-tee-black-back.webp"],
  grey:  ["/images/product-tee-slim-grey.png",  "/images/product-tee-grey-back.webp"],
  white: ["/images/product-tee-slim-white.png", "/images/product-tee-white-back.webp"],
};

const relaxedTeeGallery = {
  black: ["/images/product-tee-relaxed-black.png", "/images/product-tee-black-back.webp"],
  grey:  ["/images/product-tee-relaxed-grey.png",  "/images/product-tee-grey-back.webp"],
  white: ["/images/product-tee-relaxed-white.png", "/images/product-tee-white-back.webp"],
};

const hoodieGallery = {
  black: [
    "/images/product-hoodie-black.png",
    "/images/product-hoodie-black-flat.png",
    "/images/product-hoodie-black-folded.png",
  ],
  grey: [
    "/images/product-hoodie-grey.png",
    "/images/product-hoodie-grey-flat.png",
    "/images/product-hoodie-grey-folded.png",
  ],
  white: [
    "/images/product-hoodie-white.png",
    "/images/product-hoodie-white-flat.png",
    "/images/product-hoodie-white-folded.png",
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
function essentialTeeColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-tee-essential-black.png", gallery: essentialTeeGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-tee-essential-grey.png",  gallery: essentialTeeGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-tee-essential-white.png", gallery: essentialTeeGallery.white },
  ];
}

function slimTeeColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-tee-slim-black.png", gallery: slimTeeGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-tee-slim-grey.png",  gallery: slimTeeGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-tee-slim-white.png", gallery: slimTeeGallery.white },
  ];
}

function relaxedTeeColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-tee-relaxed-black.png", gallery: relaxedTeeGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-tee-relaxed-grey.png",  gallery: relaxedTeeGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-tee-relaxed-white.png", gallery: relaxedTeeGallery.white },
  ];
}

function hoodieColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-hoodie-black.png", gallery: hoodieGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-hoodie-grey.png",  gallery: hoodieGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-hoodie-white.png", gallery: hoodieGallery.white },
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
    image: "/images/product-tee-essential-white.png",
    sizes: ["S", "M", "L", "XL"],
    colors: essentialTeeColors(),
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
    image: "/images/product-tee-slim-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: slimTeeColors(),
  },
  {
    id: "xf-tee-relaxed",
    name: "XF Relaxed Fit Tee",
    category: "tshirt",
    price: 38,
    description: "Relaxed Fit. Comfortable and easy-going — effortless everyday style. 100% Heavyweight Cotton.",
    image: "/images/product-tee-relaxed-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: relaxedTeeColors(),
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
