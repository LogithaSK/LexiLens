'use client'

import React, { useState } from 'react'
import { PRODUCT_CATALOGUE } from '../../lib/data/product-catalogue'
import {
  calculateBudgetBreakdown,
  getBudgetOptimizedKit,
} from '../../lib/services/recommendation-engine'
import { BudgetTier, ProductItem, RecommendedLook } from '../../lib/types/makeup'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Layers,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react'

interface StepProductsProps {
  look: RecommendedLook
  budgetTier: BudgetTier
  setBudgetTier: (tier: BudgetTier) => void
  customBudget: number
  setCustomBudget: (val: number) => void
  products: ProductItem[]
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>
  ownedProductIds: string[]
  setOwnedProductIds: React.Dispatch<React.SetStateAction<string[]>>
  onOpenPersonalKit: () => void
  onSaveLook: () => void
}

export function StepProducts({
  look,
  budgetTier,
  setBudgetTier,
  customBudget,
  setCustomBudget,
  products,
  setProducts,
  ownedProductIds,
  setOwnedProductIds,
  onOpenPersonalKit,
  onSaveLook,
}: StepProductsProps) {
  const [substitutingProduct, setSubstitutingProduct] = useState<ProductItem | null>(null)

  // Compute live budget breakdown
  const budgetBreakdown = calculateBudgetBreakdown(
    products,
    ownedProductIds,
    budgetTier,
    budgetTier === 'custom' ? customBudget : undefined
  )

  const toggleOwned = (productId: string) => {
    setOwnedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleSubstitute = (targetProduct: ProductItem, replacement: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === targetProduct.id ? replacement : p)))
    setSubstitutingProduct(null)
  }

  const handleApplyLowerCostKit = () => {
    const optimized = getBudgetOptimizedKit(products, budgetBreakdown.targetBudget)
    setProducts(optimized)
  }

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <div className="builder-step-content" style={{ display: 'grid', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            FEATURE 7, 8 & 9: PRODUCT RECOMMENDATIONS & SMART BUDGET SHOPPING LIST
          </span>
          <h3 style={{ margin: '4px 0 6px', fontSize: '28px', fontFamily: 'var(--serif)' }}>
            Curated Products for {look.name}
          </h3>
          <p style={{ margin: 0, color: 'var(--muted)', font: '14px var(--serif)' }}>
            Every product connects directly to a tutorial step. Filter by your budget, mark products you already own, or swap alternatives.
          </p>
        </div>

        {/* Save Look CTA */}
        <button
          type="button"
          onClick={onSaveLook}
          style={{
            padding: '10px 18px',
            background: 'var(--ink)',
            color: 'var(--yellow)',
            border: '1.5px solid var(--ink)',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '4px 4px 0 var(--yellow)',
          }}
        >
          <Sparkles size={16} /> Save This Makeup Routine
        </button>
      </div>

      {/* Budget Tier Selector Card */}
      <div
        style={{
          border: '1.5px solid var(--ink)',
          background: 'var(--cream)',
          padding: '20px',
          boxShadow: '6px 6px 0 var(--yellow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Set Spending Budget Preference:
          </strong>
          <button
            type="button"
            onClick={onOpenPersonalKit}
            style={{
              background: 'transparent',
              border: '1px solid var(--ink)',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Manage My Personal Kit ({ownedProductIds.length} owned items)
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'budget', label: 'Budget-Friendly (under ₹3,500)' },
            { id: 'mid-range', label: 'Mid-Range / Occasion (₹3,500 - ₹8,000)' },
            { id: 'premium', label: 'Luxury & Couture (₹8,000+)' },
            { id: 'custom', label: 'Custom INR Budget' },
          ].map(({ id, label }) => {
            const isSelected = budgetTier === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setBudgetTier(id as BudgetTier)}
                style={{
                  padding: '9px 16px',
                  border: isSelected ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--ink)' : 'var(--paper)',
                  color: isSelected ? 'var(--cream)' : 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}

          {budgetTier === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800 }}>₹</span>
              <input
                type="number"
                min="500"
                step="500"
                value={customBudget}
                onChange={(e) => setCustomBudget(Math.max(0, Number(e.target.value)))}
                style={{
                  padding: '7px 10px',
                  border: '1px solid var(--ink)',
                  width: '120px',
                  fontSize: '13px',
                  background: 'var(--paper)',
                }}
              />
            </div>
          )}
        </div>

        {/* Budget Breakdown Summary Strip */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Target Budget
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--serif)' }}>
              ₹{budgetBreakdown.targetBudget.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Kit Total (100% Items)
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--serif)' }}>
              ₹{budgetBreakdown.totalCost.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#2E7D32', textTransform: 'uppercase' }}>
              Saved (Items You Own)
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2E7D32', fontFamily: 'var(--serif)' }}>
              -₹{budgetBreakdown.savingsFromOwned.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Net Amount to Purchase
            </span>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 900,
                fontFamily: 'var(--serif)',
                color: budgetBreakdown.isOverBudget ? '#C62828' : 'var(--ink)',
              }}
            >
              ₹{budgetBreakdown.netPayableCost.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Budget Shortfall Alert & Smart Substitution */}
        {budgetBreakdown.isOverBudget && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#FFF4E5',
              border: '1.5px solid #FF9800',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#E65100" />
              <span style={{ fontSize: '12px', color: '#7E2B00' }}>
                Net cost exceeds your target budget by{' '}
                <strong>₹{budgetBreakdown.shortfall.toLocaleString('en-IN')}</strong>.
              </span>
            </div>

            {budgetBreakdown.lowerCostAlternativesAvailable && (
              <button
                type="button"
                onClick={handleApplyLowerCostKit}
                style={{
                  padding: '7px 14px',
                  background: '#E65100',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} /> Auto-Substitute with Budget Alternatives
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shopping List Table */}
      <div
        style={{
          border: '1.5px solid var(--ink)',
          background: 'var(--cream)',
          overflow: 'hidden',
          boxShadow: '6px 6px 0 var(--yellow)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Shopping List ({products.length} Products)
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Check &quot;I Own This&quot; to subtract from your required spend.
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'rgba(28,27,22,0.04)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>Own</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Product & Brand</th>
                <th style={{ padding: '12px 16px' }}>Shade Guidance</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Step</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const isOwned = ownedProductIds.includes(item.id)
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: isOwned ? 'rgba(244, 216, 74, 0.15)' : 'transparent',
                      opacity: isOwned ? 0.75 : 1,
                    }}
                  >
                    {/* Checkbox for already owned */}
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={isOwned}
                        onChange={() => toggleOwned(item.id)}
                        aria-label={`Mark ${item.name} as owned`}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--ink)', cursor: 'pointer' }}
                      />
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{item.category}</td>

                    {/* Product Name & Brand */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.brand}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', font: '11px var(--serif)', marginTop: '2px' }}>
                        {item.whyRecommended}
                      </div>
                    </td>

                    {/* Shade Guidance */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          fontSize: '11px',
                        }}
                      >
                        {item.shade}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                      {isOwned ? (
                        <span style={{ textDecoration: 'line-through', color: 'var(--muted)' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span>₹{item.price.toLocaleString('en-IN')}</span>
                      )}
                    </td>

                    {/* Tutorial Step */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          background: 'var(--yellow)',
                          border: '1px solid var(--ink)',
                        }}
                      >
                        Step {item.tutorialStepId}
                      </span>
                    </td>

                    {/* Action buttons (Swap alternative / Buy link / Remove) */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSubstitutingProduct(item)}
                          title="Substitute with another product in this category"
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid var(--ink)',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Swap
                        </button>

                        <a
                          href={item.purchaseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '4px 8px',
                            background: 'var(--ink)',
                            color: 'var(--cream)',
                            border: '1px solid var(--ink)',
                            fontSize: '11px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                          }}
                        >
                          Buy <ExternalLink size={11} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.id)}
                          title="Remove from routine"
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Substitution Modal */}
      {substitutingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--cream)',
              border: '2px solid var(--ink)',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '10px 10px 0 var(--ink)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--serif)' }}>
                Substitute {substitutingProduct.category}
              </h3>
              <button
                type="button"
                onClick={() => setSubstitutingProduct(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted)', font: '13px var(--serif)' }}>
              Choose an alternative product from our catalogue for this step:
            </p>

            <div style={{ display: 'grid', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
              {PRODUCT_CATALOGUE.filter(
                (p) => p.category === substitutingProduct.category && p.id !== substitutingProduct.id
              ).map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--ink)',
                    background: 'var(--paper)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{alt.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {alt.brand} · {alt.shade}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800, marginTop: '2px' }}>
                      ₹{alt.price.toLocaleString('en-IN')}{' '}
                      <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--muted)' }}>
                        ({alt.priceCategory})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubstitute(substitutingProduct, alt)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
