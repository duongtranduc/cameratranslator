import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AppBannerAd from '../components/ads/AppBannerAd';
import { Colors } from '../configs/colors';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { adUnits } from '../components/ads/adUnit';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppStatusBar from '../components/elements/AppStatusBar';

interface Slide {
    key: number;
    title: string;
    text: string;
    image: any;
    backgroundColor: string;
}

const slides: Slide[] = [
    {
        key: 1,
        title: 'TEXT AND AUDIO TRANSLATOR',
        text: 'Easily break language barriers with real-time voice translation. Simply speak into your device and instantly grasp the translations.',
        image: require('../assets/intro1.png'),
        backgroundColor: '#59b2ab',
    },
    {
        key: 2,
        title: 'CAMERA TRANSLATOR',
        text: 'Enhance your travel experience by translating menus, signs, or any document with a simple picture snap, making it enjoyable and stress-free.',
        image: require('../assets/intro2.png'),
        backgroundColor: '#febe29',
    },
    {
        key: 3,
        title: 'REAL-TIME MULTILINGUAL CONVERSION',
        text: 'Engage in smooth and enjoyable real-time conversions with foreigners using Conversion mode, making your cross-language interactions seamless.',
        image: require('../assets/intro3.png'),
        backgroundColor: '#22bcb5',
    },
    {
        key: 4,
        title: 'SUPPORT 100+ LANGUAGE',
        text: 'Feel free to translate a Spanish, Russian. Italian, Japanese, French and more the 100 languages.',
        image: require('../assets/intro4.png'),
        backgroundColor: '#22bcb5',
    },
];

interface IntroScreenProps {
    navigation: any;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [adUnitId, setAdUnitId] = useState<string | null>(null);

    //get width and height of screen
    const { width, height } = Dimensions.get('window');
 

    useEffect(() => {
        console.log('width', width);
        console.log('height', height);
        
        const updateAdUnitId = async () => {
            const newAdUnitId = await getAdUnitId(currentSlideIndex);
            setAdUnitId(newAdUnitId);
        };
        updateAdUnitId();
    }, [currentSlideIndex]);

    const getAdUnitId = async (index: number) => {
        const isFirst = await AsyncStorage.getItem('isFirst') === null;
        if (!isFirst) {
            switch (index) {
                case 0:
                    return adUnits.native_intro_1_2nd;
                case 1:
                    return adUnits.native_intro_2_2nd;
                case 2:
                    return adUnits.native_intro_3_2nd;
                case 3:
                    return adUnits.native_intro_4_2nd;
                default:
                    return adUnits.native_intro_1_2nd;
            }
        } else {
            switch (index) {
                case 0:
                    return adUnits.native_intro_1;
                case 1:
                    return adUnits.native_intro_2;
                case 2:
                    return adUnits.native_intro_3;
                case 3:
                    return adUnits.native_intro_4;
                default:
                    return adUnits.native_intro_1;
            }
        }
    };

    const onSlideChange = (index: number) => {
        setCurrentSlideIndex(index);
    };

    const onDone = async () => {
        await AsyncStorage.setItem('isFirst', 'false');
        navigation.navigate('HomeScreen');
    };
    const renderItem = ({ item }: { item: Slide }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.imageTopBackground} />
                <Image source={item.image} style={styles.image} resizeMode={height/width > 1.78 ? 'contain' : 'stretch'} />
                <View style={styles.textContainer}>
                    <AppText style={styles.title}>{item.title}</AppText> 
                    <AppText style={styles.text}>{item.text}</AppText>
                </View>
            </View>
        );
    };

    const renderNextButton = () => {
        return (
            <View style={styles.nextButton}>
                <AppText style={styles.buttonText2}>Next</AppText>
            </View>
        );
    };
    const renderDoneButton = () => {
        return (
            <View style={styles.doneButton}>
                <AppText style={styles.buttonText2}>Started</AppText>
            </View>
        );
    };

    const renderSkipButton = () => {
        return (
            <View style={styles.skipButton}>
                <AppText style={styles.buttonText}>Skip</AppText>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppStatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
            <AppIntroSlider
                renderItem={renderItem}
                data={slides}
                onDone={onDone}
                onSkip={onDone}
                renderNextButton={renderNextButton}
                renderDoneButton={renderDoneButton}
                activeDotStyle={styles.activeDot}
                dotStyle={{ backgroundColor: "#C0C4D1" }}
                onSlideChange={onSlideChange}
            />
            <View style={{  width: '100%', alignItems: 'center', backgroundColor: '#F0F3F6' }}>           
                {adUnitId && <AppBannerAd adUnitId={adUnitId}   />}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#F0F3F6",
    },
    imageTopBackground: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 50, // Adjust the height as needed
        backgroundColor: Colors.primary,
    },
    image: {
        width: '100%',
        height: '60%',
        zIndex: 100,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50,
    },
    title: {
        fontSize: 20,
        color: Colors.primary,
        textAlign: 'center',
        fontFamily: FONT_FAMILY.BOLD,
    },
    text: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 10,
        fontFamily: FONT_FAMILY.REGULAR,
        color: Colors.text,
    },
    nextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12
    },
    doneButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12
    },
    activeDot: {
        backgroundColor: Colors.primary,
        width: 30,
    },
    skipButton: {
        padding: 16,
        borderRadius: 5,
        marginLeft: 10,
    },
    buttonText: {
        color: Colors.text,
        fontFamily: FONT_FAMILY.BOLD,
        fontSize: 16,
    },
    buttonText2: {
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        fontSize: 16,
    }
});

export default IntroScreen;
