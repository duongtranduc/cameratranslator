import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Colors } from '../../configs/colors';
import { FONT_FAMILY } from './AppText';

interface AppTextInputProps extends TextInputProps {
  // Add any additional props here if needed
}

const AppTextInput: React.FC<AppTextInputProps> = (props: AppTextInputProps) => {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor={Colors.placeholder}
      textAlign={props.textAlign}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: Colors.text
  },
});

export default AppTextInput;
