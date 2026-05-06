import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Globe, Users, User, Search, XCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenBackground } from "../../components/ui/ScreenBackground";
import { ActionButton } from "../../components/ui/ActionButton";
import { PodiumCard } from "./components/PodiumCard";
import { Header } from "../../components/ui/Header";

import { useUserStore } from "../../store/useUserStore";
import { getGlobalRanking } from "../../service/ranking";
import { searchUsers } from "../../service/friend";
import ProfileInfo from "../../components/modal/ProfileInfo";

export interface RankedUser {
    id: number;
    username: string;
    avatar: string | null;
    level: number;
    xp: number;
    position?: number;
}

interface RankingResponse {
    top_3: RankedUser[];
    around_me: RankedUser[];
    my_position: number;
}

function RankingEllipsis() {
    return (
        <View className="items-center py-2">
            <Text className="text-white/60 text-xl tracking-widest">...</Text>
        </View>
    );
}

export default function Leaderboard() {
    const userStore = useUserStore((state) => state.user);

    const [ranking, setRanking] = useState<RankingResponse | null>(null);
    const [rankingType, setRankingType] = useState<"global" | "friends">("global");
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [results, setResults] = useState<RankedUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<RankedUser | null>(null);

    useEffect(() => {
        if (!userStore?.id) return;

        setLoading(true);
        getGlobalRanking(Number(userStore.id), rankingType)
            .then((data) => {
                setRanking(data);
            })
            .catch((err) => {
                console.error("Erro ao buscar ranking:", err);
            })
            .finally(() => setLoading(false));

    }, [userStore?.id, rankingType]);

    useEffect(() => {
        if (search.trim().length > 2) {
            setSearching(true);
            const delayDebounceFn = setTimeout(() => {
                handleSearch();
            }, 600);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setResults([]);
            setSearching(false);
        }
    }, [search]);

    async function handleSearch() {
        try {
            const data = await searchUsers(search);
            setResults(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    }

    if (loading && !ranking) {
        return (
            <ScreenBackground>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text className="text-white mt-4 font-bold uppercase tracking-wider">Carregando Ranking...</Text>
                </View>
            </ScreenBackground>
        );
    }

    const podium = ranking?.top_3 || [];
    const list = ranking?.around_me || [];
    const firstPosition = list[0]?.position ?? 0;
    const showTopEllipsis = firstPosition > 4;

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>

                <Header />
                <View className="flex-row items-center mb-5 px-8 mt-2">
                    <Ionicons name="trophy" size={32} color="#FFFFFF" />
                    <Text className="text-white text-3xl font-black ml-3 tracking-tight">RANKING</Text>
                </View>

                <View className="px-6 ">
                    {/* Alterado para fundo translúcido para não sumir no #1D2D3E e manter o visual limpo */}
                    <View className="bg-white/10 border border-white/20 rounded-2xl p-2 flex-row gap-2 shadow-sm">
                        <ActionButton
                            label="Global"
                            icon={<Globe color={rankingType === "global" ? "white" : "#9CA3AF"} size={20} />}
                            colors={["#0073B9", "#0088CC"]}
                            active={rankingType === "global"}
                            onPress={() => {
                                setRankingType("global");
                                setSearch("");
                            }}
                        />
                        <ActionButton
                            label="Amigos"
                            icon={<Users color={rankingType === "friends" ? "white" : "#9CA3AF"} size={20} />}
                            colors={["#0073B9", "#0088CC"]}
                            active={rankingType === "friends"}
                            onPress={() => {
                                setRankingType("friends");
                                setSearch("");
                            }}
                        />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                    <View className="px-6 mt-6">
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 h-14 shadow-sm">
                            <Search color={searching ? "#0073B9" : "#9CA3AF"} size={20} />
                            <TextInput
                                placeholder="Buscar jogador..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                                className="flex-1 text-[#1D2D3E] ml-3 font-medium text-base"
                            />
                            {searching ? (
                                <ActivityIndicator size="small" color="#0073B9" />
                            ) : (
                                search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch("")} className="p-1">
                                        <XCircle size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>

                    {search.trim() === "" ? (
                        <>
                            {podium.length >= 0 && (
                                <View className="flex-row justify-center items-end px-4 mt-6 mb-6 gap-3">
                                    <PodiumCard
                                        user={podium[1]}
                                        place={2}
                                        height={30}
                                        gradientColors={["#F3F4F6", "#E5E7EB"]}
                                        borderColor="#D1D5DB"
                                    />
                                    <PodiumCard
                                        user={podium[0]}
                                        place={1}
                                        height={45}
                                        gradientColors={["#FEF3C7", "#FDE68A"]}
                                        borderColor="#FCD34D"
                                    />
                                    <PodiumCard
                                        user={podium[2]}
                                        place={3}
                                        height={20}
                                        gradientColors={["#FFEDD5", "#FED7AA"]}
                                        borderColor="#FDBA74"
                                    />
                                </View>
                            )}

                            <View className="px-6 gap-3 mt-2">
                                {showTopEllipsis && <RankingEllipsis />}

                                {list.map((u, i) => {
                                    const isMe = Number(userStore?.id) === u.id;
                                    return (
                                        <Animated.View
                                            key={`rank-${u.id}`}
                                            entering={FadeInUp.delay(i * 30)}
                                            className={`rounded-2xl p-4 shadow-sm ${isMe
                                                ? "bg-[#E0F2FE] border border-[#0073B9]/30"
                                                : "bg-white border border-gray-200"
                                                }`}
                                        >
                                            <TouchableOpacity
                                                onPress={() => setSelectedUser(u)}
                                                className="flex-row items-center"
                                            >
                                                <View className={`w-10 h-10 rounded-xl items-center justify-center border ${isMe ? "bg-[#0073B9] border-[#0073B9]" : "bg-gray-50 border-gray-200"
                                                    }`}>
                                                    <Text className={`font-black text-sm ${isMe ? "text-white" : "text-[#1D2D3E]"}`}>
                                                        {u.position}
                                                    </Text>
                                                </View>

                                                <View className="ml-4 flex-1">
                                                    <Text className="text-[#1D2D3E] font-bold text-base">{u.username}</Text>
                                                    <Text className="text-gray-500 text-xs font-medium mt-0.5">
                                                        Nível {u.level} • {u.xp} XP
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                                {list.length > 0 && <RankingEllipsis />}
                            </View>
                        </>
                    ) : (
                        <View className="px-6 mt-6 gap-3">
                            {results.length > 0 ? (
                                results.map((u) => (
                                    <Animated.View
                                        key={`search-${u.id}`}
                                        entering={FadeInUp}
                                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm"
                                    >
                                        <TouchableOpacity
                                            onPress={() => setSelectedUser(u)}
                                            className="flex-row items-center"
                                        >
                                            <View className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 items-center justify-center">
                                                <User color="#9CA3AF" size={24} />
                                            </View>
                                            <View className="ml-4 flex-1">
                                                <Text className="text-[#1D2D3E] font-bold text-base">{u.username}</Text>
                                                <Text className="text-gray-500 text-xs font-medium">Nível {u.level}</Text>
                                            </View>
                                            <View className="bg-[#0073B9]/10 px-4 py-1.5 rounded-full">
                                                <Text className="text-[#0073B9] font-bold text-xs uppercase tracking-wider">VER</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))
                            ) : (
                                !searching && (
                                    <View className="items-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed mt-4">
                                        <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                                        <Text className="text-gray-500 mt-4 font-medium">Nenhum usuário encontrado</Text>
                                    </View>
                                )
                            )}
                        </View>
                    )}
                </ScrollView>

                {selectedUser && (
                    <ProfileInfo
                        visible={!!selectedUser}
                        onClose={() => setSelectedUser(null)}
                        selectedUser={selectedUser}
                    />
                )}

            </View>
        </ScreenBackground>
    );
}