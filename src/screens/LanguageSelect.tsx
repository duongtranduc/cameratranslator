import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image, Button } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../configs/colors';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import AppBannerAd from '../components/ads/AppBannerAd';
import TickSVG from '../assets/tick.svg';
import { adUnits } from '../components/ads/adUnit';
import EN_SVG from '../assets/en-flag.svg';
import FR_SVG from '../assets/fr-flag.svg';
import ZH_SVG from '../assets/zh-flag.svg';
import ID_SVG from '../assets/id-flag.svg';
import HI_SVG from '../assets/hi-flag.svg';
import DE_SVG from '../assets/de-flag.svg';
import { SvgProps } from 'react-native-svg';
import AppStatusBar from '../components/elements/AppStatusBar';
import { BannerAdSize } from 'react-native-google-mobile-ads';

type Language = [string, string] | [string, string, React.FC<SvgProps>];

const languages: Language[] = [
    ["English", "en", EN_SVG],
    ["French", "fr", FR_SVG],
    ["Chinese", "zh", ZH_SVG],
    ["Indonesian", "id", ID_SVG],
    ["India", "hi", HI_SVG],
    ["German", "de", DE_SVG],
];


const LanguageSelect: React.FC = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentLanguage, setCurrentLanguage] = useState<Language>(["Auto-detect", "auto"]);

    const filteredLanguages = languages.filter(lang =>
        lang[0].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onSelectLanguage = async (language: Language) => {
        AsyncStorage.setItem('currentLanguage', JSON.stringify(language));
        setCurrentLanguage(language);
        //check if the first time user open the app
        const value = await AsyncStorage.getItem('firstTime');
        if (value === null || value === 'true') {
            navigation.navigate('IntroScreen');
            AsyncStorage.setItem('firstTime', 'false');
        } else {
            navigation.navigate('HomeScreen');
        }

        //Set input language to current language
        AsyncStorage.setItem('inputLanguage', JSON.stringify(language));

        //set output language to english
        AsyncStorage.setItem('outputLanguage', JSON.stringify(["English", "en"]));
    };

    const onPressLanguage = (language: Language) => {
        setCurrentLanguage(language);
        // navigation.navigate('HomeScreen');
        // setAdUnitId(adUnits.native_language_selected);

    };

    const renderItem = ({ item }: { item: Language }) => (
        <TouchableOpacity
            style={styles.languageItem}
            onPress={() => {
                onPressLanguage(item);
            }}
        >
            <View style={styles.languageInfo}>
                {item[2] && React.createElement(item[2], { width: 25, height: 25 })}
                <AppText style={styles.languageName}>{item[0]}</AppText>
            </View>
            <View style={styles.circleContainer}>
                <View style={[
                    styles.circle,
                    currentLanguage[1] === item[1] && styles.selectedCircle
                ]}>
                    {currentLanguage[1] === item[1] && (
                        <View style={styles.innerCircle} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppStatusBar barStyle="dark-content" backgroundColor={Colors.backgroundSecondary} />

            {/* <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Select Language" />
            </Appbar.Header> */}
            {/* <Searchbar
                placeholder="Search languages"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            /> */}
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <AppText style={styles.headerText}>Language</AppText>
                    <TouchableOpacity onPress={() => onSelectLanguage(currentLanguage)}>
                        {currentLanguage[1] !== 'auto' && <TickSVG width={30} height={30} fill={Colors.primary} />}
                    </TouchableOpacity>
                </View>
                <AppText style={styles.descriptionText}>Please choose your native language. You can change language from settings later.</AppText>
            </View>

            <FlatList
                data={languages}
                renderItem={renderItem}
                keyExtractor={(item) => item[1]}
            />
            <View style={styles.footerContainer}>
                {/* <AppButton
                    title="Tiếp tục"
                    onPress={() => onSelectLanguage(currentLanguage)}
                /> */}
                {
                    currentLanguage[1] !== 'auto' ?
                        <AppBannerAd adUnitId={adUnits.native_language_selected} size={BannerAdSize.LARGE_BANNER} /> :
                        <AppBannerAd adUnitId={adUnits.native_language} size={BannerAdSize.LARGE_BANNER} />
                }
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    searchBar: {
        margin: 16,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    headerContainer: {
        margin: 16,
    },
    headerText: {
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        fontSize: 24,
        color: Colors.primary,
    },
    descriptionText: {
        fontFamily: FONT_FAMILY.REGULAR,
        fontSize: 12,
        color: Colors.text,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        // borderWidth: 1,
        // borderColor: Colors.primary,
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
    },
    languageName: {
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        fontSize: 14,
        color: '#333',
    },
    selectedIndicator: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    flag: {
        width: 25,
        height: 20,
        marginRight: 8,
        borderRadius: 4,
    },
    circleContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
    },
    innerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    selectedCircle: {
        borderColor: Colors.primary,
    },
    footerContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    button: {
        margin: 16,
    },
    buttonText: {
        color: Colors.primary,
    },
    adsContainer: {
        margin: 30,
        height: 170,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    adPlaceholder: {
        height: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 10,
    },
    adPlaceholderText: {
        color: '#888',
        fontSize: 12,
    },
});

export default LanguageSelect;
