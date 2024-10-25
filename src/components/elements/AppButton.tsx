import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import AppText, { FONT_FAMILY } from './AppText';
import { Colors } from '../../configs/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle | any;
  textStyle?: TextStyle | TextStyle[] | any;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ title, onPress, style, textStyle , disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <AppText style={[styles.buttonText, textStyle]}>{title}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  disabledText: {
    color: Colors.text,
  },
});

export default AppButton;
