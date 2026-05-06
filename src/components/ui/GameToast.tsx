import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react-native';

interface GameToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

const GameToast = ({ visible, message, type = 'success', onClose }: GameToastProps) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 20,
                useNativeDriver: true,
                speed: 12,
            }).start();

            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    if (!visible) return null;

    const isSuccess = type === 'success';

    return (
        <Animated.View
            style={[
                { transform: [{ translateX: slideAnim }] },
                styles.gameShadow
            ]}
            className={`absolute top-12 right-0 z-100 flex-row items-center py-4 px-5 border-b-4 border-r-4 ${isSuccess ? 'bg-green-500 border-green-800' : 'bg-red-500 border-red-800'
                } rounded-xl min-w-[200px]`}
        >
            <View className="bg-white/20 p-2 rounded-lg mr-3">
                {isSuccess ? (
                    <CheckCircle2 color="white" size={24} />
                ) : (
                    <AlertTriangle color="white" size={24} />
                )}
            </View>

            <View className="flex-1">

                <Text className="text-white font-medium text-xs uppercase">
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    gameShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 8,
    },
});

export default GameToast;