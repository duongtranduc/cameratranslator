import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import { Colors } from '../../configs/colors';

interface AppBannerAdProps {
  adUnitId?: string;
}

const AppBannerAd: React.FC<AppBannerAdProps> = ({ adUnitId = TestIds.ADAPTIVE_BANNER }) => {

  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    Platform.OS === 'ios' && bannerRef.current?.load();
  })

  return (
    <BannerAd
      ref={bannerRef}
      unitId={adUnitId}
      size={BannerAdSize.LARGE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdLoaded={() => {
        console.log('Ad loaded successfully');
      }}
      onAdFailedToLoad={(error) => {
        console.log('Ad failed to load:', error);
      }}
    />
  );
};

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     backgroundColor: Colors.white,
//     borderRadius: 12,
//   },
//   fakeBanner: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: Colors.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     borderRadius: 12,
//   },
//   fakeAdText: {
//     color: Colors.text,
//     fontSize: 16,

//   },
//   fakeAdTextDescription: {
//     color: Colors.text,
//     fontSize: 12,
//   },
//   fakeAdImage: {
//     width: 50,
//     height: 50,
//   },
//   fakeAdContainer: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     gap: 10,

//   },
//   fakeAdTextContainer: {
//     width: '80%',
//     height: '100%',
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     justifyContent: 'flex-start',
//   },
//   fakeAdButton: {
//     width: '100%',
//     height: 40,
//     backgroundColor: Colors.primary,
//     borderRadius: 10,
//   },
//   fakeAdButtonText: {
//     color: Colors.white,
//     fontSize: 12,
//     lineHeight: 15,
//   },
// });

export default AppBannerAd;
