import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FadeInDown } from "react-native-reanimated";


const routeConfig: Record<string, { label: string; icon: string }> = {
    TrainingScreen: { label: "Treino", icon: "barbell" },
    TrainingHistory: { label: "Histórico", icon: "book" },
    Leaderboard: { label: "Ranking", icon: "trophy" },
    Friends: { label: "Amigos", icon: "people" },
    Profile: { label: "Perfil", icon: "person" },
};

const ACTIVE_COLOR = "#0073B9";
const INACTIVE_COLOR = "#9CA3AF";

export function BottomNavigation({ state, navigation }: BottomTabBarProps) {

    if (!state || !state.routes) return null;

    return (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <SafeAreaView
                edges={["bottom"]}
                className="bg-[#1D2D3E]"
                style={{
                    zIndex: 10,
                    borderTopWidth: 0.5,
                    borderTopColor: "#E5E7EB"
                }}
            >
                <View className="flex-row justify-around h-20">

                    {state.routes.map((route, index) => {
                        const isActive = state.index === index;
                        const config = routeConfig[route.name] || { label: route.name, icon: "help-circle" };

                        const itemColor = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isActive && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                className="flex-1 items-center justify-center"
                                activeOpacity={1}
                                onPress={onPress}
                            >
                                <MotiView
                                    animate={{
                                        scale: isActive ? 1.15 : 1,
                                        translateY: isActive ? -4 : 0,
                                    }}
                                    transition={{ type: "spring", damping: 15 }}
                                >
                                    <Ionicons
                                        name={isActive ? (config.icon as any) : `${config.icon}-outline` as any}
                                        size={24}
                                        color={itemColor}
                                    />
                                </MotiView>

                                <Text
                                    style={{ color: itemColor }}
                                    className={`text-[10px] mt-1 uppercase font-bold tracking-tighter ${isActive ? "opacity-100" : "opacity-80"}`}
                                >
                                    {config.label}
                                </Text>

                                {isActive && (
                                    <MotiView
                                        layout={FadeInDown}
                                        style={{
                                            height: 4,
                                            width: 16,
                                            backgroundColor: ACTIVE_COLOR,
                                            borderRadius: 2,
                                            marginTop: 4,
                                            position: 'absolute',
                                            bottom: 10
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </SafeAreaView>
        </View>
    );
}