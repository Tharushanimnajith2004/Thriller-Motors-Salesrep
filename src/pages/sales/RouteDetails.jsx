import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { ArrowLeft, Plus, GripVertical, Store, Trash, Edit } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCustomerItem = ({ customer, onClick, onEditClick, onDeleteClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: customer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="list-item mb-2 bg-surface-color">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
          <Store size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white m-0 text-lg">{customer.name}</h3>
          <p className="text-sm text-muted m-0">{customer.address}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={onEditClick}
            className="btn-icon border-primary/20 hover:border-primary text-primary"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
          >
            <Edit size={12} />
          </button>
          <button 
            onClick={onDeleteClick}
            className="btn-icon border-danger/20 hover:border-danger text-danger"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
          >
            <Trash size={12} />
          </button>
        </div>
        <div {...attributes} {...listeners} className="drag-handle cursor-grab" style={{ padding: '4px' }}>
          <GripVertical size={24} />
        </div>
      </div>
    </div>
  );
};

const RouteDetails = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { routes, customers, addCustomer, updateCustomer, deleteCustomer, updateCustomerOrder } = useStore();
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '' });

  const route = routes.find(r => r.id === routeId);
  const routeCustomers = customers
    .filter(c => c.routeId === routeId)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!route) {
    return <div className="p-4 text-center text-white">Route not found</div>;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = routeCustomers.findIndex((c) => c.id === active.id);
      const newIndex = routeCustomers.findIndex((c) => c.id === over.id);
      
      const newOrder = arrayMove(routeCustomers, oldIndex, newIndex);
      
      // Update order field
      const updatedCustomers = newOrder.map((c, index) => ({ ...c, order: index }));
      updateCustomerOrder(routeId, updatedCustomers);
    }
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.address) {
      if (editingCustomer) {
        updateCustomer(editingCustomer.id, { name: newCustomer.name, address: newCustomer.address });
      } else {
        addCustomer({ ...newCustomer, routeId });
      }
      setNewCustomer({ name: '', address: '' });
      setEditingCustomer(null);
      setShowAdd(false);
    }
  };

  const handleEditCustomerClick = (e, customer) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setNewCustomer({ name: customer.name, address: customer.address });
    setShowAdd(true);
  };

  const handleDeleteCustomerClick = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this customer? This will also delete all bills associated with them!")) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/sales')} className="btn-icon">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white m-0 flex-1 truncate">{route.name}</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-icon bg-primary text-white border-primary"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddCustomer} className="glass-panel p-4 mb-6 animate-fade-in border border-primary/20">
          <h3 className="text-lg font-bold text-white mb-3">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <div className="form-group mb-4">
            <label>Customer Name</label>
            <input 
              type="text" 
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              placeholder="e.g. Saman Stores" 
              required
            />
          </div>
          <div className="form-group mb-4">
            <label>Address</label>
            <input 
              type="text" 
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              placeholder="e.g. Main St, Colombo" 
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Save</button>
            <button type="button" onClick={() => { setShowAdd(false); setEditingCustomer(null); setNewCustomer({ name: '', address: '' }); }} className="btn btn-outline flex-1">Cancel</button>
          </div>
        </form>
      )}

      {routeCustomers.length === 0 ? (
        <div className="text-center p-8 glass-panel">
          <Store size={48} className="text-muted mx-auto mb-4 opacity-50" />
          <p className="text-muted">No customers in this route.</p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={routeCustomers.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {routeCustomers.map(customer => (
                <SortableCustomerItem 
                  key={customer.id} 
                  customer={customer} 
                  onClick={() => navigate(`/sales/customer/${customer.id}`)}
                  onEditClick={(e) => handleEditCustomerClick(e, customer)}
                  onDeleteClick={(e) => handleDeleteCustomerClick(e, customer.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default RouteDetails;
