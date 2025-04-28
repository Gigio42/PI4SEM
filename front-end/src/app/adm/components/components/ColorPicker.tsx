import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import formStyles from '../component-form.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: Array<{ name: string; value: string }>;
}

/**
 * An enhanced color picker component that displays color presets
 * and adapts to the current theme mode
 */
export default function ColorPicker({ value, onChange, presetColors }: ColorPickerProps) {
  const { isDarkMode } = useTheme();
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [inputColor, setInputColor] = useState(value);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Default color presets if none provided
  const defaultColors = [
    { name: 'Primary', value: '#6366F1' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
  ];
  
  const colors = presetColors || defaultColors;
  
  // Update input color when value prop changes
  useEffect(() => {
    setInputColor(value);
  }, [value]);
  
  // Close color palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPalette(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle direct color input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
  };
  
  const handleInputBlur = () => {
    // Validate if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(inputColor)) {
      onChange(inputColor);
    } else {
      // Reset to previous valid color
      setInputColor(value);
    }
  };
  
  // Handle select color from presets
  const handleSelectColor = (colorValue: string) => {
    onChange(colorValue);
    setShowColorPalette(false);
  };

  return (
    <div className={formStyles.enhancedColorPicker} ref={colorPickerRef}>
      <div className={formStyles.colorPickerContainer}>
        <div
          className={formStyles.colorPreview}
          style={{ backgroundColor: value }}
          onClick={() => setShowColorPalette(!showColorPalette)}
          aria-label="Toggle color palette"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setShowColorPalette(!showColorPalette);
              e.preventDefault();
            }
          }}
        >
          <span className={formStyles.colorPreviewInner}>
            {showColorPalette ? (
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)' 
                }}
              >
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)' 
                }}
              >
                <path d="M7 15L12 20L17 15M7 9L12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </div>
        
        <input
          type="text"
          value={inputColor}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={formStyles.colorInput}
          aria-label="Color hex value"
        />
        
        {showColorPalette && (
          <div className={formStyles.colorPalette}>
            {colors.map((color) => (
              <button
                key={color.value}
                className={formStyles.colorOption}
                style={{ backgroundColor: color.value }}
                onClick={() => handleSelectColor(color.value)}
                aria-label={`Select color ${color.name}`}
                data-tooltip={color.name}
              />
            ))}
            
            <div className={formStyles.colorPickerCustom}>
              <label htmlFor="customColor" className={formStyles.colorPickerLabel}>
                Custom
              </label>
              <input
                type="color"
                id="customColor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={formStyles.nativeColorPicker}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
