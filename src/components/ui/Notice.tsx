import React from 'react';

interface NoticeProps {
  tone?: 'ok' | 'warn' | 'bad' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Notice: React.FC<NoticeProps> = ({
  tone = 'info',
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`ph-notice ph-notice--${tone} ph-cut-sm ${className}`}>
      <div className="ph-notice__inner ph-cut-sm">
        <span className="ph-notice__dot" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {title && <div className="ph-notice__title">{title}</div>}
          <div className="ph-notice__body">{children}</div>
        </div>
      </div>
    </div>
  );
};
