import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Alert, SafeAreaView } from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCameraDevices,
    useCameraFormat,
    useCameraPermission,
    useFrameProcessor,
} from "react-native-vision-camera";
// import { PhotoRecognizer } from "react-native-vision-camera-text-recognition";
import TextRecognition from '@react-native-ml-kit/text-recognition';

import { Colors } from '../configs/colors';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { languages } from '../configs/languages';
import TickSVG from '../assets/tick.svg';
import AppTextInput from '../components/elements/AppTextInput';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { adUnits } from '../components/ads/adUnit';
import ImageCropPicker from 'react-native-image-crop-picker';
import AppStatusBar from '../components/elements/AppStatusBar';

const cameraTakePhotoInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_cameratranslator_takephoto, {
    requestNonPersonalizedAdsOnly: true,
});

const cameraSelectPhotoInterstitial = InterstitialAd.createForAdRequest(adUnits.inter_cameratranslator_selectphoto, {
    requestNonPersonalizedAdsOnly: true,
});

const CameraTranslate: React.FC = () => {
    const navigation = useNavigation<any>();
    const { hasPermission, requestPermission } = useCameraPermission()
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const devices = useCameraDevices()
    const device = useMemo(() => devices.find(device => device.position === 'back'), [devices])
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [recognizedText, setRecognizedText] = useState<any>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [inputLanguage, setInputLanguage] = useState<string[]>(languages[0]);
    const [outputLanguage, setOutputLanguage] = useState<string[]>(languages[1]);
    const [isOnFlash, setIsOnFlash] = useState<boolean>(false);
    const [selectInputLanguage, setSelectInputLanguage] = useState<string[]>(languages[0]);
    const [selectOutputLanguage, setSelectOutputLanguage] = useState<string[]>(languages[1]);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [adLoaded, setAdLoaded] = useState<boolean>(false);

    useEffect(() => {
        checkAndRequestPermission();
    }, []);

    const loadAd = useCallback(() => {
        const unsubscribeLoaded = cameraTakePhotoInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });
        const unsubscribeLoaded2 = cameraSelectPhotoInterstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        cameraTakePhotoInterstitial.load();
        cameraSelectPhotoInterstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeLoaded2();
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

    const reloadAds = () => {
        cameraTakePhotoInterstitial.load();
        cameraSelectPhotoInterstitial.load();
    }


    const showAdAndNavigate = (adInstance: InterstitialAd, screenName: string, params?: any) => {
        if (adInstance.loaded) {
            const unsubscribeClosed = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
                navigation.navigate(screenName, params);
                unsubscribeClosed();
                reloadAds(); // Tải lại quảng cáo sau khi đóng
            });
            adInstance.show();
        } else {
            navigation.navigate(screenName, params);
            reloadAds(); // Tải lại quảng cáo nếu không thể hiển thị
        }
    };

    const checkAndRequestPermission = async () => {
        if (!hasPermission) {
            const newPermission = await requestPermission();
            if (!newPermission) {
                setIsCameraAvailable(false);
                Alert.alert(
                    "Camera Permission",
                    "Camera access is required to use this feature. Please enable it in your device settings.",
                    [{ text: "OK" }]
                );
            }
        }
    };

    if (!isCameraAvailable) {
        return (
            <View style={styles.container}>
                <Text>Camera is not available. Please check your permissions.</Text>
            </View>
        );
    }

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text>No camera permission. Please grant permission to use the camera.</Text>
                <TouchableOpacity onPress={checkAndRequestPermission}>
                    <Text>Request Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.container}>
                <Text>No Camera Device Found</Text>
            </View>
        );
    }

    const format = useCameraFormat(device, [
        { photoResolution: { width: 1280, height: 720 } }
    ])

    useEffect(() => {
        getDefaultLanguage();
    }, []);


    const getDefaultLanguage = async () => {
        const data = await AsyncStorage.getItem("inputLanguage").then((data: any) => {
            const language = JSON.parse(data);
            return language;
        });
        if (data) {
            //find language in languages array
            const languageInArray = languages.find((item) => item[0] === data[0]);
            if (languageInArray) {
                setInputLanguage(languageInArray);
                setSelectInputLanguage(languageInArray);
            }
        } else {
            const nativeLanguage = await AsyncStorage.getItem("currentLanguage").then((data: any) => {
                const language = JSON.parse(data);
                return language;
            });
            if (nativeLanguage) {
                setInputLanguage(nativeLanguage);
                setSelectInputLanguage(nativeLanguage);
            }
        }

        const outputLanguage = await AsyncStorage.getItem("outputLanguage").then((data: any) => {
            const language = JSON.parse(data);
            return language;
        });
        if (outputLanguage) {
            const languageInArray = languages.find((item) => item[0] === outputLanguage[0]);
            if (languageInArray) {
                setOutputLanguage(languageInArray);
                setSelectOutputLanguage(languageInArray);
            }
        }
    };

    const camera = useRef<Camera>(null)

    // const handleTakePhoto = async () => {
    //     try {
    //         if (camera.current) {
    //             const photo = await camera.current.takePhoto()
    //             const result = await PhotoRecognizer({
    //                 uri: `file://${photo.path}`,
    //                 orientation: "portrait"
    //             })
    //             setRecognizedText(result)
    //             if (result.resultText) {
    //                 navigation.navigate('CameraTranslateResult', { recognizedText: result.resultText })
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error taking photo:', error);
    //     }
    // }


    const handlePreviewStarted = async () => {
        try {
            if (camera.current) {
                const photo = await camera.current.takePhoto();
                if (adLoaded) {
                    cameraTakePhotoInterstitial.show();
                }
                ImagePicker.openCropper({
                    path: `file://${photo.path}`,
                    mediaType: 'photo',
                    cropping: true,
                    width: 1280, // Adjust this value as needed
                    height: 720, // Adjust this value as needed
                    freeStyleCropEnabled: true,
                }).then(async (image) => {
                    const result = await TextRecognition.recognize(image.path);
                    setRecognizedText(result)
                    if (result.text) {
                        navigation.navigate('CameraTranslateResult', { recognizedText: result.text })
                    }
                }).catch(error => {
                    console.error('Error cropping photo:', error);
                });
            }
        } catch (error) {
            console.error('Error taking or cropping photo:', error);
        }
    };

    const handlePreviewStopped = () => {
        console.log('Preview stopped!')
    }

    const handleOpenGallery = () => {
        console.log('Open Gallery')
        ImageCropPicker.openPicker({
            width: 1280,
            height: 720,
            cropping: true,
            freeStyleCropEnabled: true,
        }).then(async (image) => {
            const result = await TextRecognition.recognize(image.path);
            setRecognizedText(result)
            if (result.text) {
                showAdAndNavigate(cameraSelectPhotoInterstitial, 'CameraTranslateResult', { recognizedText: result.text })
            }
        }).catch(error => {
            console.log('Error cropping photo:', error);
        });
    }



    const switchLanguages = () => {
        setInputLanguage(outputLanguage)
        setOutputLanguage(inputLanguage)
    }

    const handleFlash = () => {
        setIsOnFlash(!isOnFlash)
    }

    const onSearchTextChange = (text: string) => {
        setSearch(text);
    }

    const handleSelectOutputLanguage = (language: string[]) => {
        //add language to AsyncStorage
        AsyncStorage.setItem("outputLanguage", JSON.stringify(language));
        setOutputLanguage(language);
    }

    const handleSelectInputLanguage = (language: string[]) => {
        //add language to AsyncStorage
        AsyncStorage.setItem("inputLanguage", JSON.stringify(language));
        setInputLanguage(language);
    }

    const handleSelectLanguage = (language: string[]) => {
        setSelectOutputLanguage(language);
    }



    return (
        <SafeAreaView style={styles.container}>
            <AppStatusBar barStyle="dark-content" backgroundColor={'transparent'} translucent={true} />
            {!!device && (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive
                    photo={true}
                    ref={camera}
                    format={format}
                    torch={isOnFlash ? 'on' : 'off'}
                    // resizeMode='contain'
                    preview={true}
                    onPreviewStarted={() => console.log('Preview started!')}
                    onPreviewStopped={() => console.log('Preview stopped!')}
                />
            )}
            {/* <View
                style={StyleSheet.absoluteFill}
            /> */}
            <View style={styles.headerOverlay}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 3,
                    backgroundColor: "#2B365B",
                    justifyContent: 'center',
                    borderRadius: 5,
                    marginBottom: 10
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close-outline" size={25} color={Colors.white} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.navTabs]}>
                    <View style={styles.languageButtonContainer}>
                        <TouchableOpacity
                            style={styles.languageButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <AppText style={[styles.languageButtonTitle, { flexShrink: 1, maxWidth: 200, }]}
                                textProps={{
                                    numberOfLines: 1,
                                    ellipsizeMode: "tail",
                                }}
                            >
                                {`${inputLanguage[0]}`}
                            </AppText>
                            <Ionicons name="chevron-down-outline" size={15} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.arrowContainer}>
                        <TouchableOpacity
                            onPress={() => switchLanguages()}
                            style={[
                                { borderRadius: 100 },
                                inputLanguage[1] != "auto" ? { opacity: 1 } : { opacity: 1 },
                            ]}
                        >
                            <Ionicons name="arrow-forward-outline" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.languageButtonContainer}>
                        <TouchableOpacity
                            style={styles.languageButton}
                            onPress={() => setModalVisible2(true)}
                        >
                            <AppText style={[styles.languageButtonTitle, { flexShrink: 1, maxWidth: 200, }]}
                                textProps={{
                                    numberOfLines: 1,
                                    ellipsizeMode: "tail",
                                }}
                            >
                                {outputLanguage[0]}
                            </AppText>
                            <Ionicons name="chevron-down-outline" size={15} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.footerOverlay}>
                <View style={styles.galleryButton}>
                    <TouchableOpacity style={styles.galleryButtonInner} onPress={handleOpenGallery}>
                        <Ionicons name="images" size={30} color={Colors.white} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.captureButton} onPress={handlePreviewStarted}>
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                {/* //flash button */}
                <View style={styles.flashButtonContainer}>
                    <TouchableOpacity style={styles.flashButton} onPress={handleFlash}>
                        {
                            isOnFlash ?
                                <Ionicons name='flash' size={30} color={Colors.white} />
                                :
                                <Ionicons name='flash-off' size={30} color={Colors.white} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSelectInputLanguage(inputLanguage);
                }}
            >
                <View style={[styles.modalView, { flex: 1 }]}>
                    <View style={[styles.flexOptionsBlockSpace, { justifyContent: 'space-between', alignItems: 'center', padding: 20 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="arrow-back-outline" size={25} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <AppText style={styles.modalTitle}>Select Language</AppText>
                        <View>
                            <TouchableOpacity
                                style={[styles.replaceButton]}
                                onPress={() => {
                                    setSelectInputLanguage(selectInputLanguage);
                                    setModalVisible(false);
                                    onSearchTextChange("");
                                    handleSelectInputLanguage(selectInputLanguage);
                                }}
                            >
                                <TickSVG width={25} height={25} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.flexOptionsBlockSpace,
                            {
                                justifyContent: "flex-start",
                                borderWidth: 1,
                                borderColor: Colors.text,
                                marginBottom: 10,
                                borderRadius: 12,
                                marginHorizontal: 10,
                                paddingHorizontal: 10,
                            },
                        ]}
                    >
                        <View>
                            <Ionicons
                                name="search-outline"
                                size={20}
                                color={Colors.text}
                                style={{ paddingLeft: 10 }}
                            />
                        </View>
                        <View style={styles.flexFullWidth}>
                            <AppTextInput
                                placeholder="Search..."
                                value={search}
                                onChangeText={(t) => onSearchTextChange(t)}
                                style={[styles.modalInput, { padding: 10 }]}
                            />
                        </View>
                    </View>
                    <ScrollView
                        style={
                            !isKeyboardVisible
                                ? Platform.OS === "ios"
                                    ? { height: "80%" }
                                    : { height: "70%" }
                                : Platform.OS === "ios"
                                    ? { height: "80%" }
                                    : { height: "50%" }
                        }
                    >
                        {languages
                            .filter((item) => new RegExp(search).test(item[0]))
                            .map((language) => {
                                return (
                                    <TouchableOpacity
                                        key={Math.random()}
                                        onPress={() => {
                                            setSelectInputLanguage(language);
                                        }}
                                        style={[
                                            {
                                                justifyContent: "flex-start",
                                                borderBottomWidth: 1,
                                                borderBottomColor: Colors.border,
                                                padding: 10,
                                                paddingLeft: 30,
                                            },
                                            selectInputLanguage[1] === language[1] ? { backgroundColor: Colors.primary } : {}
                                        ]}
                                    >
                                        <AppText style={[styles.modalListItem, selectInputLanguage[1] === language[1] ? { color: Colors.white } : { color: Colors.text }]}>{language[0]}</AppText>
                                    </TouchableOpacity>
                                );
                            })}
                    </ScrollView>
                </View>
            </Modal>
            {/* Dest language */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible2}
                onRequestClose={() => {
                    setModalVisible2(false);
                    setSelectOutputLanguage(outputLanguage);
                }}
            >
                <View style={[styles.modalView, { flex: 1 }]}>
                    <View style={[styles.flexOptionsBlockSpace, { padding: 15 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setModalVisible2(false)}>
                                <Ionicons name="arrow-back-outline" size={25} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <AppText style={styles.modalTitle}>Select Language</AppText>
                        <View>
                            <TouchableOpacity
                                style={[styles.replaceButton]}
                                onPress={() => {
                                    setOutputLanguage(selectOutputLanguage);
                                    onSearchTextChange("");
                                    setModalVisible2(false);
                                    handleSelectOutputLanguage(selectOutputLanguage);
                                }}
                            >
                                <TickSVG width={25} height={25} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.flexOptionsBlockSpace,
                            {
                                justifyContent: "flex-start",
                                borderWidth: 1,
                                borderColor: Colors.text,
                                marginBottom: 10,
                                borderRadius: 12,
                                marginHorizontal: 10,
                                paddingHorizontal: 10,
                            },
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={20}
                            color={Colors.text}
                            style={{ paddingLeft: 10 }}
                        />
                        <View style={styles.flexFullWidth}>
                            <AppTextInput
                                placeholder="Search..."
                                value={search}
                                onChangeText={(t) => onSearchTextChange(t)}
                                style={[styles.modalInput, { padding: 10, paddingLeft: 20 }]}
                            />
                        </View>
                    </View>
                    <ScrollView
                        style={
                            !isKeyboardVisible
                                ? Platform.OS === "ios"
                                    ? { height: "80%" }
                                    : { height: "70%" }
                                : Platform.OS === "ios"
                                    ? { height: "80%" }
                                    : { height: "50%" }
                        }
                    >
                        {languages
                            .filter((item) => new RegExp(search).test(item[0]))
                            .map((language) => {
                                return (
                                    language[1] != "auto" && (
                                        <TouchableOpacity
                                            key={Math.random()}
                                            onPress={() => {
                                                setSelectOutputLanguage(language);
                                            }}
                                            style={[
                                                {
                                                    justifyContent: "flex-start",
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: Colors.border,
                                                    padding: 10,
                                                    paddingLeft: 30,
                                                },
                                                selectOutputLanguage[1] === language[1] ? { backgroundColor: Colors.primary } : {}
                                            ]}
                                        >
                                            <AppText style={[styles.modalListItem, selectOutputLanguage[1] === language[1] ? { color: Colors.white } : { color: Colors.text }]}>
                                                {language[0]}
                                            </AppText>
                                        </TouchableOpacity>
                                    )
                                );
                            })}
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        gap: 10,
        backgroundColor: 'rgba(0, 12, 58, 0.5)', // Using rgba for transparency
        height: 100,
        paddingHorizontal: 20,
        paddingBottom: 5,

    },
    headerText: {
        fontSize: 16,
        color: Colors.text,
        textAlign: 'center',
        fontFamily: FONT_FAMILY.REGULAR,
        marginBottom: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    recognizedText: {
        color: Colors.white,
        fontSize: 18,
        textAlign: 'center',
        padding: 10,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
    },
    footerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 12, 58, 0.5)', // Using rgba for transparency
        height: 100,
    },
    galleryButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 70,
        height: 70,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 10,
        // backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButton: {
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.black,
        backgroundColor: "#9da0af",
        //shadow
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    captureButtonInner: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: Colors.white,
    },
    flashButtonContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flashButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTabs: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: '90%',
        marginBottom: 10,
    },
    languageButtonContainer: {
        flex: 1,
        alignItems: "center",
    },
    languageButton: {
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
    },
    languageButtonTitle: {
        fontSize: 14,
        color: Colors.white,
        fontFamily: FONT_FAMILY.REGULAR,
    },
    arrowContainer: {
        flex: 0.2,
        alignItems: "center",
    },
    modalView: {
        margin: 0,
        marginTop: Platform.OS === "ios" ? 75 : 0,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 20,
        height: "90%",
        shadowColor: "#635d63",
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,
        elevation: 2,
    },
    modalListItem: {
        paddingVertical: 7,
        fontSize: 14,
        // paddingLeft: 10,
        color: Colors.text,
        fontFamily: FONT_FAMILY.REGULAR,
    },
    flexOptionsBlockSpace: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalTitle: {
        fontSize: 16,
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
    },
    replaceButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    modalInput: {
        padding: 10,
        paddingLeft: 20,
    },
    flexFullWidth: {
        flex: 1,
    },
    languageButtonText: {
        fontSize: 14,
        color: Colors.white,
        fontFamily: FONT_FAMILY.REGULAR,
    },
});

export default CameraTranslate;