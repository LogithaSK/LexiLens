'use client'

import React, { useState } from 'react'
import { deleteSavedLook, getSavedLooks } from '../../lib/services/storage-service'
import { SavedLookRecord } from '../../lib/types/makeup'
import { ArrowRight, BookOpen, Clock, Heart, Trash2, X } from 'lucide-react'

interface SavedLooksModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadLook: (record: SavedLookRecord) => void
}

export function SavedLooksModal({ isOpen, onClose, onLoadLook }: SavedLooksModalProps) {
  const [savedRecords, setSavedRecords] = useState<SavedLookRecord[]>(() => getSavedLooks())

  if (!isOpen) return null

  const handleDelete = (id: string) => {
    deleteSavedLook(id)
    setSavedRecords(getSavedLooks())
  }

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
              FEATURE 12: PERSISTENCE & HISTORY
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '24px', fontFamily: 'var(--serif)' }}>
              My Saved Makeup Looks
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

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {savedRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
              <Heart size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ font: '16px var(--serif)', margin: '0 0 6px' }}>No saved looks yet.</p>
              <p style={{ fontSize: '12px', margin: 0 }}>
                When creating a routine in the builder, click &quot;Save This Makeup Routine&quot; to revisit anytime!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {savedRecords.map((record) => (
                <div
                  key={record.id}
                  style={{
                    border: '1.5px solid var(--ink)',
                    background: 'var(--paper)',
                    padding: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {record.occasion} · {record.style} · Saved{' '}
                      {new Date(record.savedAt).toLocaleDateString()}
                    </span>
                    <h4 style={{ margin: '3px 0 4px', fontSize: '18px', fontFamily: 'var(--serif)' }}>
                      {record.name}
                    </h4>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '12px' }}>
                      <span>{record.look.products.length} products curated</span>
                      <span>{record.look.tutorial.length} tutorial steps</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadLook(record)
                        onClose()
                      }}
                      style={{
                        padding: '8px 14px',
                        background: 'var(--ink)',
                        color: 'var(--cream)',
                        border: '1px solid var(--ink)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <BookOpen size={13} /> Reopen Routine
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      title="Delete look"
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                    >
                      <Trash2 size={16} />
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
