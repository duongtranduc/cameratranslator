/**
-a----         9/24/2024   2:42 PM           4479 OFL.txt
-a----         9/24/2024   2:42 PM         151396 Poppins-Black.ttf
-a----         9/24/2024   2:42 PM         171604 Poppins-BlackItalic.ttf
-a----         9/24/2024   2:42 PM         153944 Poppins-Bold.ttf
-a----         9/24/2024   2:42 PM         176588 Poppins-BoldItalic.ttf
-a----         9/24/2024   2:42 PM         152764 Poppins-ExtraBold.ttf
-a----         9/24/2024   2:42 PM         173916 Poppins-ExtraBoldItalic.ttf
-a----         9/24/2024   2:42 PM         161456 Poppins-ExtraLight.ttf
-a----         9/24/2024   2:42 PM         186168 Poppins-ExtraLightItalic.ttf
-a----         9/24/2024   2:42 PM         182012 Poppins-Italic.ttf
-a----         9/24/2024   2:42 PM         159892 Poppins-Light.ttf
-a----         9/24/2024   2:42 PM         184460 Poppins-LightItalic.ttf
-a----         9/24/2024   2:42 PM         156520 Poppins-Medium.ttf
-a----         9/24/2024   2:42 PM         180444 Poppins-MediumItalic.ttf
-a----         9/24/2024   2:42 PM         158240 Poppins-Regular.ttf
-a----         9/24/2024   2:42 PM         155232 Poppins-SemiBold.ttf
-a----         9/24/2024   2:42 PM         178584 Poppins-SemiBoldItalic.ttf
-a----         9/24/2024   2:42 PM         161652 Poppins-Thin.ttf
-a----         9/24/2024   2:42 PM         187044 Poppins-ThinItalic.ttf
 */

import React from 'react';
import { StyleSheet, TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';

interface AppTextProps {
    children: React.ReactNode;
    style?: TextStyle | TextStyle[] | undefined | any;
    textProps?: TextProps;
}

export const FONT_FAMILY = {
    REGULAR: 'Poppins-Regular',
    MEDIUM: 'Poppins-Medium',
    BOLD: 'Poppins-Bold',
    SEMI_BOLD: 'Poppins-SemiBold',
    LIGHT: 'Poppins-Light',
    THIN: 'Poppins-Thin',
    ITALIC: 'Poppins-Italic',
    BOLD_ITALIC: 'Poppins-BoldItalic',
    SEMI_BOLD_ITALIC: 'Poppins-SemiBoldItalic',
    LIGHT_ITALIC: 'Poppins-LightItalic',
    THIN_ITALIC: 'Poppins-ThinItalic',
    EXTRA_BOLD: 'Poppins-ExtraBold',
    EXTRA_BOLD_ITALIC: 'Poppins-ExtraBoldItalic',
    EXTRA_LIGHT: 'Poppins-ExtraLight',
    EXTRA_LIGHT_ITALIC: 'Poppins-ExtraLightItalic',
};

interface AppTextProps {
    children: React.ReactNode;
    style?: TextStyle | TextStyle[] | undefined | any;
    textProps?: TextProps;
}

const AppText: React.FC<AppTextProps> = ({ children, style, textProps }) => {
    return <Text style={[styles.text, style]} {...textProps}>{children}</Text>;
};

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
});

export default AppText;