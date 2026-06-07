import React, { useState } from "react"
import { View, Text, Image, Pressable } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { User } from "lucide-react-native"
import ProfileInfo from "../../../components/modal/ProfileInfo"

export interface RankedUser {
    id: number
    username: string
    avatar: string | null
    level: number
    xp: number
    position: number
}

export function UserAvatar({
    uri,
    size = 48,
}: {
    uri?: string | null
    size?: number
}) {
    return (
        <View
            style={{ width: size, height: size }}
            className="rounded-full bg-gray-100 border border-gray-300 items-center justify-center overflow-hidden"
        >
            {uri ? (
                <Image
                    source={{
                        uri: uri
                    }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                />
            ) : (
                <User color="#9CA3AF" size={size * 0.5} />
            )}
        </View>
    )
}

export function PodiumCard({
    user,
    place,
    gradientColors,
    borderColor,
    height,
    type = "ranking"
}: {
    user?: any
    place: number
    gradientColors: readonly [string, string, ...string[]]
    borderColor: string
    height: number
    type?: "ranking" | "season"
}) {
    const hasUser = !!user;

    const baseColorClass = place === 1
        ? 'bg-amber-50 border-amber-200'
        : place === 2
            ? 'bg-gray-50 border-gray-200'
            : 'bg-orange-50 border-orange-200';

    const numberColorClass = place === 1
        ? 'text-amber-300'
        : place === 2
            ? 'text-gray-300'
            : 'text-orange-300';

    return (
        <Animated.View
            entering={FadeInDown.delay(place * 120)}
            className="items-center flex-1"
        >
            <Pressable
                disabled={!hasUser}
                className="w-full items-center shadow-sm"
            >
                <LinearGradient
                    // Usa gradiente cinza se estiver vazio
                    colors={hasUser ? gradientColors : ['#F9FAFB', '#F3F4F6']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                        borderRadius: 24,
                        padding: 16,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: hasUser ? borderColor : '#E5E7EB',
                        minWidth: 100,
                        width: '100%',
                        opacity: hasUser ? 1 : 0.6
                    }}
                >
                    <UserAvatar
                        uri={user?.avatar}
                        size={place === 1 ? 64 : 52}
                    />

                    <Text
                        numberOfLines={1}
                        className={`font-black mt-3 text-sm text-center ${hasUser ? 'text-[#1D2D3E]' : 'text-gray-400'}`}
                    >
                        {user?.username ?? "Vazio"}
                    </Text>

                    {type === "ranking" && (
                        <>
                            <Text className={`text-[10px] uppercase font-bold mt-0.5 ${hasUser ? 'text-gray-600' : 'text-gray-400'}`}>
                                {hasUser ? `Nível ${user.level}` : "—"}
                            </Text>

                            <View className="bg-white/80 px-2.5 py-1 rounded-full mt-1.5 border border-white/50">
                                <Text className={`font-black text-[10px] ${hasUser ? 'text-[#0073B9]' : 'text-gray-400'}`}>
                                    {hasUser ? `${user.xp} XP` : "0 XP"}
                                </Text>
                            </View>
                        </>
                    )}

                    {type === "season" && (
                        <View className="bg-white/80 px-2.5 py-1 rounded-full mt-1.5 border border-white/50">
                            <Text className={`font-black text-[10px] ${hasUser ? 'text-[#0073B9]' : 'text-gray-400'}`}>
                                {hasUser ? `Pontos: ${user.season_points}` : "0 Pontos"}
                            </Text>
                        </View>
                    )}

                </LinearGradient>
            </Pressable>

            {/* Base (Degrau) do Pódio */}
            <View
                style={{ height: height * 1.4 }}
                className={`w-[90%] mt-2 rounded-t-2xl ${baseColorClass} border-t border-x items-center pt-2`}
            >
                <Text className={`font-black text-2xl ${numberColorClass}`}>
                    {place}º
                </Text>
            </View>
        </Animated.View>
    )
}