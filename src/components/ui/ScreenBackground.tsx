import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LayoutProps {
    children: React.ReactNode;
}

export function ScreenBackground({ children }: LayoutProps) {
    return (
        <View className="flex-1 bg-[#1D2D3E]">
            <View style={{ flex: 1, zIndex: 10 }}>{children}</View>
        </View>
    );
}