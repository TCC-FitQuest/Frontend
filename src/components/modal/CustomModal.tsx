import React from 'react';
import { Modal, View, Text, Pressable, ModalProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';

interface CustomModalProps extends ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    showCloseButton?: boolean;
    headerColors?: readonly [string, string, ...string[]];
    children: React.ReactNode;
}

export const CustomModal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    showCloseButton = true,
    headerColors = ["#1e3a8a", "#1D2D3E"],
    children,
    ...rest
}: CustomModalProps) => {
    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            {...rest}
        >
            <View className="flex-1 bg-black/80 justify-center items-center p-6">
                <View className="bg-white w-full rounded-3xl border border-slate-200 overflow-hidden">
                    {title && (
                        <LinearGradient colors={headerColors} className="p-4 items-center relative">
                            {showCloseButton && (
                                <Pressable
                                    onPress={onClose}
                                    className="absolute right-4 top-4 z-10 p-1 bg-black/20 rounded-full"
                                >
                                    <X size={18} color="white" />
                                </Pressable>
                            )}
                            <Text className="text-white text-xl font-bold text-center">{title}</Text>
                            {subtitle && (
                                <Text className="text-slate-300/80 text-xs text-center">{subtitle}</Text>
                            )}
                        </LinearGradient>
                    )}
                    <View className="p-5">
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
};