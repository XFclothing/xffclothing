// ─── HELPER: color galleries ────────────────────────────────
const essentialTeeGallery = {
  black: ["/images/product-tee-essential-black.png", "/images/product-tee-essential-black-model.png"],
  grey:  ["/images/product-tee-essential-grey.png",  "/images/product-tee-essential-grey-model.png"],
  white: ["/images/product-tee-essential-white.png", "/images/product-tee-essential-white-model.png"],
};

const slimTeeGallery = {
  black: ["/images/product-tee-slim-black.png", "/images/product-tee-slim-black-model.png"],
  grey:  ["/images/product-tee-slim-grey.png",  "/images/product-tee-slim-grey-model.png"],
  white: ["/images/product-tee-slim-white.png", "/images/product-tee-slim-white-model.png"],
};

const relaxedTeeGallery = {
  black: ["/images/product-tee-relaxed-black.png", "/images/product-tee-relaxed-black-model.png"],
  grey:  ["/images/product-tee-relaxed-grey.png",  "/images/product-tee-relaxed-grey-model.png"],
  white: ["/images/product-tee-relaxed-white.png", "/images/product-tee-relaxed-white-model.png"],
};

// XF Oversize Hoodie — BLANK/PLAIN
const oversizeHoodieGallery = {
  black: [
    "/images/product-hoodie-oversize-black.png",
    "/images/product-hoodie-oversize-black-flat.png",
    "/images/product-hoodie-oversize-black-model.png",
  ],
  grey: [
    "/images/product-hoodie-oversize-grey.png",
    "/images/product-hoodie-oversize-grey-flat.png",
    "/images/product-hoodie-oversize-black-model.png",
  ],
  white: [
    "/images/product-hoodie-oversize-white.png",
    "/images/product-hoodie-oversize-white-flat.png",
    "/images/product-hoodie-oversize-black-model.png",
  ],
};

// XF Oversized Hoodie (Design) — blue piping seam lines
const oversizedHoodieGallery = {
  black: [
    "/images/product-hoodie-design-black.png",
    "/images/product-hoodie-design-black-model.png",
  ],
  grey: [
    "/images/product-hoodie-design-grey.png",
    "/images/product-hoodie-design-black-model.png",
  ],
  white: [
    "/images/product-hoodie-design-white.png",
    "/images/product-hoodie-design-black-model.png",
  ],
};

// XF Hoodie — blue piping seam lines, regular fit
const xfHoodieGallery = {
  black: [
    "/images/product-hoodie-xf-black.png",
    "/images/product-hoodie-xf-black-model.png",
  ],
  grey: [
    "/images/product-hoodie-xf-grey.png",
    "/images/product-hoodie-xf-black-model.png",
  ],
  white: [
    "/images/product-hoodie-xf-white.png",
    "/images/product-hoodie-xf-black-model.png",
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

function oversizeHoodieColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-hoodie-oversize-black.png", gallery: oversizeHoodieGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-hoodie-oversize-grey.png",  gallery: oversizeHoodieGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-hoodie-oversize-white.png", gallery: oversizeHoodieGallery.white },
  ];
}

function oversizedHoodieColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-hoodie-design-black.png", gallery: oversizedHoodieGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-hoodie-design-grey.png",  gallery: oversizedHoodieGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-hoodie-design-white.png", gallery: oversizedHoodieGallery.white },
  ];
}

function xfHoodieColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-hoodie-xf-black.png", gallery: xfHoodieGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-hoodie-xf-grey.png",  gallery: xfHoodieGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-hoodie-xf-white.png", gallery: xfHoodieGallery.white },
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
    name: "XF Oversized Hoodie (Design)",
    category: "hoodie",
    price: 60,
    description: "Oversized Fit. Big and roomy — pure streetwear statement. Signature X-seam panel detail. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-design-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: oversizedHoodieColors(),
  },
  {
    id: "xf-hoodie-oversize",
    name: "XF Oversize Hoodie",
    category: "hoodie",
    price: 58,
    description: "Oversize Fit. Clean and minimal — timeless streetwear essential. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-oversize-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: oversizeHoodieColors(),
  },
  {
    id: "xf-hoodie-cropped",
    name: "XF Hoodie",
    category: "hoodie",
    price: 52,
    description: "Regular Fit. Signature seam detail — distinctive XF design. Heavy Cotton. Premium Quality.",
    image: "/images/product-hoodie-xf-black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: xfHoodieColors(),
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
