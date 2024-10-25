import {
    StyleSheet, Text, ScrollView, I18nManager, View, TouchableOpacity, Modal, Alert, Share, Platform, Keyboard,
    SafeAreaView,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import AppTextInput from "../components/elements/AppTextInput";
import Voice from '@wdragon/react-native-voice';
import Tts from 'react-native-tts';
import { Colors } from "../configs/colors";
import AppText, { FONT_FAMILY } from "../components/elements/AppText";
import { useNavigation } from "@react-navigation/native";
import TickSVG from '../assets/tick.svg';
import { languages } from "../configs/languages";
import Clipboard from "@react-native-clipboard/clipboard";
import AppBannerAd from "../components/ads/AppBannerAd";
import { adUnits } from "../components/ads/adUnit";
import MicroSVG from '../assets/microphone.svg';
import CopySVG from '../assets/copy.svg';
import RepeatSVG from '../assets/repeat.svg';
const transliterate = (word: string): string => {
    let answer = "";
    const a: { [key: string]: string } = {
        "Ё": "YO", "Й": "I", "Ц": "TS", "У": "U", "К": "K", "Е": "E", "Н": "N",
        "Г": "G", "Ш": "SH", "Щ": "SCH", "З": "Z", "Х": "H", "Ъ": "'", "ё": "yo",
        "й": "i", "ц": "ts", "у": "u", "к": "k", "е": "e", "н": "n", "г": "g",
        "ш": "sh", "щ": "sch", "з": "z", "х": "h", "ъ": "'", "Ф": "F", "Ы": "I",
        "В": "V", "А": "a", "П": "P", "Р": "R", "О": "O", "Л": "L", "Д": "D",
        "Ж": "ZH", "Э": "E", "ф": "f", "ы": "i", "в": "v", "а": "a", "п": "p",
        "р": "r", "о": "o", "л": "l", "д": "d", "ж": "zh", "э": "e", "Я": "Ya",
        "Ч": "CH", "С": "S", "М": "M", "И": "I", "Т": "T", "Ь": "'", "Б": "B",
        "Ю": "YU", "я": "ya", "ч": "ch", "с": "s", "м": "m", "и": "i", "т": "t",
        "ь": "'", "б": "b", "ю": "yu"
    };

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        answer += a[char] || char;
    }
    return answer;
};




export default function TranslateScreen({ route }: { route: any }) {
    const recognizedText = route.params?.recognizedText;
    const [value, onChangeText] = React.useState("");
    const navigation = useNavigation();
    const [inputLanguage, onInputLanguage] = React.useState(languages[0]);
    const [selectInputLanguage, setSelectInputLanguage] = React.useState(languages[0]);
    const [outputLanguage, onOutputLanguage] = React.useState(languages[0]);
    const [selectOutputLanguage, setSelectOutputLanguage] = React.useState(languages[0]);
    const [data, setData] = React.useState<any>();
    const [loading, setLoading] = React.useState(false);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalVisible2, setModalVisible2] = React.useState(false);

    const [search, onSearchTextChange] = React.useState("");
    const [error, setError] = React.useState<any>();
    const [detected, setDetected] = React.useState(false);
    const inputTextArea = React.useRef(null);

    const [savedTranslations, setSavedTranslations] = React.useState([]);

    const [rtlTextInput, setRTLTextInput] = React.useState({});
    const [rtlViewInput, setRTLViewInput] = React.useState({});
    const [rtlTextOutput, setRTLTextOutput] = React.useState({});
    const [rtlViewOutput, setRTLViewOutput] = React.useState({});
    const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
    const [isSpeechRecognitionEnabled, setSpeechRecognitionEnabled] = React.useState(false);


    const [translatedText, setTranslatedText] = React.useState("");

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            () => {
                setKeyboardVisible(true)
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    //Reset Voice
    React.useEffect(() => {
        // Voice.destroy().then(Voice.removeAllListeners);

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    React.useEffect(() => {
        getDefaultLanguage();
        loadText();
    }, []);

    const loadText = async () => {
        if (recognizedText) {
            let text = String(recognizedText);
            //remove all spaces and new lines
            text = text.replace(/[\n\t\s]+/g, ' ');
            onChangeText(text);
        }
    };


    const getDefaultLanguage = async () => {
        const data = await AsyncStorage.getItem("inputLanguage").then((data: any) => {
            const language = JSON.parse(data);
            return language;
        });
        if (data) {
            //find language in languages array
            const languageInArray = languages.find((item) => item[0] === data[0]);
            if (languageInArray) {
                onInputLanguage(languageInArray);
                setSelectInputLanguage(languageInArray);
            }
        } else {
            const nativeLanguage = await AsyncStorage.getItem("currentLanguage").then((data: any) => {
                const language = JSON.parse(data);
                return language;
            });
            if (nativeLanguage) {
                onInputLanguage(nativeLanguage);
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
                onOutputLanguage(languageInArray);
                setSelectOutputLanguage(languageInArray);
            }
        }
    };

    const handleSelectInputLanguage = (language: any) => {
        //add language to AsyncStorage
        AsyncStorage.setItem("inputLanguage", JSON.stringify(language));
        onInputLanguage(language);
        setSelectInputLanguage(language);
    };

    const handleSelectOutputLanguage = (language: any) => {
        //add language to AsyncStorage
        AsyncStorage.setItem("outputLanguage", JSON.stringify(language));
        onOutputLanguage(language);
        setSelectOutputLanguage(language);
    };

    const speak = (text: any, language: any) => {
        console.log(text, language);
        Tts.setDefaultLanguage(language);
        Tts.speak(text, {
            androidParams: {
                KEY_PARAM_PAN: -1,
                KEY_PARAM_VOLUME: 1,
                KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
            iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
            rate: 0.5,
        });
    };

    const onShare = async (text: any) => {
        try {
            await Share.share({
                message: text,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setString(translatedText);
    };

    const pasteFromClipBoard = async () => {
        // const copiedText = await Clipboard.getStringAsync();

        // inputTextArea.current.value = copiedText;
        // inputTextArea.current.focus();

        // onChangeText(copiedText);
    };

    const switchLanguages = () => {
        if (inputLanguage[1] != "auto") {
            var input = inputLanguage;
            var output = outputLanguage;
            var inputValue = value;
            var outputArray = data;

            if (outputArray) {
                outputArray.output = inputValue;
                onChangeText(
                    outputArray
                        ? Platform.OS === "ios"
                            ? outputArray.output.replaceAll("(*n*)", "\n")
                            : outputArray.output.replace("(*n*)", "\n")
                        : ""
                );
                setData(outputArray);
            }

            setDetected(false);

            onInputLanguage(output);
            onOutputLanguage(input);
        }
    };

    const storeData = async (key: any, value: any) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            Alert.alert("Error while saving translation.");
        }
    };

    const startVoiceInput = () => {
        const speechStart = () => {
            setSpeechRecognitionEnabled(true);
        };

        const speechEnd = () => {
            setSpeechRecognitionEnabled(false);
        };

        const getVoiceResponse = (res: any) => {
            console.log(res?.value);
            onChangeText(res?.value && res?.value[0]);
            // onChangeText(res?.value && res?.value.join(" "));
        };

        Voice.onSpeechStart = speechStart;
        Voice.onSpeechEnd = speechEnd;
        Voice.onSpeechResults = getVoiceResponse;

        // // start listening for voice
        Voice.start(inputLanguage[1] === "auto" ? "en" : inputLanguage[1]);
    };

    const stopVoiceInput = () => {
        Voice.stop();
        setSpeechRecognitionEnabled(false);
    };

    const removeStoreData = async (key: any) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            Alert.alert("Error while removing translation.");
        }
    };

    const useTranslationFromPreset = (options: any) => {
        const input = options.input;
        const output = options.output;

        onChangeText(input?.text);
        onInputLanguage(input?.language);
        onOutputLanguage(output?.language);
    };

    const handleTranslate = () => {
        setLoading(true);
        I18nManager.forceRTL(false);
        I18nManager.allowRTL(true);
        const url = "https://rapid-google-translate-git-master-leroywagner.vercel.app/translate";
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "X-RapidAPI-Key": "6d1494b3d2mshbb2fba71701790fp13786bjsnbb8040cf3745",
                "X-RapidAPI-Host": "unlimited-google-translate.p.rapidapi.com",
            },
            body: `{"lang":"${inputLanguage[1]}","dest":"${outputLanguage[1]}","text":"${Platform.OS === "ios" ? value.replaceAll("\n", "(*n*)") : value.replace("\n", "(*n*)")}"}`,
        };
        fetch(url, options)
            .then((res) => res.json())
            .then((json) => {
                console.log("json result", json);
                if (json.error) {
                    setError({ message: json.error });
                } else {
                    setData(json);
                    setTranslatedText(json.output);
                    if (inputLanguage[1] === "auto" && json) {
                        const detectedLanguage = json?.input?.source_lang;
                        const languageInList = languages.filter((language) =>
                            new RegExp(language[1]).test(detectedLanguage)
                        );
                        setDetected(true);
                        languageInList && onInputLanguage(languageInList[0]);
                    }

                    // Save translation to AsyncStorage
                    saveTranslationToHistory(value, json.output, inputLanguage, outputLanguage);
                }
            })
            .catch((err: any) => {
                console.log("err translate", err);
                setData({
                    output: "Error while translating",
                    input: {
                        text: value,
                        language: inputLanguage,
                    },
                });
            })
            .finally(() => setLoading(false));
    };

    const saveTranslationToHistory = async (inputText: string, outputText: string, inputLang: any, outputLang: any) => {
        try {
            const historyItem = {
                id: Date.now(),
                inputText,
                outputText,
                inputLanguage: inputLang[0],
                outputLanguage: outputLang[0],
                timestamp: new Date().toISOString(),
            };

            const existingHistory = await AsyncStorage.getItem('translationHistory');
            let history = existingHistory ? JSON.parse(existingHistory) : [];

            history.unshift(historyItem);

            // Limit history to 50 items
            if (history.length > 50) {
                history = history.slice(0, 50);
            }

            await AsyncStorage.setItem('translationHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving translation to history:', error);
        }
    };

    // React.useEffect(() => {
    //     setLoading(true);
    //     I18nManager.forceRTL(false);
    //     I18nManager.allowRTL(true);

    //     const rtlTextInput = inputLanguage.length == 3 && {
    //         textAlign: "right",
    //         writingDirection: "rtl",
    //     };
    //     const rtlViewInput = inputLanguage.length == 3 && {
    //         flexDirection: "row-reverse",
    //     };

    //     const rtlTextOutput = outputLanguage.length == 3 && {
    //         textAlign: "right",
    //         writingDirection: "rtl",
    //     };
    //     const rtlViewOutput = outputLanguage.length == 3 && {
    //         flexDirection: "row-reverse",
    //     };

    //     setRTLTextInput(rtlTextInput);
    //     setRTLViewInput(rtlViewInput);

    //     setRTLTextOutput(rtlTextOutput);
    //     setRTLViewOutput(rtlViewOutput);

    //     const delayDebounceFn = setTimeout(() => {
    //         console.log("valueText", value);

    //         if (value.trim().length > 0) {
    //             stopVoiceInput();

    //             const url =
    //                 "https://rapid-google-translate-git-master-leroywagner.vercel.app/translate";
    //             const options = {
    //                 method: "POST",
    //                 headers: {
    //                     "content-type": "application/json",
    //                     "X-RapidAPI-Key":
    //                         "6d1494b3d2mshbb2fba71701790fp13786bjsnbb8040cf3745",
    //                     "X-RapidAPI-Host": "unlimited-google-translate.p.rapidapi.com",
    //                 },
    //                 body: `{"lang":"${inputLanguage[1]}","dest":"${outputLanguage[1]
    //                     }","text":"${Platform.OS === "ios"
    //                         ? value.replaceAll("\n", "(*n*)")
    //                         : value.replace("\n", "(*n*)")
    //                     }"}`,
    //             };
    //             fetch(url, options)
    //                 .then((res) => res.json())
    //                 .then((json) => {
    //                     console.log("json result", json);
    //                     if (json.error) {
    //                         setError({ message: json.error });
    //                     } else {
    //                         setData(json);
    //                         if (inputLanguage[1] === "auto" && json) {
    //                             const detectedLanguage = json?.input?.source_lang;
    //                             const languageInList = languages.filter((language) =>
    //                                 new RegExp(language[1]).test(detectedLanguage)
    //                             );
    //                             setDetected(true);
    //                             languageInList && onInputLanguage(languageInList[0]);
    //                         }
    //                     }
    //                 })
    //                 .catch((err: any) => {
    //                     console.log("err translate", err);
    //                     setData({
    //                         output: "Error while translating",
    //                         input: {
    //                             text: value,
    //                             language: inputLanguage,
    //                         },
    //                     });
    //                     // setError({ message: "Error while translating" });
    //                 }).finally(() => setLoading(false))
    //         }
    //     }, 1000);

    //     return () => clearTimeout(delayDebounceFn);
    // }, [value, inputLanguage, outputLanguage]);

    useEffect(() => {
        setTranslatedText("");
    }, [value, inputLanguage, outputLanguage]);

    const handleBack = () => {
        navigation.goBack();
    }

    const handleShare = () => {
        onShare(value);
    }


    return (
        <SafeAreaView
            style={styles.container}
        >
            <View style={{ backgroundColor: Colors.backgroundSecondary, height: "100%" }}>
                <View style={[styles.header, { elevation: 0, backgroundColor: Colors.backgroundSecondary }]}>
                    <View style={{ position: "absolute", left: 5 }}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                    <AppText style={styles.headerText}>Camera Translator</AppText>
                </View>
                <ScrollView style={styles.container}>
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
                                            onInputLanguage(selectInputLanguage);
                                            setSelectInputLanguage(inputLanguage);
                                            setModalVisible(false);
                                            setDetected(false);
                                            onSearchTextChange("");
                                            handleSelectInputLanguage(selectInputLanguage);
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
                                                    styles.flex,
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
                                <Text style={styles.modalTitle}>Select Language</Text>
                                <View>
                                    <TouchableOpacity
                                        style={[styles.replaceButton]}
                                        onPress={() => {
                                            onOutputLanguage(selectOutputLanguage);
                                            setDetected(false);
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
                                                        styles.flex,
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
                                                    <Text style={[styles.modalListItem, selectOutputLanguage[1] === language[1] ? { color: Colors.white } : { color: Colors.text }]}>
                                                        {language[0]}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        );
                                    })}
                            </ScrollView>
                        </View>
                    </Modal>

                    <View style={styles.textArea}>
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
                                        }}>
                                        {detected ? `${inputLanguage[0]}` : inputLanguage[0]}
                                    </AppText>
                                    <Ionicons name="chevron-down-outline" size={15} color={Colors.text} />

                                </TouchableOpacity>
                            </View>
                            <View style={styles.arrowContainer}>
                                <TouchableOpacity
                                    onPress={() => switchLanguages()}
                                    style={[
                                        { borderRadius: 100 },
                                        inputLanguage[1] != "auto" ? { opacity: 1 } : { opacity: 0.5 },
                                    ]}
                                >
                                    <RepeatSVG width={20} height={20} color={Colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.languageButtonContainer}>
                                <TouchableOpacity

                                    style={styles.languageButton}
                                    onPress={() => {
                                        setModalVisible2(true);
                                        setSelectOutputLanguage(outputLanguage);
                                    }}

                                >
                                    <AppText style={[styles.languageButtonTitle, { flexShrink: 1, maxWidth: 200, }]}
                                        textProps={{
                                            numberOfLines: 1,
                                            ellipsizeMode: "tail",
                                        }}>
                                        {outputLanguage[0]}
                                    </AppText>
                                    <Ionicons name="chevron-down-outline" size={15} color={Colors.text} />
                                </TouchableOpacity>

                            </View>

                        </View>
                    </View>
                    <View style={styles.textAreaBlock}>
                        <View style={styles.textAreaBlockTitle}>
                            <AppText style={[styles.languageButtonTitle, { color: "#3763FD", fontFamily: FONT_FAMILY.SEMI_BOLD, marginLeft: 5 }]}>
                                {detected ? `${inputLanguage[0]}` : inputLanguage[0]}
                            </AppText>
                            {
                                value?.trim().length > 0 ? (
                                    <View style={styles.textAreaBlockTitleRight}>
                                        <TouchableOpacity onPress={() => onChangeText("")}>
                                            <Ionicons name="close-outline" size={20} color={Colors.text} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View />
                                )
                            }
                        </View>
                        <AppTextInput
                            // ref={inputTextArea}
                            multiline
                            numberOfLines={6}
                            onChangeText={(text) => {
                                // setLoading(true);
                                onChangeText(text);
                            }}
                            textAlignVertical="top"
                            value={value}
                            style={[styles.textInput, rtlTextInput, rtlViewInput]}
                            placeholder="Enter your text"
                        />

                        <View style={{ flex: 1 }} />
                        <View style={[styles.translateBadge]}>
                            <View style={[styles.flexOptionsBlockSpace]}>
                                <View >
                                </View>
                                <View style={styles.flexOptionsBlock}>
                                    {value?.trim().length > 0 ? (
                                        isSpeechRecognitionEnabled ? (
                                            <View>
                                                <TouchableOpacity
                                                    onPress={() => stopVoiceInput()}
                                                    style={[
                                                        styles.speechButtonFilled,
                                                        {
                                                            opacity: 1,
                                                            marginRight: 15,
                                                            backgroundColor: "#374CF4",
                                                        },
                                                    ]}
                                                >
                                                    <MicroSVG width={25} height={25} color={Colors.white} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={[styles.translateGroupRight]}>
                                                {
                                                    translatedText.trim().length > 0 ? (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.speechButtonFilled,
                                                                styles.speechWave,
                                                                { opacity: 1, marginRight: 15 },
                                                            ]}
                                                            onPress={() => speak(value, inputLanguage[1])}
                                                        >
                                                            <Ionicons
                                                                name="volume-high"
                                                                size={25}
                                                                color="white"
                                                            />
                                                        </TouchableOpacity>)
                                                        :
                                                        <TouchableOpacity
                                                            style={styles.translateButton}
                                                            onPress={handleTranslate}
                                                        >
                                                            <AppText style={styles.translateButtonText}>Translate</AppText>
                                                            <Ionicons name="chevron-forward-outline" size={18} color={Colors.white} />
                                                        </TouchableOpacity>
                                                }
                                            </View>
                                        )
                                    ) : (
                                        <View
                                            style={[
                                                styles.translateGroupRight,
                                                styles.flexOptionsBlock,
                                            ]}
                                        >
                                            <View>
                                                {isSpeechRecognitionEnabled ? (
                                                    // Khi đang nhận diện giọng nói
                                                    <View>
                                                        <TouchableOpacity
                                                            onPress={() => stopVoiceInput()}
                                                            style={[
                                                                styles.speechButtonFilled,
                                                                {
                                                                    opacity: 1,
                                                                    marginRight: 15,
                                                                    backgroundColor: Colors.primary,
                                                                },
                                                            ]}
                                                        >
                                                            <Ionicons
                                                                name="pause"
                                                                size={25}
                                                                color="white"
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() => startVoiceInput()}
                                                        style={[
                                                            styles.speechButtonFilled,
                                                            {
                                                                opacity: 1,
                                                                marginRight: 15,
                                                                backgroundColor: "#374CF4",
                                                            },
                                                        ]}
                                                    >
                                                        <MicroSVG width={25} height={25} color={Colors.white} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                    {error && (
                        <View style={styles.errorBlock}>
                            <Text>{error}</Text>
                        </View>
                    )}
                    {
                        //Block loading
                        loading && (
                            <View
                                style={[styles.translatedBlock, { paddingRight: 20, flex: 1 }]}
                            >
                                <View style={[styles.translatedText]}>
                                    <View
                                        style={[
                                            styles.flexOptionsBlockSpace,
                                            rtlViewOutput,
                                            rtlTextOutput,
                                        ]}
                                    >
                                        <View style={styles.textAreaBlockTitle}>
                                            <AppText style={[styles.languageButtonTitle, { color: "#3763FD", fontFamily: FONT_FAMILY.SEMI_BOLD, marginLeft: 5 }]}>
                                                {outputLanguage[0]}
                                            </AppText>
                                            <View>
                                            </View>
                                        </View>
                                    </View>
                                    <AppText
                                        style={[
                                            styles.translatedTextLabel,
                                            rtlViewOutput,
                                            rtlTextOutput,
                                        ]}
                                    >
                                        Translation...
                                    </AppText>

                                </View>

                            </View>
                        )
                    }
                    {/* Hiển thị response  */}
                    {!error && translatedText !== "" && (
                        <View
                            style={[styles.translatedBlock, { paddingRight: 20, flex: 1 }]}
                        >
                            <View style={[styles.translatedText]}>
                                <View
                                    style={[
                                        styles.flexOptionsBlockSpace,
                                        rtlViewOutput,
                                        rtlTextOutput,
                                    ]}
                                >
                                    <View style={styles.textAreaBlockTitle}>
                                        <AppText style={[styles.languageButtonTitle, { color: "#3763FD", fontFamily: FONT_FAMILY.SEMI_BOLD, marginLeft: 5 }]}>
                                            {outputLanguage[0]}
                                        </AppText>
                                        <View>
                                            {!loading && (
                                                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', marginBottom: 10 }}>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            handleShare();
                                                        }}
                                                        style={[styles.copyButton]}
                                                    >
                                                        <Ionicons name="share-social-sharp" size={20} color={Colors.green} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            copyToClipboard();
                                                        }}
                                                        style={[styles.copyButton]}
                                                    >
                                                        <CopySVG width={20} height={20} color={Colors.green} />
                                                    </TouchableOpacity>

                                                </View>
                                            )
                                            }

                                        </View>
                                    </View>

                                </View>
                                <AppText
                                    style={[
                                        styles.translatedTextLabel,
                                        rtlViewOutput,
                                        rtlTextOutput,
                                    ]}
                                >
                                    {loading
                                        ? "Translation..."
                                        : Platform.OS === "ios"
                                            ? translatedText.replaceAll("(*n*)", "\n")
                                            : translatedText.replace("(*n*)", "\n")}
                                </AppText>
                                {/* {!loading && transliterate(value).trim().length > 0 && (
                                    <AppText
                                        style={[
                                            styles.transliterateText,
                                            rtlViewOutput,
                                            rtlTextOutput,
                                            {
                                                margin: 0,
                                                color: Colors.text,
                                                opacity: 0.6,
                                                paddingTop: 0,
                                            },
                                        ]}
                                    >
                                        Pronunciation:{" "}
                                        {transliterate(
                                            Platform.OS === "ios"
                                                ? data.output.replaceAll("(*n*)", " ↵ ")
                                                : data.output.replace("(*n*)", " ↵ ")
                                        )}
                                    </AppText>
                                )} */}
                            </View>
                            {!loading && (
                                <View
                                    style={[
                                        styles.flexOptionsBlock,
                                        rtlViewOutput,
                                        rtlTextOutput,
                                    ]}
                                >
                                    <View style={[styles.translateGroupRight]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.speechButtonFilled,
                                                styles.speechWave,
                                                { opacity: 1, marginRight: 15 },
                                            ]}
                                            onPress={() =>
                                                speak(
                                                    Platform.OS === "ios"
                                                        ? translatedText.replaceAll("(*n*)", "\n")
                                                        : translatedText.replace("(*n*)", "\n"),
                                                    outputLanguage[1]
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name="volume-high-outline"
                                                size={25}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                    {/* Hiển thị quảng cáo */}
                    <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
                        <AppBannerAd adUnitId={adUnits.native_cameratranslator_translate} />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.background,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        //center the header text
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 20,
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
        padding: 10,
    },
    textInput: {
        height: 200,
        borderRadius: 10,
        fontSize: 18,
        marginTop: 10,
    },
    navTabs: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    languageButtonContainer: {
        flex: 1,
        alignItems: "center",
    },
    arrowContainer: {
        flex: 0.2,
        alignItems: "center",
    },

    replaceButton: {
    },

    languageButton: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
    },

    languageButtonTitle: {
        fontSize: 16,
        color: Colors.text,
        fontFamily: FONT_FAMILY.REGULAR,
    },
    copyButton: {

    },
    speechButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        padding: 8,
        margin: 10,
        borderRadius: 100,
        paddingLeft: 9,
        paddingRight: 9,
        marginLeft: 5,
        backgroundColor: Colors.primary,

    },
    speechWave: {

    },
    translateBadge: {

    },
    speechButtonFilled: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        padding: 8,
        margin: 10,
        borderRadius: 100,
        marginLeft: 5,
        backgroundColor: Colors.primary,
        opacity: 0.5,
    },
    flexOptionsBlock: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        position: "absolute",
        right: 0,
        bottom: 0,
    },
    flex: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    translatedText: {
        margin: 10,
        padding: 10,
        color: "white",
        borderRadius: 10,
        paddingLeft: 0,
        paddingRight: 0,
    },
    translatedTextLabel: {
        padding: 10,
        color: Colors.text,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        fontSize: 18,
    },
    translatedTextLabelWhite: {
        padding: 10,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.text,
        fontSize: 18,
        borderRadius: 10,
        marginTop: 10,
    },
    errorBlock: {
        backgroundColor: "red",
        margin: 10,
        borderRadius: 10,
        padding: 20,
        elevation: 2,
    },
    translatedBlock: {
        backgroundColor: Colors.white,
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 5,
        minHeight: 280,
    },
    flexOptionsBlockSpace: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    starButton: {
        marginRight: 10,
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
    textAreaBlock: {
        backgroundColor: Colors.background,
        borderRadius: 10,
        borderTopWidth: 0,
        padding: 15,
        height: 300,
    },
    textAreaBlockTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    textAreaBlockTitleRight: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: "#CFCFCF",
        justifyContent: "center",
        alignItems: "center",
    },
    transliterateText: {
        margin: 10,
        padding: 10,
        borderRadius: 10,
        fontSize: 15,
        marginBottom: 0,
        paddingBottom: 0,
    },
    modalInput: {
        borderRadius: 100,
    },
    flexFullWidth: {
        width: "100%",
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
        color: Colors.text,
    },
    savedTranslations: {
        backgroundColor: "white",
        borderRadius: 10,
        margin: 15,
        padding: 20,
        paddingLeft: 15,
        paddingRight: 0,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,

        elevation: 2,
    },
    savedTranslationsText: {
        color: "grey",
        borderTopWidth: Platform.OS === "ios" ? 1 : 0,
        borderTopColor: "#e5e5e5",
    },
    savedTranslationsLabel: {
        padding: 20,
        paddingBottom: 0,
        fontWeight: "500",
        fontSize: 16,
        opacity: 0.8,
    },
    savedSearchBox: {
        backgroundColor: "white",
        margin: 15,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,

        elevation: 2,
        borderRadius: 10,
    },
    textArea: {
        paddingTop: 400,
        marginTop: -400,
    },
    translateGroupRight: {
        position: "absolute",
        right: 0,
        bottom: 0,
        flexDirection: "row",
    },
    savedTranslationsBox: {

    },
    translateButton: {
        backgroundColor: Colors.primary,
        padding: 8,
        paddingLeft: 16,
        borderRadius: 130,
        alignItems: 'center',
        flexDirection: 'row',
    },
    translateButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontFamily: FONT_FAMILY.SEMI_BOLD,
    },
});