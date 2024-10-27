import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform, Modal, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import AppText, { FONT_FAMILY } from '../components/elements/AppText';
import { Colors } from '../configs/colors';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import Voice from '@wdragon/react-native-voice';
import Tts from 'react-native-tts';
import AppBannerAd from '../components/ads/AppBannerAd';
import { languages } from '../configs/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppTextInput from '../components/elements/AppTextInput';
import TickSVG from '../assets/tick.svg';
import { adUnits } from '../components/ads/adUnit';
// Define the message type
import CopySVGUser1 from '../assets/copy-1.svg';
import TrashSVGUser1 from '../assets/trash-1.svg';
import CopySVGUser2 from '../assets/copy.svg';
import TrashSVGUser2 from '../assets/trash-2.svg';
import MicroSVG from '../assets/microphone.svg';
import RepeatSVG from '../assets/repeat.svg';
import BGConversionSVG from '../assets/bg-conversation.svg';
import PauseSVG from '../assets/pause.svg';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import AppStatusBar from '../components/elements/AppStatusBar';
type Message = {
    id: number;
    text: string;
    isUser1: boolean;
};

const ConversationScreen = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputLanguage, setInputLanguage] = useState(languages[0]);
    const [outputLanguage, setOutputLanguage] = useState(languages[1]);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(1); //1 is user 1, 2 is user 2
    const [newMessage, setNewMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [selectInputLanguage, setSelectInputLanguage] = useState(languages[0]);
    const [selectOutputLanguage, setSelectOutputLanguage] = useState(languages[1]);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [search, onSearchTextChange] = React.useState("");
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };

    const messagesContainerRef = useRef<ScrollView | null>(null);


    useEffect(() => {
        if (newMessage) {
            translateMessageAndSave(newMessage);
        }
    }, [newMessage]);

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

    const translateMessageAndSave = async (message: string) => {
        setIsLoading(true);
        console.log("message", message);
        if (message.trim().length > 0) {
            const url = "https://rapid-google-translate-git-master-leroywagner.vercel.app/translate";
            const options = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "X-RapidAPI-Key":
                        "6d1494b3d2mshbb2fba71701790fp13786bjsnbb8040cf3745",
                    "X-RapidAPI-Host": "unlimited-google-translate.p.rapidapi.com",
                },
                body: `{"lang":"${currentUser === 1 ? inputLanguage[1] : outputLanguage[1]}","dest":"${currentUser === 1 ? outputLanguage[1] : inputLanguage[1]
                    }","text":"${Platform.OS === "ios"
                        ? message.replaceAll("\n", "(*n*)")
                        : message.replace("\n", "(*n*)")
                    }"}`,
            };
            await fetch(url, options)
                .then((res) => res.json())
                .then((json) => {
                    console.log("json result", json.output);
                    if (json.error) {
                    } else {
                        setMessages((prevMessages: Message[]) => {
                            const translatedMessageObj = { id: prevMessages.length + 1, text: json.output, isUser1: currentUser === 1 };
                            return [...prevMessages, translatedMessageObj];
                        });
                    }
                })
                .catch((err: any) => {
                    console.log("err translate", err);
                }).finally(() => {
                    console.log("done");
                    setIsLoading(false);
                })
        }

        // setMessages((prevMessages: Message[]) => {
        //     const translatedMessageObj = { id: prevMessages.length + 1, text: translatedMessage, isUser1: currentUser === 2 };
        //     return [...prevMessages, translatedMessageObj];
        // });

        // setMessages((prevMessages: Message[]) => {
        //     const userMessage = { id: prevMessages.length + 1, text: newMessage, isUser1: currentUser === 1 };
        //     return [...prevMessages, userMessage];
        // });
        // setNewMessage("");
    };

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    //Reset Voice
    useEffect(() => {
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, []);

    const switchLanguages = () => {
        setInputLanguage(outputLanguage);
        setOutputLanguage(inputLanguage);
    };

    const handleBack = () => {
        console.log("back");
        
        navigation.goBack();
    };

    const handleSelectOutputLanguage = (language: any) => {
        //add language to AsyncStorage
        AsyncStorage.setItem("outputLanguage", JSON.stringify(language));
        setOutputLanguage(language);
    };

    // const translateText = async (text: string) => {
    //     if (text.trim().length > 0) {
    //         const url = "https://rapid-google-translate-git-master-leroywagner.vercel.app/translate";
    //         const options = {
    //             method: "POST",
    //             headers: {
    //                 "content-type": "application/json",
    //                 "X-RapidAPI-Key":
    //                     "6d1494b3d2mshbb2fba71701790fp13786bjsnbb8040cf3745",
    //                 "X-RapidAPI-Host": "unlimited-google-translate.p.rapidapi.com",
    //             },
    //             body: `{"lang":"${inputLanguage[1]}","dest":"${outputLanguage[1]
    //                 }","text":"${Platform.OS === "ios"
    //                     ? text.replaceAll("\n", "(*n*)")
    //                     : text.replace("\n", "(*n*)")
    //                 }"}`,
    //         };
    //         await fetch(url, options)
    //             .then((res) => res.json())
    //             .then((json) => {
    //                 console.log("json result", json.output);
    //                 if (json.error) {
    //                     return "Error while translating";
    //                 } else {
    //                     return json.output;
    //                 }
    //             })
    //             .catch((err: any) => {
    //                 console.log("err translate", err);
    //                 return "Error while translating";
    //             }).finally(() => {
    //                 console.log("done");
    //             })
    //     }
    // };

    const handleMicPressUser = async (user: number) => {
        //scroll to bottom
        messagesContainerRef.current?.scrollToEnd({ animated: true });
        setCurrentUser(user);
        if (isListening) {
            setIsListening(false);
            Voice.destroy().then(Voice.removeAllListeners);
            stopPulseAnimation();
            return;
        }

        const speechStart = () => {
            setIsListening(true);
            startPulseAnimation();
        };

        const speechEnd = () => {
            setIsListening(false);
            console.log("stop");
            //Reset Voice
            Voice.destroy().then(Voice.removeAllListeners);
        };

        const getVoiceResponse = (res: any) => {
            setNewMessage(res?.value && res?.value[0]);
        };
        Voice.onSpeechStart = speechStart;
        Voice.onSpeechEnd = speechEnd;
        Voice.onSpeechResults = getVoiceResponse;
        // Voice.start(inputLanguage[1] === "auto" ? "en" : inputLanguage[1]);

        if (user === 1) {
            Voice.start(inputLanguage[1] === "auto" ? "en" : inputLanguage[1]);
        } else {
            Voice.start(outputLanguage[1] === "auto" ? "en" : outputLanguage[1]);
        }
    };

    const LoadingDots = ({ color }: { color: string }) => {
        const dotAnimation = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const animation = Animated.loop(
                Animated.timing(dotAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            animation.start();

            return () => animation.stop();
        }, []);

        const dot1Opacity = dotAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 1, 0.3, 0.3],
        });

        const dot2Opacity = dotAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 0.3, 1, 0.3],
        });

        const dot3Opacity = dotAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 0.3, 0.3, 1],
        });

        return (
            <View style={styles.loadingDotsContainer}>
                <Animated.View style={[styles.loadingDot, { opacity: dot1Opacity, backgroundColor: color }]} />
                <Animated.View style={[styles.loadingDot, { opacity: dot2Opacity, backgroundColor: color }]} />
                <Animated.View style={[styles.loadingDot, { opacity: dot3Opacity, backgroundColor: color }]} />
            </View>
        );
    };

    const handleCopy = (text: string) => {
        Clipboard.setString(text);
    };

    const handleDelete = (id: number) => {
        setMessages((prevMessages: Message[]) => {
            return prevMessages.filter((message: Message) => message.id !== id);
        });
    };

    const AnimatedMicButton = ({ onPress = () => { }, isListening, currentUser, userNumber }: { onPress: () => void, isListening: boolean, currentUser: number, userNumber: number }) => {
        const buttonStyle = userNumber === 1 ? styles.micButton : styles.micButtonRight;
        
        return (
            <TouchableOpacity onPress={onPress}>
                <Animated.View style={[
                    buttonStyle,
                    isListening && currentUser === userNumber && {
                        transform: [{ scale: pulseAnim }],
                    }
                ]}>
                    {isListening && currentUser === userNumber ? (
                        <PauseSVG width={30} height={30} color={Colors.white} />
                    ) : (
                        <MicroSVG width={30} height={30} color={Colors.white} />
                    )}
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppStatusBar barStyle="dark-content" backgroundColor={Colors.backgroundSecondary} />
            <View style={[styles.header, { elevation: 0, backgroundColor: Colors.backgroundSecondary }]}>
                <View style={{ position: "absolute", left: 15 }}>
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                <AppText style={styles.headerText}>Conversation</AppText>
            </View>
            <View style={styles.adsContainer} >
                <AppBannerAd adUnitId={adUnits.native_conversation} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/>
            </View>
            {
                messages?.length === 0 && (
                    <View style={styles.conversationBackgroundEmptyContainer}>
                        <BGConversionSVG width={200} height={200} />
                    </View>
                )
            }
            <ScrollView
                style={styles.messagesContainer}
                ref={messagesContainerRef}
                //hide scrollbar
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageBubble,
                            message.isUser1 ? styles.user1Message : styles.user2Message,
                            {
                                backgroundColor: message.isUser1 ? Colors.primary : Colors.white,
                                borderColor: message.isUser1 ? Colors.primary : Colors.border,
                            }
                        ]}
                    >
                        <AppText style={[styles.messageText, message.isUser1 ? styles.user1Text : styles.user2Text]}>{message.text}</AppText>
                        <View style={styles.messageFooter}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleCopy(message.text)}>
                                {
                                    message.isUser1 ? (
                                        <CopySVGUser1 width={15} height={15} color={Colors.white} />
                                    ) : (
                                        <CopySVGUser2 width={15} height={15} color={Colors.text} />
                                    )
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(message.id)}>
                                {
                                    message.isUser1 ? (
                                        <TrashSVGUser1 width={15} height={15} color={Colors.white} />
                                    ) : (
                                        <TrashSVGUser2 width={15} height={15} color={Colors.red} />
                                    )
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {(isListening || isLoading) && (
                    <View style={styles.loadingContainer}>
                        <View
                            style={[
                                styles.messageBubble,
                                currentUser === 1 ? styles.user1Message : styles.user2Message,
                                {
                                    backgroundColor: currentUser === 1 ? Colors.primary : Colors.white,
                                    borderColor: currentUser === 1 ? Colors.primary : Colors.border,
                                    paddingTop: 20,
                                }
                            ]}
                        >
                            <LoadingDots color={currentUser === 1 ? Colors.white : Colors.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>
            <View style={styles.footerContainer}>
                <View style={styles.footer}>
                    <View style={styles.languageButtonContainerLeft}>
                        <TouchableOpacity style={[styles.languageButton]} onPress={() => setModalVisible(true)}>
                            <AppText style={[
                                styles.languageButtonText,
                                { color: Colors.text },
                                { flexShrink: 1, maxWidth: 100, }
                            ]}
                                textProps={{
                                    numberOfLines: 1,
                                    ellipsizeMode: "tail",
                                }}>
                                {inputLanguage[0]}
                            </AppText>
                            <Ionicons name="chevron-down-outline" size={15} color={Colors.text} />
                        </TouchableOpacity>
                        <AnimatedMicButton
                            onPress={() => handleMicPressUser(1)}
                            isListening={isListening}
                            currentUser={currentUser}
                            userNumber={1}
                        />
                    </View>
                    <View style={{ paddingTop: 12 }}>
                        <TouchableOpacity onPress={switchLanguages} style={styles.switchButton}>
                            <RepeatSVG width={20} height={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.languageButtonContainerRight}>
                        <TouchableOpacity style={[styles.languageButton]} onPress={() => setModalVisible2(true)}>
                            <AppText
                                style={[
                                    styles.languageButtonText,
                                    { color: Colors.text },
                                    { flexShrink: 1, maxWidth: 100, }
                                ]}
                                textProps={{
                                    numberOfLines: 1,
                                    ellipsizeMode: "tail",
                                }}
                            >
                                {outputLanguage[0]}
                            </AppText>
                            <Ionicons name="chevron-down-outline" size={15} color={Colors.text} />
                        </TouchableOpacity>
                        <AnimatedMicButton
                            onPress={() => handleMicPressUser(2)}
                            isListening={isListening}
                            currentUser={currentUser}
                            userNumber={2}
                        />
                    </View>
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
                                    setInputLanguage(selectInputLanguage);
                                    setModalVisible(false);
                                    onSearchTextChange("");
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
    adsContainer: {
        backgroundColor: Colors.white,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        minWidth: '60%',
        maxHeight: 'auto',
        minHeight: 90,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    user1Message: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
    },
    user2Message: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.white,
    },
    messageText: {
        color: Colors.text,
        fontFamily: FONT_FAMILY.REGULAR,
    },
    messageFooter: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 5,
    },
    iconButton: {
        padding: 5,
    },
    user1Text: {
        color: Colors.white,
    },
    user2Text: {
        color: Colors.text,
    },
    loadingDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
        backgroundColor: Colors.white,
    },
    loadingAnimation: {
        opacity: 0.3,
    },
    loadingDotAnimation: {
        transform: [{ scale: 1 }],
    },
    footerContainer: {
        backgroundColor: Colors.white,
        paddingBottom: 20,
        paddingHorizontal: 20,
        height: '22%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 15,
    },
    footer: {
        backgroundColor: Colors.white,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    micButton: {
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        padding: 8,
    },
    languageButtonContainerLeft: {
        alignItems: 'center',
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 7,
        gap: 10,
    },
    languageButtonContainerRight: {
        alignItems: 'center',
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 7,
        gap: 10,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundButton,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        width: 120,
        height: 40,
    },
    languageButtonText: {
        fontFamily: FONT_FAMILY.REGULAR,
        marginHorizontal: 5,
        fontSize: 14,
    },
    rightLanguageButtonText: {
        color: Colors.text,
    },
    switchButton: {
    },
    micIcon: {

    },
    micButtonRight: {
        backgroundColor: Colors.primary,
        borderRadius: 25,
        padding: 8,
    },
    loadingContainer: {

    },
    conversationBackgroundEmptyContainer: {
        position: 'absolute',
        //center of the screen
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        // Lên trên 120px
        top: -100,
    },
    conversationBackgroundEmpty: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 20,
        resizeMode: 'contain',
        opacity: 0.2,
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
        fontSize: 18,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.text,
    },
    replaceButton: {
        borderRadius: 25,
        padding: 2,
    },
    flexFullWidth: {
        width: "100%",
    },
    modalInput: {
        borderRadius: 100,
    },

});

export default ConversationScreen;      

