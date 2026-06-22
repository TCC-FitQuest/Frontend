import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenBackground } from "../../components/ui/ScreenBackground";
import { Header } from "../../components/ui/Header";
import { useUserStore } from "../../store/useUserStore";
import { getSeasonRanking } from "../../service/ranking";
// import { getSeasonRanking } from "../../service/ranking";

export interface RankedUser {
    id: number;
    username: string;
    avatar: string | null;
    level: number;
    xp: number;
    position: number;
    season_points: number;
}

interface RankingResponse {
    top_3: RankedUser[];
    around_me: RankedUser[];
    my_position: number;
}

function RankingEllipsis() {
    return (
        <View className="items-center py-2">
            <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </View>
    );
}

export default function CompetitionScreen() {
    const userStore = useUserStore((state) => state.user);

    const [rankingSeason, setRankingSeason] = useState<RankingResponse | null>();

    const [seasonInfo, setSeasonInfo] = useState({
        title: "Copa FitQuest",
        timeLeft: "Calculando...",

        endDate: "2026-07-10T23:59:59"
    });

    const calculateTimeLeft = (endDateString: string) => {
        const endDate = new Date(endDateString);
        const now = new Date();
        const diffMs = endDate.getTime() - now.getTime();

        if (diffMs <= 0) {
            return "Temporada encerrada";
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `Termina em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `Termina em ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
            return "Termina em breve";
        }
    };

    useEffect(() => {
        // Atualiza o tempo na montagem do componente
        setSeasonInfo(prev => ({
            ...prev,
            timeLeft: calculateTimeLeft(prev.endDate)
        }));

        // (Opcional) Atualiza o tempo a cada 1 hora se o usuário ficar muito tempo na tela
        const interval = setInterval(() => {
            setSeasonInfo(prev => ({
                ...prev,
                timeLeft: calculateTimeLeft(prev.endDate)
            }));
        }, 1000 * 60 * 60);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!userStore?.id) return;


        getSeasonRanking(Number(userStore.id))
            .then((data) => {
                console.log("Ranking da temporada:", data);
                setRankingSeason(data);
            })
            .catch((err) => {
                console.error("Erro ao buscar ranking:", err);
            });

    }, [userStore]);

    // Combina os dois arrays e ordena por posição para construir a lista única de forma fluida
    const getUnifiedList = () => {
        if (!rankingSeason) return [];

        const allUsers = [...rankingSeason.top_3, ...rankingSeason.around_me];
        const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.id, item])).values());

        return uniqueUsers.sort((a, b) => a.position - b.position);
    };

    const list = getUnifiedList();

    return (
        <ScreenBackground>
            <Header />

            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Card de Informação da Temporada */}
                <View className="bg-white border-2 border-gray-200 rounded-2xl mb-4 overflow-hidden">
                    <View className="p-4">
                        <View className="flex-col items-center gap-2">
                            <View className=" flex-row items-center justify-between w-full">
                                <Text className="text-gray-900 font-black text-xl mb-0.5">
                                    {seasonInfo.title}
                                </Text>
                                <View className={`flex-row items-center gap-1 px-2.5 py-1.5 rounded-full ${seasonInfo.timeLeft === "Temporada encerrada" ? 'bg-red-100' : 'bg-[#0073B9]/10'}`}>
                                    <Ionicons
                                        name={seasonInfo.timeLeft === "Temporada encerrada" ? "alert-circle-outline" : "time-outline"}
                                        size={14}
                                        color={seasonInfo.timeLeft === "Temporada encerrada" ? "#DC2626" : "#0073B9"}
                                    />
                                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${seasonInfo.timeLeft === "Temporada encerrada" ? 'text-red-600' : 'text-[#0073B9]'}`}>
                                        {seasonInfo.timeLeft}
                                    </Text>
                                </View>
                            </View>

                            <View>
                                <Text className="text-gray-900 font-bold mb-2">Como subir no ranking?</Text>
                                <Text className="text-gray-600 text-sm font-medium mb-4 leading-5">
                                    Ganhe pontos de temporada exclusivamente realizando seus treinos durante este período. Quando a temporada acabar, os pontos de todos os jogadores serão zerados para um novo começo!
                                </Text>

                                <View className="flex-row gap-3">
                                    <View className="flex-1 flex-row items-center justify-center gap-1.5 bg-[#F9FAFB] border border-gray-200 py-2.5 rounded-xl">
                                        <Ionicons name="barbell-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs font-bold">Treinos</Text>
                                    </View>
                                    <View className="flex-1 flex-row items-center justify-center gap-1.5 bg-[#F9FAFB] border border-gray-200 py-2.5 rounded-xl">
                                        <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs font-bold">Reset de Pontos</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Lista do Ranking */}
                <View className="mb-4">
                    <Text className="text-white font-black text-lg mb-4 px-1">
                        Líderes da Temporada
                    </Text>

                    {list.map((u, index) => {
                        const isMe = Number(userStore?.id) === u.id;

                        const previousPosition = index > 0 ? list[index - 1].position : 0;
                        const hasGap = index > 0 && u.position > previousPosition + 1;

                        const containerStyle = isMe
                            ? "border-[#0073B9] bg-blue-50/50"
                            : "border-gray-200 bg-white";

                        const badgeStyle = isMe
                            ? "bg-[#0073B9]"
                            : "bg-gray-100 border border-gray-200";

                        const badgeText = isMe
                            ? "text-white"
                            : "text-gray-600";

                        return (
                            <React.Fragment key={`rank-${u.id}`}>
                                {hasGap && <RankingEllipsis />}

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 mb-3 border-2 rounded-2xl ${containerStyle}`}
                                >
                                    <View className={`w-12 h-12 rounded-xl items-center justify-center ${badgeStyle}`}>
                                        <Text className={`font-black text-lg ${badgeText}`}>
                                            {u.position}º
                                        </Text>
                                    </View>

                                    <View className="ml-3 flex-1">
                                        <Text className="text-gray-900 font-bold text-base mb-0.5" numberOfLines={1}>
                                            {u.username.split('#')[0]}
                                        </Text>

                                        <View className="flex-row items-center gap-2">
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="star" size={12} color="#EAB308" />
                                                <Text className="text-gray-600 text-xs font-medium">
                                                    Nível {u.level}
                                                </Text>
                                            </View>
                                            <Text className="text-gray-300">•</Text>
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="trophy" size={12} color="#0073B9" />
                                                <Text className="text-[#0073B9] text-xs font-bold">
                                                    {u.season_points} Pts
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    })}
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}