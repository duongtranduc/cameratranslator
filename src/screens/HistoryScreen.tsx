import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { Colors } from '../configs/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppBannerAd from '../components/ads/AppBannerAd';
import { adUnits } from '../components/ads/adUnit';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const historyInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_history_groupoftranslations, {
    requestNonPersonalizedAdsOnly: true,
});
// Define the history item type
type HistoryItem = {
    id: number;
    inputText: string;
    outputText: string;
    inputLanguage: string;
    outputLanguage: string;
    timestamp: string;
};

// Define the language pair type
type LanguagePair = {
    key: string;
    inputLanguage: string;
    outputLanguage: string;
    count: number;
};

const HistoryScreen = () => {
    const navigation = useNavigation<any>();
    const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([]);
    const [adLoaded, setAdLoaded] = useState(false);
    
    const loadAd = useCallback(() => {
        const unsubscribeLoaded = historyInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        historyInterstitial.load();

        return () => {
            unsubscribeLoaded();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAd();
            return () => {
                // Cleanup if needed
            };
        }, [loadAd])
    );

    const showAdAndNavigate = useCallback((adInstance: InterstitialAd, screenName: string, languagePair: any) => {
        if (adInstance.loaded) {
            const unsubscribeClosed = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
                navigation.navigate(screenName, { languagePair });
                unsubscribeClosed();
                loadAd(); // Reload ad after it's closed
            });
            adInstance.show();
        } else {
            navigation.navigate(screenName, { languagePair });
            loadAd(); // Reload ad if it couldn't be shown
        }
    }, [navigation, loadAd]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const historyData = await AsyncStorage.getItem('translationHistory');
            if (historyData) {
                const history: HistoryItem[] = JSON.parse(historyData);
                const pairs = groupByLanguagePairs(history);
                setLanguagePairs(pairs);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            Alert.alert('Error', 'Failed to load translation history');
        }
    };

    const groupByLanguagePairs = (history: HistoryItem[]): LanguagePair[] => {
        const pairsMap = new Map<string, LanguagePair>();

        history.forEach(item => {
            const key = `${item.inputLanguage}-${item.outputLanguage}`;
            if (pairsMap.has(key)) {
                pairsMap.get(key)!.count++;
            } else {
                pairsMap.set(key, {
                    key,
                    inputLanguage: item.inputLanguage,
                    outputLanguage: item.outputLanguage,
                    count: 1
                });
            }
        });

        return Array.from(pairsMap.values());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleLanguagePairPress = useCallback((item: LanguagePair) => () => {
        console.log('item', item);
        
        if (adLoaded) {
            showAdAndNavigate(historyInterstitial, 'HistoryDetailScreen', item);
        } else {
            navigation.navigate('HistoryDetailScreen', { languagePair: item });
            loadAd(); // Reload ad if it's not loaded
        }
    }, [adLoaded, showAdAndNavigate, navigation]);

    const renderLanguagePairItem = ({ item }: { item: LanguagePair }) => (
        <TouchableOpacity
            style={styles.languagePairItem}
            onPress={handleLanguagePairPress(item)}
        >
            <View style={styles.languagePair}>
                <AppText style={styles.language}>{item.inputLanguage} - {item.outputLanguage}</AppText>
            </View>
            <View style={styles.countContainer}>
                <AppText style={styles.count}>{item.count}</AppText>
                <Ionicons name="chevron-forward" size={16} color={Colors.text} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { elevation: 0, backgroundColor: Colors.backgroundSecondary }]}>
                <View style={{ position: "absolute", left: 15 }}>
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                <AppText style={styles.headerText}>History</AppText>
            </View>
            <FlatList
                data={languagePairs}
                renderItem={renderLanguagePairItem}
                keyExtractor={item => item.key}
                style={styles.list}
            />
            <View style={styles.adContainer}>
                <AppBannerAd adUnitId={adUnits.native_voicetranslator} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        height: 50,
    },
    headerText: {
        fontSize: 20,
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        textAlign: "center",
    },
    historyList: {
        flex: 1,
        padding: 10,
    },
    historyItem: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    languagePair: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    language: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.primary,
        marginHorizontal: 5,
        lineHeight: 20,
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginRight: 5,
    },
    count: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.REGULAR,
        color: Colors.text,
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        flex: 1,
        padding: 20,
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    languagePairItem: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default HistoryScreen;
