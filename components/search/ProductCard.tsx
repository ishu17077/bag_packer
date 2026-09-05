"use client";

import React from "react";
import { Product } from "@/lib/products-data";
import { Star, CheckCircle2, Sparkles, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  rank: number;
  whyMatched: string;
  score: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  rank,
  whyMatched,
  score,
}) => {
  return (
    <div className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all group relative">
      {/* Top Meta Row */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono text-xs font-bold flex items-center justify-center">
              {rank}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              {product.category}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {product.badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold">
                {product.badge}
              </span>
            )}
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200">
              {score}% match
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-black transition-colors leading-snug">
          {product.title}
        </h3>

        {/* Required Specification: One-line "Why this matched" explanation */}
        <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-mono flex items-start space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />
          <div className="leading-snug">
            <span className="font-semibold text-zinc-900">{whyMatched}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Features Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.features.map((feat) => (
            <span
              key={feat}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100/70 text-zinc-700 border border-zinc-200/60"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Pricing & Action Row */}
      <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold font-mono text-zinc-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">USD</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-zinc-500 font-mono mt-0.5">
            <Star className="w-3 h-3 fill-zinc-900 text-zinc-900" />
            <span className="font-semibold text-zinc-800">{product.rating}</span>
            <span className="text-zinc-400">({product.reviewsCount})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {product.inStock ? (
            <span className="text-[10px] font-mono text-emerald-700 flex items-center space-x-1 hidden sm:flex">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>In Stock</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-zinc-400">Out of Stock</span>
          )}

          <button
            type="button"
            className="p-2 rounded-lg border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-700 transition-all shadow-2xs"
            title="Add to pack"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
