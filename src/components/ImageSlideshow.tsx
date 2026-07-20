import React from 'react';
import { StyleSheet, Image, Animated } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

const slideshowImages = [
    require('../../assets/Feed/sarah.webp'),
    require('../../assets/Feed/istockphoto.webp'),
    require('../../assets/Feed/investment-picture1.webp'),
];

const ROTATE_INTERVAL_MS = 3000;

export default function ImageSlideshow() {
const reducedMotion = useReducedMotion();
const [index, setIndex] = React.useState(0);
const fadeAnim = React.useRef(new Animated.Value(1)).current;

React.useEffect(() => {
    const interval = setInterval(() => {
    if (reducedMotion) {
        setIndex(prev => (prev + 1) % slideshowImages.length);
        return;
    }
    Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        setIndex(prev => (prev + 1) % slideshowImages.length);
        Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        }).start();
    });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
}, [fadeAnim, reducedMotion]);
return (
    <Animated.Image
    source={slideshowImages[index]}
    style={[styles.image, { opacity: reducedMotion ? 1 : fadeAnim }]}
    resizeMode="cover"
    accessible={false}
    importantForAccessibility="no"
    accessibilityElementsHidden
    />
);
}

const styles = StyleSheet.create({
    image: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    },
});