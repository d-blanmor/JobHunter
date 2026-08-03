import React from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
};

export default function Modal({ title, children, onClose, closeOnOverlayClick = true }: Props) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
