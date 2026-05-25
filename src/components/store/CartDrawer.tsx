'use client';

import { useCart } from '@/lib/CartContext';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CheckoutForm {
  name: string; phone: string; email: string; city: string; address: string;
}

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, remove, update, clear, total } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', city: '', address: '' });
  const [loading, setLoading] = useState(false);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        customer: form,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          variantArticle: i.variantArticle,
          variantColor: i.variantColor,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        totalAmount: total,
        source: 'store',
        warehouse: 'warehouse1',
      };
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      clear();
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all";
  const inputStyle = { background: '#f5f0eb', border: '1px solid #e8e4e0', color: '#1a1a2e' };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl" style={{ background: '#fafaf8' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e8e4e0' }}>
          <h2 className="font-bold text-lg" style={{ color: '#1a1a2e' }}>
            {step === 'cart' ? 'Кошик' : step === 'checkout' ? 'Оформлення' : 'Замовлення прийнято!'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: '#94a3b8' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Дякуємо за замовлення!</h3>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>Ми звʼяжемося з вами найближчим часом для підтвердження.</p>
            <button
              onClick={() => { setStep('cart'); onClose(); }}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all"
              style={{ background: '#1a1a2e' }}
            >
              Продовжити покупки
            </button>
          </div>
        ) : step === 'checkout' ? (
          <form onSubmit={placeOrder} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[
                { key: 'name', label: "Ім'я *", placeholder: 'Тетяна Мельник', type: 'text' },
                { key: 'phone', label: 'Телефон *', placeholder: '+380671234567', type: 'tel' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
                { key: 'city', label: 'Місто *', placeholder: 'Київ', type: 'text' },
                { key: 'address', label: 'Відділення Нової Пошти', placeholder: 'Відділення №1, вул. Шевченка 10', type: 'text' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: '#64748b' }}>{label}</label>
                  <input
                    type={type}
                    required={label.includes('*')}
                    value={form[key as keyof CheckoutForm]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}

              {/* Order summary */}
              <div className="rounded-xl p-4" style={{ background: '#f5f0eb', border: '1px solid #e8e4e0' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: '#1a1a2e' }}>Ваше замовлення</h4>
                {items.map(item => (
                  <div key={item.variantArticle} className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: '#475569' }}>{item.productName} ({item.variantColor}) ×{item.quantity}</span>
                    <span style={{ color: '#1a1a2e' }} className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t mt-3 pt-3 flex justify-between font-bold" style={{ borderColor: '#e8e4e0' }}>
                  <span style={{ color: '#1a1a2e' }}>Разом</span>
                  <span style={{ color: '#6366f1' }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t space-y-3" style={{ borderColor: '#e8e4e0' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                style={{ background: loading ? '#94a3b8' : '#1a1a2e' }}
              >
                {loading ? 'Оформлення...' : 'Підтвердити замовлення'}
              </button>
              <button type="button" onClick={() => setStep('cart')} className="w-full py-2.5 rounded-xl text-sm font-medium transition-all" style={{ color: '#64748b' }}>
                ← Назад до кошика
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingCart className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
                  <p style={{ color: '#94a3b8' }}>Кошик порожній</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.variantArticle} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f5f0eb', border: '1px solid #e8e4e0' }}>
                      <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: '#e8e4e0' }}>
                        <div className="w-5 h-5 rounded-full" style={{ background: item.colorHex || '#6366f1' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1a1a2e' }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{item.variantColor} · {item.variantArticle}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#6366f1' }}>{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => remove(item.variantArticle)} style={{ color: '#94a3b8' }}><Trash2 className="w-3.5 h-3.5" /></button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => update(item.variantArticle, item.quantity - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#e8e4e0' }}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center" style={{ color: '#1a1a2e' }}>{item.quantity}</span>
                          <button onClick={() => update(item.variantArticle, item.quantity + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#e8e4e0' }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t space-y-3" style={{ borderColor: '#e8e4e0' }}>
                <div className="flex justify-between text-lg font-bold">
                  <span style={{ color: '#1a1a2e' }}>Разом</span>
                  <span style={{ color: '#6366f1' }}>{formatCurrency(total)}</span>
                </div>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 rounded-xl font-bold text-white transition-all"
                  style={{ background: '#1a1a2e' }}
                >
                  Оформити замовлення
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
