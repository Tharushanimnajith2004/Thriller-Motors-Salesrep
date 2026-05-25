import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { ArrowLeft, Plus, FileText, ShoppingBag, Trash, Edit, Check, X, Truck } from 'lucide-react';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customers, items, bills, addBill, updateBill, deleteBill, currentUser } = useStore();
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);
  
  // Discount state
  const [discountType, setDiscountType] = useState('none'); // 'none', 'percentage', 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [deliveryDateInput, setDeliveryDateInput] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const customer = customers.find(c => c.id === customerId);
  const customerBills = bills.filter(b => b.customerId === customerId).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (!customer) {
    return <div className="p-4 text-center text-white">Customer not found</div>;
  }

  const handleAddItemToBill = () => {
    if (selectedItem && quantity > 0) {
      const itemDef = items.find(i => i.id === selectedItem);
      if (itemDef) {
        setBillItems([...billItems, {
          itemId: itemDef.id,
          name: itemDef.name,
          price: itemDef.price,
          qty: parseInt(quantity),
          total: itemDef.price * parseInt(quantity)
        }]);
        setSelectedItem('');
        setQuantity(1);
      }
    }
  };

  const removeBillItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  let discountAmount = 0;
  
  const dVal = parseFloat(discountValue) || 0;
  if (discountType === 'percentage' && dVal > 0) {
    discountAmount = (subtotal * dVal) / 100;
  } else if (discountType === 'fixed' && dVal > 0) {
    discountAmount = dVal;
  }
  
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleSaveBill = () => {
    if (billItems.length > 0) {
      const billData = {
        customerId,
        salesmanId: currentUser, // Track which salesman made this bill!
        items: billItems,
        subtotal,
        discountType,
        discountValue: dVal,
        discountAmount,
        total: totalAmount,
        status: 'pending', // Default status!
        deliveryDate: deliveryDateInput // Custom planned delivery date!
      };

      if (editingBillId) {
        updateBill(editingBillId, billData);
      } else {
        addBill(billData);
      }

      // Reset form
      resetForm();
    }
  };

  const resetForm = () => {
    setBillItems([]);
    setDiscountType('none');
    setDiscountValue('');
    setEditingBillId(null);
    setDeliveryDateInput(new Date().toISOString().split('T')[0]);
    setShowAddBill(false);
  };

  const handleDeleteBill = (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      deleteBill(id);
    }
  };

  const handleEditBill = (bill) => {
    setEditingBillId(bill.id);
    setBillItems(bill.items);
    setDiscountType(bill.discountType || 'none');
    setDiscountValue(bill.discountValue || '');
    setDeliveryDateInput(bill.deliveryDate || new Date().toISOString().split('T')[0]);
    setShowAddBill(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white m-0 truncate">{customer.name}</h1>
          <p className="text-sm text-muted m-0 truncate">{customer.address}</p>
        </div>
      </div>

      {/* Add Bill Button */}
      {!showAddBill && (
        <button 
          onClick={() => { resetForm(); setShowAddBill(true); }}
          className="btn btn-primary w-full mb-6 py-3 text-lg"
        >
          <Plus size={24} />
          Create New Bill
        </button>
      )}

      {/* Add/Edit Bill Form */}
      {showAddBill && (
        <div className="glass-panel p-4 mb-6 animate-fade-in border-primary border">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingBillId ? 'Edit Bill' : 'New Bill'}
          </h3>

          <div className="form-group mb-4">
            <label style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', display: 'block' }}>Planned Delivery Date</label>
            <input 
              type="date" 
              value={deliveryDateInput}
              onChange={e => setDeliveryDateInput(e.target.value)}
              className="w-full h-12"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px' }}
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 form-group m-0">
              <select 
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
                className="w-full h-12"
              >
                <option value="">Select Item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name} - Rs.{item.price}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="form-group m-0 flex-1 sm:w-24">
                <input 
                  type="number" 
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  min="1"
                  className="h-12 w-full text-center"
                />
              </div>
              <button 
                onClick={handleAddItemToBill}
                className="btn btn-primary px-4 h-12"
              >
                Add
              </button>
            </div>
          </div>

          {/* Bill Items List */}
          {billItems.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-muted mb-2">Items</h4>
              <div className="flex flex-col gap-2 mb-4">
                {billItems.map((bi, index) => (
                  <div key={index} className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <div>
                      <div className="text-white text-sm">{bi.name}</div>
                      <div className="text-xs text-muted">{bi.qty} x Rs.{bi.price}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-white">Rs.{bi.total.toFixed(2)}</div>
                      <button onClick={() => removeBillItem(index)} className="text-danger">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Discount Section */}
              <div className="bg-black/20 p-3 rounded-lg border border-surface-border mb-4">
                <h4 className="text-sm font-semibold text-white mb-3">Discount</h4>
                <div className="flex gap-2 mb-2">
                  <button 
                    className={`btn text-sm py-1 px-2 flex-1 ${discountType === 'none' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setDiscountType('none'); setDiscountValue(''); }}
                  >
                    None
                  </button>
                  <button 
                    className={`btn text-sm py-1 px-2 flex-1 ${discountType === 'percentage' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setDiscountType('percentage')}
                  >
                    %
                  </button>
                  <button 
                    className={`btn text-sm py-1 px-2 flex-1 ${discountType === 'fixed' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setDiscountType('fixed')}
                  >
                    Amount
                  </button>
                </div>
                
                {discountType !== 'none' && (
                  <div className="form-group m-0 mt-2">
                    <input 
                      type="number" 
                      placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount in Rs.'}
                      value={discountValue}
                      onChange={e => setDiscountValue(e.target.value)}
                      min="0"
                      step={discountType === 'percentage' ? "1" : "0.01"}
                    />
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-1 border-t border-surface-border pt-3">
                <div className="flex justify-between items-center text-muted text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-success text-sm">
                    <span>Discount {discountType === 'percentage' ? `(${dVal}%)` : ''}</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-xl text-primary">
                    Rs. {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleSaveBill} 
              disabled={billItems.length === 0}
              className="btn btn-success flex-1 disabled:opacity-50"
            >
              {editingBillId ? 'Update Bill' : 'Save Bill'}
            </button>
            <button onClick={resetForm} className="btn btn-outline flex-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Past Bills */}
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <FileText size={20} className="text-muted"/>
        Past Bills
      </h3>
      
      <div className="flex flex-col gap-3">
        {customerBills.length === 0 ? (
          <div className="text-center p-8 glass-panel opacity-80">
            <ShoppingBag size={40} className="text-muted mx-auto mb-3 opacity-50" />
            <p className="text-muted text-sm">No bills found for this customer.</p>
          </div>
        ) : (
          customerBills.map(bill => {
          const isPending = !bill.status || bill.status === 'pending';
          
          let statusColor = '#eab308';
          let statusText = 'Pending';
          if (bill.status === 'delivered') {
            statusColor = '#34d399';
            statusText = 'Delivered';
          } else if (bill.status === 'cancelled') {
            statusColor = '#f87171';
            statusText = 'Cancelled';
          }

          return (
            <div key={bill.id} className="glass-panel p-4 flex flex-col gap-2 border border-surface-border/50">
              <div className="flex justify-between items-center border-b border-surface-border pb-2">
                <div>
                  <span className="text-sm text-white font-semibold block">
                    {new Date(bill.date).toLocaleDateString()} {new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  {bill.deliveryDate && (
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                      <Truck size={10} />
                      Delivery: {bill.deliveryDate}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', color: statusColor, border: `1px solid ${statusColor}40` }}>
                    {statusText}
                  </span>
                  <span className="font-bold text-primary text-lg ml-2">Rs. {Number(bill.total).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-sm mt-1">
                {bill.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-muted mt-1">
                    <span>{item.qty}x {item.name}</span>
                    <span>Rs.{Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-success mt-2 pt-2 border-t border-surface-border/50">
                  <span>Discount {bill.discountType === 'percentage' ? `(${bill.discountValue}%)` : ''}</span>
                  <span>-Rs.{Number(bill.discountAmount).toFixed(2)}</span>
                </div>
              )}

              {/* Actions row for pending status */}
              {isPending && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    onClick={() => updateBill(bill.id, { status: 'delivered' })}
                    style={{ flex: 1, height: '32px', display: 'flex', alignItems: 'center', justify_content: 'center', justifyContent: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    <Check size={14} />
                    Delivered
                  </button>
                  <button 
                    onClick={() => updateBill(bill.id, { status: 'cancelled' })}
                    style={{ flex: 1, height: '32px', display: 'flex', alignItems: 'center', justify_content: 'center', justifyContent: 'center', gap: '0.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleEditBill(bill)}
                    className="btn-icon w-8 h-8 text-primary border-primary"
                    style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0 }}
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBill(bill.id)}
                    className="btn-icon w-8 h-8 text-danger border-danger/20 hover:border-danger"
                    style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0 }}
                  >
                    <Trash size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
