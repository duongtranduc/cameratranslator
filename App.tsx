// In App.js in a new project

import * as React from 'react';
import { View, Text, StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IntroScreen from './src/screens/IntroScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LanguageSelect from './src/screens/LanguageSelect';
import HomeScreen from './src/screens/HomeScreen';
import Setting from './src/screens/Setting';
import TranslateScreen from './src/screens/Translate';
import ConversationScreen from './src/screens/ConversationScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HistoryDetailScreen from './src/screens/HistoryDetailScreen';
import CameraTranslate from './src/screens/CameraTranslate';
import CameraTranslateResultScreen from './src/screens/CameraTranslateResult';
import { Colors } from './src/configs/colors';


const Stack = createNativeStackNavigator();

function App() {

  const [initialRoute, setInitialRoute] = React.useState('');


  React.useEffect(() => {
    console.log('App.js useEffect');
    SplashScreen.hide();

    const initializeApp = async () => {
      const currentLanguage = await AsyncStorage.getItem('currentLanguage');
      if (currentLanguage) {
        setInitialRoute('IntroScreen');
      }
      else {
        setInitialRoute('LanguageSelect');
      }
      // SplashScreen.hide();
    };
    initializeApp();
  }, []);

  if (!initialRoute) {
    return null; // or a loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
          initialRouteName={initialRoute}
        // initialRouteName="LanguageSelect"
        >
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="IntroScreen" component={IntroScreen} />
          <Stack.Screen name="LanguageSelect" component={LanguageSelect} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="TranslateScreen" component={TranslateScreen} />
          <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
          <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
          <Stack.Screen name="HistoryDetailScreen" component={HistoryDetailScreen} />
          <Stack.Screen name="CameraTranslate" component={CameraTranslate} />
          <Stack.Screen name="CameraTranslateResult" component={CameraTranslateResultScreen} />
          {/*
          <Stack.Screen name="TextRecognizedDetail" component={TextRecognizedDetail} />
          <Stack.Screen name="CameraTranslateResult" component={CameraTranslateResultScreen} />
          */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider >
  );
}

export default App;
