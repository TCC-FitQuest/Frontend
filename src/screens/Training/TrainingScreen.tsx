import React, { useEffect, useState } from "react";
import {
    View, ScrollView, Text, TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ScreenBackground } from "../../components/ui/ScreenBackground";
import { useUserStore } from "../../store/useUserStore";
import { useTrainingStore } from "../../store/useTrainingStore";
import { Header } from "../../components/ui/Header";
import { FrequencyTraining } from "../../components/ui/FrequencyTraining";
import { getTrainingHistoryWeek } from "../../service/trainingHistory";
import { GymLoading } from "../../components/ui/GymLoading";

import { useTrainingProtocolStore } from "../../store/useTrainingProtocol";
import { getTrainingById, getTrainingWeekByTrainingId } from "../../service/trainingService";
import { DAYS_ORDER } from "../../utils/days";
import { Ionicons } from "@expo/vector-icons";

// Função para traduzir a intensidade
const translateIntensity = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
        case 'low': return 'Baixa';
        case 'medium': return 'Média';
        case 'high': return 'Alta';
        default: return '-';
    }
};

function TrainingNode({ training, index, trainingHistory, onPress }: any) {

    const historyLogs = trainingHistory?.filter((h: any) => h.training_id === training.id) || [];

    const latestHistory = historyLogs[historyLogs.length - 1];

    let isProgress = false;
    let isComplete = false;
    let statusText = "Pendente nesta semana";
    let borderColor = "border-gray-200 bg-white";
    let badgeColor = "bg-gray-100";
    let badgeTextColor = "text-gray-500";
    let iconName: any = "calendar-outline";
    let timeInfo = "";

    if (latestHistory) {
        if (latestHistory.status === 'progress') {
            isProgress = true;
            statusText = "Em andamento";
            borderColor = "border-[#0073B9] bg-white shadow-[#0073B9]/20 shadow-md"; // Destaque azul
            badgeColor = "bg-[#0073B9]/10";
            badgeTextColor = "text-[#0073B9]";
            iconName = "play-circle-outline";

            const date = new Date(latestHistory.started_at);
            timeInfo = `Iniciado hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

        } else if (latestHistory.status === 'complete') {
            isComplete = true;
            statusText = "Concluído";
            // Paleta neutra para treino concluído (fundo cinza claro) para não distrair
            borderColor = "border-gray-200 bg-[#F9FAFB]";
            badgeColor = "bg-[#10B981]/10";
            badgeTextColor = "text-[#10B981]";
            iconName = "checkmark-circle";

            const date = new Date(latestHistory.finished_at || latestHistory.started_at);
            const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            timeInfo = `Feito dia ${formattedDate} às ${formattedTime}`;
        }
    }

    return (
        <View className={`border-2 rounded-2xl mb-4 overflow-hidden ${borderColor}`}>
            <View className="p-4">

                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className="text-gray-900 font-black text-lg mb-0.5">
                            {training.name || `Treino ${index + 1}`}
                        </Text>
                    </View>

                    <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${badgeColor}`}>
                        <Ionicons name={iconName} size={14} color={isComplete ? '#10B981' : (isProgress ? '#0073B9' : '#6B7280')} />
                        <Text className={`text-[10px] font-bold uppercase tracking-widest ${badgeTextColor}`}>
                            {statusText}
                        </Text>
                    </View>
                </View>

                {latestHistory && (
                    <View className="mb-4">
                        <Text className="text-gray-600 text-sm font-medium mb-2">
                            {timeInfo}
                        </Text>

                        {isComplete && (
                            <View className="flex-row items-center gap-3 mt-1">
                                {latestHistory.duration_minutes ? (
                                    <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200">
                                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs font-bold">{latestHistory.duration_minutes} min</Text>
                                    </View>
                                ) : null}

                                {latestHistory.intensity ? (
                                    <View className="flex-row items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200">
                                        <Ionicons name="flame-outline" size={14} color="#F97316" />
                                        <Text className="text-gray-600 text-xs font-bold">{translateIntensity(latestHistory.intensity)}</Text>
                                    </View>
                                ) : null}

                                {latestHistory.xp_earned > 0 ? (
                                    <View className="flex-row items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                                        <Ionicons name="star" size={14} color="#EAB308" />
                                        <Text className="text-yellow-700 text-xs font-bold">+{latestHistory.xp_earned} XP</Text>
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </View>
                )}

                {!latestHistory && (
                    <Text className="text-gray-400 text-xs font-medium mb-4">
                        Nenhum registro para este treino nesta semana.
                    </Text>
                )}

                {/* Botões de Ação */}
                {isComplete ? (
                    <View className="flex-row gap-3">

                        <TouchableOpacity
                            onPress={onPress}
                            className="flex-1 py-3 rounded-xl items-center justify-center bg-[#1D2D3E] flex-row gap-1.5"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={16} color="#FFFFFF" />
                            <Text className="font-bold text-xs uppercase tracking-wider text-white">
                                Repetir
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={onPress}
                        className={`py-3 rounded-xl items-center justify-center flex-row gap-2 ${isProgress ? 'bg-[#0073B9]' : 'bg-[#1D2D3E]'
                            }`}
                        activeOpacity={0.8}
                    >
                        {isProgress && <Ionicons name="play" size={16} color="#FFFFFF" />}
                        <Text className={`font-bold text-sm uppercase tracking-wider text-white`}>
                            {isProgress ? 'Continuar Treino' : 'Iniciar Treino'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export function TrainingScreen() {
    const navigation = useNavigation<any>();
    const User = useUserStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);

    const trainingProtocolHistoryStrength = useTrainingStore((state) => state.trainingProtocolHistoryStrength)
    const setTrainingProtocolHistoryStrength = useTrainingStore((state) => state.setTrainingProtocolHistoryStrength)
    const trainingProtocolHistoryAerobic = useTrainingStore((state) => state.trainingProtocolHistoryAerobic)
    const setTrainingProtocolHistoryAerobic = useTrainingStore((state) => state.setTrainingProtocolHistoryAerobic)

    useEffect(() => {
        try {
            if (!User) return

            const fetchHistory = async () => {
                getTrainingHistoryWeek(User?.id, 'strength')
                    .then((data) => {
                        setTrainingProtocolHistoryStrength(data ?? []);
                    })
                    .catch((error) => {
                        console.error("Error fetching training history:", error);
                    });

                getTrainingHistoryWeek(User?.id, 'aerobic')
                    .then((data) => {
                        setTrainingProtocolHistoryAerobic(data ?? []);
                    })
                    .catch((error) => {
                        console.error("Error fetching training history:", error);
                    });

                setIsLoading(false);
            }

            fetchHistory()
        } catch (error) {
            console.error(error);
        }
    }, [User]);

    const setSelectedTraining = useTrainingStore((state) => state.setSelectedTraining)
    const protocol = useTrainingProtocolStore((state) => state.protocol)
    const setProtocol = useTrainingProtocolStore((state) => state.setProtocol)
    const trainingProtocol = useTrainingStore((state) => state.trainingProtocol)
    const setTrainingProtocol = useTrainingStore((state) => state.setTrainingProtocol)

    useEffect(() => {
        try {
            if (!User) return

            const fetchProtocol = async () => {
                if (!User.active_protocol_id) return;

                getTrainingById(User.active_protocol_id)
                    .then((response) => {
                        setProtocol(response);
                    })
                    .catch((error) => {
                        console.error("Error fetching protocol:", error);
                    });

                getTrainingWeekByTrainingId(User.active_protocol_id)
                    .then((response) => {
                        const sorted = response.sort((a: any, b: any) => {
                            const dayA = DAYS_ORDER[a.day?.toLowerCase()] || 99;
                            const dayB = DAYS_ORDER[b.day?.toLowerCase()] || 99;
                            return dayA - dayB;
                        });
                        setTrainingProtocol(sorted);
                    })
                    .catch((error) => {
                        console.error("Error fetching training:", error);
                    });
            }

            fetchProtocol()
        } catch (error) {
            console.error(error);
        }
    }, [User]);

    return (
        <ScreenBackground>
            <Header />

            <View className="flex-1">
                {isLoading ?
                    <GymLoading />
                    :
                    <ScrollView
                        className="flex-1 px-4 pt-4"
                        contentContainerStyle={{ paddingBottom: 140 }}
                        showsVerticalScrollIndicator={false}
                    >

                        <View className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 mb-6">
                            <FrequencyTraining
                                trainingHistoryWeek={[...trainingProtocolHistoryStrength, ...trainingProtocolHistoryAerobic]}
                            />
                        </View>

                        <View className="relative">

                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-gray-300 text-[10px] uppercase font-bold tracking-widest">
                                        Protocolo ativo
                                    </Text>
                                    <Text className="text-white font-black text-xl">
                                        {protocol?.name ?? "Nenhum selecionado"}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => navigation.navigate("SelectTrainingProtocol")}
                                    className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                                >
                                    <Ionicons name="swap-horizontal-outline" size={16} color="#FFFFFF" />
                                    <Text className="text-white text-xs font-bold">Alterar</Text>
                                </TouchableOpacity>
                            </View>

                            {trainingProtocol.map((training: any, index: number) => (
                                <TrainingNode
                                    key={training.id}
                                    training={training}
                                    index={index}
                                    trainingHistory={trainingProtocolHistoryStrength}
                                    onPress={() => {
                                        setSelectedTraining(training);
                                        navigation.navigate("TrainingDetail");
                                    }}
                                />
                            ))}

                        </View>
                    </ScrollView>
                }
            </View>
        </ScreenBackground >
    );
}