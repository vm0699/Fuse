import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface CircularNextButtonProps {
    onPress: () => void;
    disabled?: boolean;
  }
  
  export function CircularNextButton({ onPress, disabled = false }: CircularNextButtonProps) {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={disabled}
      >
        <ArrowRight className="h-6 w-6 text-white" />
      </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabled: {
    backgroundColor: '#666', // Disabled state color
  },
});

export default CircularNextButton