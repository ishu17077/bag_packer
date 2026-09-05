"use client";

import React, { useState } from "react";
import { Product } from "@/lib/products-data";
import { Star, CheckCircle2, Sparkles, ShoppingBag, Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
  rank: number;
  whyMatched: string;
  score: number;
  onQuickView?: (product: Product, whyMatched: string, score: number) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  rank,
  whyMatched,
  score,
  onQuickView,
  onAddToCart,
}) => {
  const [imgError, setImgError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  return (
    <div
      onClick={() => onQuickView && onQuickView(product, whyMatched, score)}
      className="bg-white border border-zinc-200/90 hover:border-zinc-300 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer relative"
    >
      {/* Top Image Section */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100">
        {!imgError && product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400 font-mono text-xs">
            {product.category}
          </div>
        )}

        {/* Rank Tag */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="w-6 h-6 rounded-full bg-zinc-900/90 backdrop-blur-xs text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-xs">
            #{rank}
          </span>
          {product.badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/95 text-zinc-900 font-semibold backdrop-blur-xs shadow-2xs border border-zinc-200/60">
              {product.badge}
            </span>
          )}
        </div>

        {/* Semantic Score Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md backdrop-blur-xs shadow-2xs border ${
              score >= 90
                ? "bg-emerald-500/90 text-white border-emerald-600/50 font-bold"
                : score >= 75
                ? "bg-zinc-900/80 text-white border-zinc-800"
                : "bg-white/90 text-zinc-700 border-zinc-200"
            }`}
          >
            {score}% Match
          </span>
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-zinc-900 text-xs font-mono font-medium shadow-md flex items-center space-x-1.5 backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="uppercase tracking-wider font-semibold text-zinc-500">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-zinc-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-zinc-400 text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-zinc-950 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Specification Benchmark: "Why this matched" explanation */}
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-[11px] font-mono flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="leading-snug">
              <span className="font-medium text-zinc-900">{whyMatched}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-1 pt-1">
            {product.features.slice(0, 3).map((feat) => (
              <span
                key={feat}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/60"
              >
                {feat}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-zinc-400">
                +{product.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom Pricing & Action Row */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base sm:text-lg font-bold font-mono text-zinc-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">USD</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>In Stock</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`p-2.5 rounded-xl border transition-all shadow-2xs flex items-center space-x-1.5 text-xs font-mono font-medium ${
              addedAnimation
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-zinc-200 hover:border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white text-zinc-800"
            }`}
            title="Add to Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">
              {addedAnimation ? "Added!" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
