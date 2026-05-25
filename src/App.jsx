import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/StoreContext';
import Login from './pages/Login';
import ItemsPage from './pages/ItemsPage';
import SalesLayout from './pages/sales/SalesLayout';
import RoutesView from './pages/sales/RoutesView';
import RouteDetails from './pages/sales/RouteDetails';
import CustomerDetails from './pages/sales/CustomerDetails';
import ProfilePage from './pages/sales/ProfilePage';
import DeliveriesPage from './pages/sales/DeliveriesPage';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/login" />;
  
  if (roleRequired === 'items' && currentUser !== 'items') {
    return <Navigate to="/sales" />;
  }
  
  if (roleRequired === 'sales' && currentUser === 'items') {
    return <Navigate to="/items" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Items Routes */}
        <Route path="/items/*" element={
          <ProtectedRoute roleRequired="items">
            <ItemsPage />
          </ProtectedRoute>
        } />
        
        {/* Sales Routes */}
        <Route path="/sales" element={
          <ProtectedRoute roleRequired="sales">
            <SalesLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RoutesView />} />
          <Route path="route/:routeId" element={<RouteDetails />} />
          <Route path="customer/:customerId" element={<CustomerDetails />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
