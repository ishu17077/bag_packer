"use client";

import React, { useEffect } from "react";
import { Product } from "@/lib/products-data";
import {
  X,
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

interface ProductQuickViewModalProps {
  product: Product | null;
  whyMatched?: string;
  score?: number;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  whyMatched,
  score,
  onClose,
  onAddToCart,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              {product.category}
            </span>
            {score !== undefined && (
              <>
                <span className="text-zinc-300">•</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {score}% Semantic Match
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {/* Product Image */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-900/90 text-white font-semibold backdrop-blur-xs shadow-xs">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-mono text-zinc-500">
              <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col items-center">
                <Truck className="w-3.5 h-3.5 text-zinc-700 mb-1" />
                <span>Free Shipping</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col items-center">
                <RotateCcw className="w-3.5 h-3.5 text-zinc-700 mb-1" />
                <span>30-Day Return</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 mb-1" />
                <span>Lifetime Spec</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 leading-snug">
                {product.title}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-bold font-mono text-zinc-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">USD</span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-zinc-600 font-mono">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-zinc-900">{product.rating}</span>
                  <span className="text-zinc-400">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* AI Why this matched explanation */}
              {whyMatched && (
                <div className="p-3 rounded-xl bg-zinc-900 text-white text-xs font-mono flex items-start space-x-2.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-semibold">
                      AI Intent Match Explanation
                    </span>
                    <span className="font-medium text-emerald-300">{whyMatched}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-zinc-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications */}
              {product.specs && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                    Technical Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-2 rounded-lg bg-zinc-50 border border-zinc-200"
                      >
                        <span className="text-[10px] text-zinc-400 block">{key}</span>
                        <span className="font-semibold text-zinc-800 text-[11px]">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Badges */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  Key Attributes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.features.map((feat) => (
                    <span
                      key={feat}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Add to Bag */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-mono text-emerald-800 font-medium">
                  Ready to Dispatch
                </span>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white rounded-xl text-xs font-mono font-medium transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag (${product.price.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
