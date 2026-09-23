import React from 'react';
import { AdminPanel } from './AdminPanel';

export interface ClientAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientAdminPanel: React.FC<ClientAdminPanelProps> = ({ isOpen, onClose }) => {
  return <AdminPanel isOpen={isOpen} onClose={onClose} />;
};

export default ClientAdminPanel;
