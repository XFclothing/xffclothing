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
    "/images/product-jogger-baggy.avif",
    "/images/product-jogger-black.webp",
    "/images/product-jogger-black-flat.webp",
  ],
  grey: [
    "/images/product-jogger-grey.webp",
    "/images/product-jogger-grey-flat.webp",
  ],
  white: [
    "/images/product-jogger-white.webp",
  ],
};


const openHemGallery = {
  black: [
    "/images/product-jogger-openhemm-black.webp",
    "/images/product-jogger-openhem-black-flat.webp",
  ],
  grey: [
    "/images/product-jogger-openhem-grey.webp",
    "/images/product-jogger-openhem-grey-flat.webp",
  ],
  white: [
    "/images/product-jogger-openhem-white.webp",
    "/images/product-jogger-openhem-white-flat.webp",
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


function openHemColors() {
  return [
    { name: "Black", value: "#1a1a1a", image: "/images/product-jogger-openhemm-black.webp", gallery: openHemGallery.black },
    { name: "Grey",  value: "#888888", image: "/images/product-jogger-openhem-grey.webp",   gallery: openHemGallery.grey  },
    { name: "White", value: "#f5f5f5", image: "/images/product-jogger-openhem-white.webp",  gallery: openHemGallery.white },
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
    image: "/images/product-jogger-baggy.avif",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#1a1a1a", image: "/images/product-jogger-baggy.avif", gallery: baggyJoggerGallery.black },
      { name: "Grey",  value: "#888888", image: "/images/product-jogger-grey.webp",   gallery: baggyJoggerGallery.grey  },
      { name: "White", value: "#f5f5f5", image: "/images/product-jogger-white.webp",  gallery: baggyJoggerGallery.white },
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
    id: "xf-tee-oversized",
    name: "XF Oversize Tee",
    category: "tshirt",
    price: 38,
    description: "Oversized Fit. Very wide cut — pure streetwear style. 100% Heavyweight Cotton.",
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
    id: "xf-jogger-openhem",
    name: "XF JOGGER Open Hem",
    category: "jogger",
    price: 45,
    description: "Open Hem. No elastic at the bottom — loose and wide. Soft Fleece Interior. Streetwear Style.",
    image: "/images/product-jogger-openhemm-black.webp",
    sizes: ["S", "M", "L", "XL"],
    colors: openHemColors(),
  },
];
