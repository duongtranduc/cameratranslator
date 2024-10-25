import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../configs/colors';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import TranslateSVG from '../assets/translate.svg';
import StarSVG from '../assets/star.svg';
import ShareSVG from '../assets/share.svg';
import LockSVG from '../assets/lock.svg';
import DocumentSVG from '../assets/document.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppBannerAd from '../components/ads/AppBannerAd';
import { adUnits } from '../components/ads/adUnit';
const Setting: React.FC = () => {
    const navigation = useNavigation();
    const settingsOptions = [
        { title: 'Languages', icon: TranslateSVG, onPress: () => navigation.navigate('LanguageSelect' as never) },
        { title: 'Rate Us', icon: StarSVG, onPress: () => navigation.navigate('RateUs' as never) },
        { title: 'Share to friend', icon: ShareSVG, onPress: () => navigation.navigate('ShareToFriend' as never) },
        { title: 'Privacy', icon: LockSVG, onPress: () => navigation.navigate('Privacy' as never) },
        { title: 'Term of Use', icon: DocumentSVG, onPress: () => navigation.navigate('TermOfUse' as never) },
    ];

    const handleBack = () => {
        navigation.goBack();
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { elevation: 0, backgroundColor: Colors.backgroundSecondary }]}>
                <View style={{ position: "absolute", left: 15 }}>
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                <AppText style={styles.headerText}>Conversation</AppText>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                {settingsOptions.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.option} onPress={option.onPress}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <option.icon width={22} height={22} />
                            <AppText style={styles.optionText}>{option.title}</AppText>
                        </View>
                        <Ionicons name='chevron-forward' size={20} color={Colors.text} />
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.adContainer}>
                <AppBannerAd adUnitId={adUnits.native_language_setting} />
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
    backButton: {
        padding: 10,
    },
    headerText: {
        fontSize: 20,
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 12,
        marginVertical: 7,
        paddingLeft: 12
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 15,
    },
    optionText: {
        fontSize: 14,
        color: Colors.text,
        fontFamily: FONT_FAMILY.MEDIUM
    },
    adContainer: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    adImage: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    adTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    adDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 10,
        color: Colors.text,
    },
    installButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,

    },
    installButtonText: {
        color: Colors.text,
        fontSize: 16,
    },
});

export default Setting;
