import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/context/StoreSettingsContext";

interface Color {
  name: string;
  value: string;
  image: string;
  gallery?: string[];
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    colors?: Color[];
  };
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [, navigate] = useLocation();
  const [hoveredColor, setHoveredColor] = useState<number | null>(null);
  const [cardHovered, setCardHovered] = useState(false);
  const { comingSoon, outOfStock, loaded } = useStoreSettings();

  const colors = product.colors;
  const activeColor = colors
    ? hoveredColor !== null
      ? colors[hoveredColor]
      : colors[0]
    : null;

  const baseImage = activeColor ? activeColor.image : product.image;
  const hoverImage = activeColor?.gallery?.[1] ?? null;
  const displayImage = cardHovered && hoverImage ? hoverImage : baseImage;

  const isComingSoon = loaded && comingSoon;
  const isOutOfStock = loaded && !comingSoon && outOfStock.includes(product.id);
  const unavailable = isComingSoon || isOutOfStock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col gap-4"
    >
      <Link
        href={`/shop/${product.id}`}
        className="aspect-[3/4] relative overflow-hidden bg-muted cursor-pointer"
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
      >
        {/* Base image */}
        <img
          src={baseImage}
          alt={product.name}
          loading="lazy"
          className={`object-cover w-full h-full absolute inset-0 transition-all duration-500 ease-out group-hover:scale-105 ${unavailable ? "opacity-50" : ""}`}
        />

        {/* Model hover image — fades in on hover */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} worn`}
            loading="lazy"
            className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ease-out group-hover:scale-105 ${
              cardHovered ? "opacity-100" : "opacity-0"
            } ${unavailable ? "opacity-50" : ""}`}
          />
        )}

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/90 bg-black/60 px-4 py-2 backdrop-blur-sm">
              {isComingSoon ? "Coming Soon" : "Out of Stock"}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Link href={`/shop/${product.id}`} className="font-medium text-lg tracking-wide hover:underline underline-offset-4">
            {product.name}
          </Link>
          <span className="text-muted-foreground">€{product.price}</span>
        </div>

        {colors && colors.length > 0 && (
          <div className="flex gap-2 items-center">
            {colors.map((color, idx) => (
              <button
                key={color.name}
                title={color.name}
                onMouseEnter={() => setHoveredColor(idx)}
                onMouseLeave={() => setHoveredColor(null)}
                onClick={() => navigate(`/shop/${product.id}`)}
                className="w-4 h-4 rounded-full border border-border hover:scale-125 transition-transform duration-200"
                style={{ backgroundColor: color.value }}
              />
            ))}
            <span className="text-xs text-muted-foreground tracking-wide ml-1">
              {colors.length} colors
            </span>
          </div>
        )}

        {unavailable ? (
          <Button
            variant="outline"
            disabled
            className="w-full uppercase tracking-widest rounded-none border-primary/10 text-foreground/30 cursor-not-allowed"
          >
            {isComingSoon ? "Coming Soon" : "Out of Stock"}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full uppercase tracking-widest rounded-none border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => navigate(`/shop/${product.id}`)}
          >
            Select Size
          </Button>
        )}
      </div>
    </motion.div>
  );
}
