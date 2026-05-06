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
import { ActionButton } from "../../components/ui/ActionButton";

import { useTrainingProtocolStore } from "../../store/useTrainingProtocol";
import { getTrainingById, getTrainingWeekByTrainingId } from "../../service/trainingService";
import { DAYS_ORDER } from "../../utils/days";
import { Ionicons } from "@expo/vector-icons";

function TrainingNode({ training, index, trainingHistory, onPress }: any) {

    const lastCompleted = trainingHistory?.find((h: any) => h.training_id === training.id);
    const completedDate = lastCompleted?.date
        ? new Date(lastCompleted.date).toLocaleDateString('pt-BR')
        : 'Nenhum registro recente';

    return (
        <View className="bg-white border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden">
            <View className="p-4">
                <Text className="text-gray-900 font-bold text-lg mb-1">
                    Treino {index + 1}
                </Text>
                <Text className="text-gray-600 font-medium mb-3">
                    {training.name} {training.day ? `- ${training.day}` : ''}
                </Text>

                <Text className="text-gray-500 text-xs font-medium mb-4">
                    Último treino concluído em: {completedDate}
                </Text>

                <TouchableOpacity
                    onPress={onPress}
                    className="bg-[#1D2D3E] py-3 rounded-lg items-center justify-center"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-sm uppercase tracking-wider">
                        Ver Treino
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export function TrainingScreen() {
    const navigation = useNavigation<any>();
    const User = useUserStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'training' | 'aerobic'>('training');

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

    const trainingFriend = useTrainingStore((state) => state.trainingFriend)
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

                            <View className="mb-6">
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