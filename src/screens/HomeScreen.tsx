import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Image, TouchableOpacity, ScrollView, PermissionsAndroid, SafeAreaView } from 'react-native';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { Colors } from '../configs/colors';
import AppButton from '../components/elements/AppButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppBannerAd from '../components/ads/AppBannerAd';
import { Platform } from 'react-native';
import { AdEventType, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { adUnits } from '../components/ads/adUnit';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import SettingIcon from '../assets/setting-2.svg';
import AppStatusBar from '../components/elements/AppStatusBar';

// Sử dụng Test ID hoặc adUnitId thật nếu đã có
const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
    requestNonPersonalizedAdsOnly: true,
});

const voicetranslatorInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_home_voicetranslator, {
    requestNonPersonalizedAdsOnly: true,
});

const conversionInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_home_conversiontranslator, {
    requestNonPersonalizedAdsOnly: true,
});

const cameraInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_home_cameratraslator, {
    requestNonPersonalizedAdsOnly: true,
});

const historyInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_home_history, {
    requestNonPersonalizedAdsOnly: true,
});


const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [adLoaded, setAdLoaded] = useState(false);

    // Thêm các state để theo dõi trạng thái của quảng cáo
    const [conversionAdLoaded, setConversionAdLoaded] = useState(false);
    const [cameraAdLoaded, setCameraAdLoaded] = useState(false);
    const [historyAdLoaded, setHistoryAdLoaded] = useState(false);

    // Thêm hàm để tải lại quảng cáo
    const reloadAds = () => {
        voicetranslatorInterstitial.load();
        interstitial.load();
        conversionInterstitial.load();
        cameraInterstitial.load();
        historyInterstitial.load();
    };

    // Sử dụng useFocusEffect để tải lại quảng cáo khi màn hình được focus
    useFocusEffect(
        React.useCallback(() => {
            reloadAds();
            return () => {
                // Cleanup nếu cần
            };
        }, [])
    );

    useEffect(() => {
        console.log("Loading interstitial...");
        // Lắng nghe sự kiện khi quảng cáo được tải
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            console.log('Ad Loaded, showing interstitial');
            setAdLoaded(true);
        });

        const unsubscribeFailed = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.log('Ad Load Failed:', error);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            console.log('Ad Closed');
        });

        // Thêm các listener cho các quảng cáo mới
        const unsubscribeVoicetranslatorLoaded = voicetranslatorInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        const unsubscribeConversionLoaded = conversionInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setConversionAdLoaded(true);
        });
        const unsubscribeCameraLoaded = cameraInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setCameraAdLoaded(true);
        });
        const unsubscribeHistoryLoaded = historyInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setHistoryAdLoaded(true);
        });

        // Tải quảng cáo
        voicetranslatorInterstitial.load();
        interstitial.load();
        conversionInterstitial.load();
        cameraInterstitial.load();
        historyInterstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeFailed();
            unsubscribeClosed();
            unsubscribeVoicetranslatorLoaded();
            unsubscribeConversionLoaded();
            unsubscribeCameraLoaded();
            unsubscribeHistoryLoaded();
        };
    }, []);

    // Cập nhật hàm showAdAndNavigate
    const showAdAndNavigate = (adInstance: InterstitialAd, screenName: string) => {
        if (adInstance.loaded) {
            const unsubscribeClosed = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
                navigation.navigate(screenName);
                unsubscribeClosed();
                reloadAds(); // Tải lại quảng cáo sau khi đóng
            });
            adInstance.show();
        } else {
            navigation.navigate(screenName);
            reloadAds(); // Tải lại quảng cáo nếu không thể hiển thị
        }
    };

    const handleClickTranslate = () => {
        if (adLoaded) {
            showAdAndNavigate(voicetranslatorInterstitial, 'TranslateScreen');
        } else {
            navigation.navigate('TranslateScreen');
        }
    }

    const handleClickCamera = () => {
        // Xin quyền camera cho cả Android và iOS
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "App needs access to your camera to take photos.",
                    buttonPositive: "OK",
                }
            ).then(() => {
                if (cameraAdLoaded) {
                    showAdAndNavigate(cameraInterstitial, 'CameraTranslate');
                } else {
                    navigation.navigate('CameraTranslate');
                }
            }).catch((err) => {
                console.log(err);
            });
        } else if (Platform.OS === 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available on this device.');
                            break;
                        case RESULTS.DENIED:
                            request(PERMISSIONS.IOS.CAMERA)
                                .then((response) => {
                                    if (response === RESULTS.GRANTED) {
                                        if (cameraAdLoaded) {
                                            showAdAndNavigate(cameraInterstitial, 'CameraTranslate');
                                        } else {
                                            navigation.navigate('CameraTranslate');
                                        }
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                            break;
                        case RESULTS.GRANTED:
                            if (cameraAdLoaded) {
                                showAdAndNavigate(cameraInterstitial, 'CameraTranslate');
                            } else {
                                navigation.navigate('CameraTranslate');
                            }
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The camera permission is blocked and cannot be requested.');
                            break;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const handleClickConversation = () => {
        if (conversionAdLoaded) {
            showAdAndNavigate(conversionInterstitial, 'ConversationScreen');
        } else {
            navigation.navigate('ConversationScreen');
        }
    }

    const handleClickHistory = () => {
        if (historyAdLoaded) {
            showAdAndNavigate(historyInterstitial, 'HistoryScreen');
        } else {
            navigation.navigate('HistoryScreen');
        }
    }

    const handleClickSetting = () => {
        navigation.navigate('Setting');
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppStatusBar barStyle="dark-content" backgroundColor={Colors.backgroundSecondary} />
            <ScrollView >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                    </View>
                    <View style={styles.headerCenter}>
                        <AppText style={styles.title}>Voice Translator</AppText>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={handleClickSetting} style={styles.settingsButton}>
                            <SettingIcon width={24} height={24} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.adContainer}>
                    <AppBannerAd adUnitId={adUnits.native_home} size={BannerAdSize.LARGE_BANNER} />
                </View>
                <View style={styles.cardVoiceTranslator} >
                    <View style={styles.cardVoiceTranslatorHeader}>
                        <View style={styles.cardVoiceTranslatorHeaderLeft}>
                            <Image source={require('../assets/micro.png')} style={styles.microImage} />
                        </View>
                        <View style={styles.cardVoiceTranslatorHeaderRight}>
                            <AppText style={styles.cardTitleVoiceTranslator}>Voice Translator</AppText>
                            <AppText style={styles.cardDescriptionVoiceTranslator}>Translate your speech or Text</AppText>
                        </View>
                    </View>
                    <AppButton
                        title={`Let's Start`}
                        onPress={handleClickTranslate}
                        style={styles.startButton}
                        textStyle={styles.startButtonText}
                    />
                </View>
                <View style={styles.cardBottomContainer}>
                    <View style={styles.cardCameraTranslator}>
                        <Image source={require('../assets/camera-translator-icon.png')} style={styles.cameraImage} />
                        <View style={{ flex: 1 }} />
                        <AppText style={styles.cardTitle}>Camera Translator</AppText>
                        <AppText style={styles.cardDescription}>Take photos and translate</AppText>
                        <AppButton
                            title={`Start`}
                            onPress={handleClickCamera}
                            style={[styles.startButtonSecondary, { backgroundColor: '#6F7AFF', marginTop: 10 }]}
                            textStyle={styles.startButtonTextSecondary}
                        />
                    </View>
                    <View style={styles.cardRightBottomContainer}>
                        <View style={styles.cardConversion}>
                            <AppText style={[styles.cardTitle, { color: "#188834" }]}
                                textProps={{ numberOfLines: 1 }}
                            >Conversation</AppText>
                            <AppText style={[styles.cardDescription, { color: "#188834" }]} >Voice chat in all languages</AppText>
                            <View style={{ flex: 1 }} />
                            <Image source={require('../assets/conversion-icon.png')} style={styles.conversionImage} />
                            <AppButton
                                title={`Start`}
                                onPress={handleClickConversation}
                                style={[styles.startButtonSecondary, { backgroundColor: '#5B943F', width: 80, marginTop: 45 }]}
                                textStyle={styles.startButtonTextSecondary}
                            />
                        </View>
                        <View style={styles.cardHistory}>
                            <AppText style={[styles.cardTitle, { color: "#D75F2D" }]}>History</AppText>
                            <AppText style={[styles.cardDescription, { color: "#D75F2D" }]}>View your history</AppText>
                            <View style={{ flex: 1 }} />
                            <Image source={require('../assets/history.png')} style={styles.conversionImage} />
                            <AppButton
                                title={`Start`}
                                onPress={handleClickHistory}
                                style={[styles.startButtonSecondary, { backgroundColor: '#F5BE62', width: 80, marginTop: 60 }]}
                                textStyle={styles.startButtonTextSecondary}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerLeft: {
        flex: 1,
    },
    headerCenter: {
        flex: 3,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    welcomeText: {
        fontSize: 18,
        color: '#333',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    settingsButton: {
        backgroundColor: Colors.primary,
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButtonText: {
        fontSize: 16,
        color: '#333',
    },
    adContainer: {
        backgroundColor: '#fff',
        // padding: 15,
        margin: 20,
        borderRadius: 10,
        alignItems: 'center',
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    adText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    adDescription: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
    },
    adButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 5,
        width: '100%',
        alignItems: 'center',
        borderRadius: 5,
    },
    adButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardConversion: {
        backgroundColor: '#D2EFC3',
        padding: 20,
        borderRadius: 10,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    cardHistory: {
        backgroundColor: '#FFEEDD',
        padding: 20,
        borderRadius: 10,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: "#464DCD",
        lineHeight: 22,
    },
    cardDescription: {
        fontSize: 11,
        color: "#464DCD",
        // marginVertical: 5,
    },
    startButton: {
        backgroundColor: '#3763FD',
        paddingVertical: 6,
        alignItems: 'center',
    },
    startButtonText: {
        color: Colors.white,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        fontSize: 15,
        lineHeight: 21,
    },
    cardVoiceTranslator: {
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 5,
        marginHorizontal: 20,
        borderRadius: 10,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    cardVoiceTranslatorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5
    },
    cardVoiceTranslatorHeaderLeft: {
    },
    cardVoiceTranslatorHeaderRight: {
        width: '70%',
    },
    microImage: {
        width: 100,
        height: 100,
        //fit to screen 
        resizeMode: 'contain',
    },
    cardTitleVoiceTranslator: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.text,
        lineHeight: 23,
    },
    cardDescriptionVoiceTranslator: {
        fontSize: 13,
        color: Colors.text,
        marginTop: 0,
        width: '80%'
    },
    cardBottomContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 20,
    },
    cardCameraTranslator: {
        backgroundColor: "#E3E5FF",
        width: '48%',
        borderRadius: 10,
        padding: 20,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,

    },
    cardRightBottomContainer: {
        width: '48%',
        borderRadius: 10,
        gap: 10,
        justifyContent: 'space-between',
    },
    startButtonSecondary: {
        paddingVertical: 5,
        alignItems: 'center',
    },
    startButtonTextSecondary: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        lineHeight: 18,
    },
    cameraImage: {
        marginTop: 20,
        height: 120,
        width: 120,
        resizeMode: 'contain',
        // alignSelf: 'flex-end',
    },
    conversionImage: {
        position: 'absolute',
        width: 80,
        height: 80,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        // top: 0,
        right: 0,
        top: 55

    },
});

export default HomeScreen;