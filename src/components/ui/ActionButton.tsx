import { View, Text, Pressable, ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ActionButtonProps {
    label: string;
    icon: React.ReactNode;
    colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
    active?: boolean;
    onPress: () => void;
}

export function ActionButton({
    label,
    icon,
    colors,
    active,
    onPress,
}: ActionButtonProps) {

    const Content = (
        <View className="flex-row items-center justify-center gap-2 py-3 rounded-xl">
            {icon}
            <Text className="text-white font-semibold">{label}</Text>
        </View>
    );

    if (active) {
        return (
            <Pressable onPress={onPress} className="flex-1">
                <LinearGradient
                    colors={colors}
                    style={{ borderRadius: 10 }}
                    className="flex-1 rounded-xl"
                >
                    {Content}
                </LinearGradient>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            className="flex-1 bg-white/10 rounded-xl border border-white/20"
        >
            {Content}
        </Pressable>
    );
}
