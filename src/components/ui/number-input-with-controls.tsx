import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberInputWithControlsProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  showValidation?: boolean;
}

const NumberInputWithControls: React.FC<NumberInputWithControlsProps> = ({
  value,
  onChange,
  label,
  placeholder,
  min = 0,
  max = 999,
  step = 1,
  disabled = false,
  error,
  showValidation = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  
  const isValid = value >= min && value <= max;
  const showError = error || (showValidation && hasChanged && !isValid);
  const showSuccess = showValidation && hasChanged && isValid && value > 0;
  const handleIncrement = () => {
    if (!disabled && value < max) {
      const newValue = value + step;
      onChange(Math.min(newValue, max));
      setHasChanged(true);
    }
  };

  const handleDecrement = () => {
    if (!disabled && value > min) {
      const newValue = value - step;
      onChange(Math.max(newValue, min));
      setHasChanged(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      setHasChanged(true);
      return;
    }
    
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setHasChanged(true);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    setHasChanged(true);
  };

  useEffect(() => {
    if (value !== 0) {
      setHasChanged(true);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={cn(
          "text-sm font-medium transition-colors",
          showError ? "text-destructive" : 
          showSuccess ? "text-success" : 
          isFocused ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </label>
        {showValidation && (
          <div className="flex items-center gap-1">
            {showError && <AlertCircle className="w-3 h-3 text-destructive" />}
            {showSuccess && <CheckCircle className="w-3 h-3 text-success" />}
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            className={cn(
              "h-10 w-10 transition-all duration-200",
              value <= min ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:border-primary/50"
            )}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="relative flex-1">
            <Input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value || ''}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                "text-center h-10 transition-all duration-200 font-medium",
                showError ? "border-destructive/50 bg-destructive/5 focus:border-destructive focus:ring-destructive/20" :
                showSuccess ? "border-success/50 bg-success/5 focus:border-success focus:ring-success/20" :
                isFocused ? "border-primary bg-primary/5" : "bg-background/50 border-border/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              placeholder={placeholder}
            />
            
            {/* Indicador visual de valor */}
            {value > 0 && (
              <div className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors",
                showError ? "bg-destructive" :
                showSuccess ? "bg-success" : "bg-primary"
              )} />
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            className={cn(
              "h-10 w-10 transition-all duration-200",
              value >= max ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:border-primary/50"
            )}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Mensagens de validação */}
        {showValidation && (showError || showSuccess) && (
          <div className="mt-2 text-xs flex items-center gap-1">
            {showError && (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error || `Valor deve estar entre ${min} e ${max}`}
              </span>
            )}
            {showSuccess && (
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valor válido
              </span>
            )}
          </div>
        )}
        
        {/* Barra de progresso visual */}
        {showValidation && value > 0 && isValid && (
          <div className="mt-2">
            <div className="w-full bg-muted/30 rounded-full h-1">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  showSuccess ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { NumberInputWithControls };
