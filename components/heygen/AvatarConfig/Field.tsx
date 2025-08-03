import React from 'react';
import { Label } from '@/components/ui/label';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  description?: string;
}

export function Field({ label, children, description }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}