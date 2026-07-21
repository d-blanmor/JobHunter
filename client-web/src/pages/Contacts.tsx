// client/src/pages/Contacts.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { 
  listContacts, 
  getContact, 
  saveContact, 
  deleteContact
} from '../api/contacts';

interface LookupItem {
  Id: number;
  Name: string;
  Email: string;
  Phone: string;
  Details: string;
  IsActive: boolean;
}

export default function Contacts() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contacts</h1>
      <p>This is a placeholder page for contacts. You can add contact listings here.</p>
    </div>
  );
}