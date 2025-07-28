import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  isLoading?: boolean;
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    confirmClass: 'bg-primary hover:bg-primary/90'
  },
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
    confirmClass: 'bg-destructive hover:bg-destructive/90'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    confirmClass: 'bg-success hover:bg-success/90'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    confirmClass: 'bg-warning hover:bg-warning/90'
  }
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-row items-start gap-4">
          <div className={cn('p-2 rounded-full', config.iconBg)}>
            <IconComponent className={cn('w-5 h-5', config.iconColor)} />
          </div>
          <div className="flex-1">
            <AlertDialogTitle className="text-left text-lg font-semibold">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left mt-2 text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-row justify-end gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isLoading}
            className="mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(config.confirmClass, 'text-white')}
          >
            {isLoading ? 'Processando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ConfirmationDialog };