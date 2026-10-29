'use client'

import React, { useState } from 'react'
import {
  addProductToKit,
  getPersonalKit,
  removeProductFromKit,
} from '../../lib/services/storage-service'
import { OwnedProduct, ProductItem } from '../../lib/types/makeup'
import { Plus, Sparkles, Trash2, X } from 'lucide-react'

interface PersonalKitModalProps {
  isOpen: boolean
  onClose: () => void
  onKitUpdated?: () => void
}

const CATEGORIES: ProductItem['category'][] = [
  'Primer',
  'Foundation',
  'Concealer',
  'Colour Corrector',
  'Setting Powder',
  'Eyeshadow',
  'Eyeliner',
  'Mascara',
  'Blush',
  'Contour',
  'Highlighter',
  'Lipstick',
  'Setting Spray',
]

export function PersonalKitModal({ isOpen, onClose, onKitUpdated }: PersonalKitModalProps) {
  const [kit, setKit] = useState<OwnedProduct[]>(() => getPersonalKit())
  const [isAdding, setIsAdding] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<ProductItem['category']>('Lipstick')
  const [shade, setShade] = useState('')
  const [price, setPrice] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState('')

  if (!isOpen) return null

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !brand) return

    addProductToKit({
      name,
      brand,
      category,
      shade: shade || undefined,
      price: price ? Number(price) : undefined,
      expiryDate: expiryDate || undefined,
    })

    const updated = getPersonalKit()
    setKit(updated)
    setIsAdding(false)
    setName('')
    setBrand('')
    setShade('')
    setPrice('')
    setExpiryDate('')
    if (onKitUpdated) onKitUpdated()
  }

  const handleRemove = (id: string) => {
    removeProductFromKit(id)
    const updated = getPersonalKit()
    setKit(updated)
    if (onKitUpdated) onKitUpdated()
  }

  const totalValue = kit.reduce((sum, item) => sum + (item.price || 0), 0)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--cream)',
          border: '2px solid var(--ink)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 10px 0 var(--ink)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'var(--yellow)',
            borderBottom: '2px solid var(--ink)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              FEATURE 10: USER MAKEUP INVENTORY
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '24px', fontFamily: 'var(--serif)' }}>
              My Personal Makeup Kit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              border: '1.5px solid var(--ink)',
              background: 'var(--cream)',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Inventory Summary Stats */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--paper)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <span>
            Total Owned Products: <strong>{kit.length}</strong>
          </span>
          {totalValue > 0 && (
            <span>
              Estimated Kit Value: <strong>₹{totalValue.toLocaleString('en-IN')}</strong>
            </span>
          )}
        </div>

        {/* Body content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {isAdding ? (
            <form onSubmit={handleAdd} style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fit Me Matte Foundation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maybelline"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Shade (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 128 Warm Nude"
                    value={shade}
                    onChange={(e) => setShade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Price in INR (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 649"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Save to Kit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: '1px solid var(--ink)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1.5px dashed var(--ink)',
                background: 'var(--paper)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <Plus size={16} /> Add Product You Already Own
            </button>
          )}

          {/* List of owned products */}
          {kit.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)' }}>
              <p style={{ font: '15px var(--serif)' }}>Your personal kit is currently empty.</p>
              <p style={{ fontSize: '12px' }}>
                Add makeup items you already own so Lemon doesn&apos;t recommend buying duplicate products!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {kit.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {item.brand} · {item.category} {item.shade && `· ${item.shade}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.price && (
                      <span style={{ fontSize: '12px', fontWeight: 800 }}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      title="Remove product"
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
