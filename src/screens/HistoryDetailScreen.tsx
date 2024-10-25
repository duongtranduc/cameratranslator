import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { Colors } from '../configs/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppBannerAd from '../components/ads/AppBannerAd';
import { adUnits } from '../components/ads/adUnit';
import TrashSVG from '../assets/trash-2.svg';
type HistoryItem = {
    id: number;
    inputText: string;
    outputText: string;
    inputLanguage: string;
    outputLanguage: string;
    timestamp: string;
};

const HistoryDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { languagePair } = route.params;
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [expandedItems, setExpandedItems] = useState<{[key: number]: boolean}>({});
    
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const historyData = await AsyncStorage.getItem('translationHistory');
            if (historyData) {
                const allHistory: HistoryItem[] = JSON.parse(historyData);
                const filteredHistory = allHistory.filter(
                    item => item.inputLanguage === languagePair.inputLanguage && 
                            item.outputLanguage === languagePair.outputLanguage
                );
                setHistory(filteredHistory);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            Alert.alert('Error', 'Failed to load translation history');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const deleteHistoryItem = async (id: number) => {
        try {
            const historyData = await AsyncStorage.getItem('translationHistory');
            if (historyData) {
                let allHistory: HistoryItem[] = JSON.parse(historyData);
                allHistory = allHistory.filter(item => item.id !== id);
                await AsyncStorage.setItem('translationHistory', JSON.stringify(allHistory));
                
                // Update the local state
                setHistory(history.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('Error deleting history item:', error);
            Alert.alert('Error', 'Failed to delete history item');
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <View style={styles.historyItem}>
                <View style={styles.textContainer}>
                    <AppText 
                        style={styles.translationText} 
                        textProps={{numberOfLines: expandedItems[item.id] ? undefined : 1}}
                    >
                        {item.inputText}
                    </AppText>
                    <AppText 
                        style={styles.outputText} 
                        textProps={{numberOfLines: expandedItems[item.id] ? undefined : 1}}
                    >
                        {item.outputText}
                    </AppText>
                </View>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteHistoryItem(item.id)}
                >
                    <TrashSVG width={24} height={24} color={Colors.red} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { elevation: 0, backgroundColor: Colors.backgroundSecondary }]}>
                <View style={{ position: "absolute", left: 5 }}>
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                <AppText style={styles.headerText}>
                    {languagePair.inputLanguage} - {languagePair.outputLanguage}
                </AppText>
            </View>
            <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id.toString()}
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
    },
    header: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.text,
    },
    list: {
        flex: 1,
        padding: 10,
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    historyItem: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    translationText: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: Colors.text,
        marginBottom: 5,
    },
    outputText: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: Colors.primary,
    },
    deleteButton: {
        padding: 5,
    },
    
});

export default HistoryDetailScreen;
