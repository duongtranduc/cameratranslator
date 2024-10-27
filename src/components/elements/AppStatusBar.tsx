import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface AppStatusBarProps extends StatusBarProps {}

const AppStatusBar: React.FC<AppStatusBarProps> = (props) => {
  const isFocused = useIsFocused();

  return isFocused ? <StatusBar {...props} /> : null;
};

export default AppStatusBar;