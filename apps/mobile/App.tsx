import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { pingApi } from './api'; // our helper

export default function App() {
  // State to store what the API says
  const [message, setMessage] = useState('loading...');

  // When the app loads, ask the API for /health
  useEffect(() => {
    (async () => {
      try {
        const result = await pingApi();
        setMessage(`${result.ok ? 'OK' : 'Error'} — ${result.ts}`);
      } catch (err) {
        setMessage('API call failed: ' + (err as Error).message);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Your original hello text */}
      <Text>Findamine — Hello from Expo (Web/Mobile)</Text>
      
      {/* New line showing what the API returned */}
      <Text>{message}</Text>

      <StatusBar style="auto" />
    </View>
  );
}