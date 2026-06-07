import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

import { useUserStore } from "../../store/useUserStore";
import { getTrainingHistoryByUserId } from "../../service/trainingHistory";
import { ScreenBackground } from "../../components/ui/ScreenBackground";
import {
    CircleX,
    Flame,
    Zap,
    Clock,
    Target,
    Map as MapIcon,
    BarChart3,
    Dumbbell,
    MessageSquareText
} from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NavigationTypes } from "../../navigation/types";
import { FrequencyTrainingMonth } from "../../components/ui/FrequencyTrainingMonth";
import { Header } from "../../components/ui/Header";
import { ActionButton } from "../../components/ui/ActionButton";

// Tradutor de Intensidade
const translateIntensity = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
        case 'low': return 'Leve';
        case 'medium': return 'Moderado';
        case 'high': return 'Intenso';
        default: return 'Não informada';
    }
};

export default function TrainingHistory() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();

    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'journey' | 'stats'>('journey');
    const [loading, setLoading] = useState(true);

    const User = useUserStore((state) => state.user);

    useEffect(() => {
        const fetchData = async () => {
            if (!User?.id) return;
            setLoading(true);
            try {
                const historyResponse = await getTrainingHistoryByUserId(User.id);

                // Filtra para remover aeróbicos e ordena do mais recente para o mais antigo
                const sortedHistory = (historyResponse ?? [])
                    .filter((h: any) => h.type_training !== 'aerobic')
                    .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

                setHistory(sortedHistory);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [User?.id]);

    // Cálculos de Estatísticas e Ofensiva
    const stats = useMemo(() => {
        const totalWorkouts = history.length;
        const totalXp = history.reduce((acc, i) => acc + Number(i.xp_earned || 0), 0);

        const totalMinutes = history.reduce((acc, item) => {
            const mins = parseInt(item.duration_minutes) || 0;
            return acc + mins;
        }, 0);

        const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

        // Cálculo da Ofensiva (Streak)
        let currentStreak = 0;
        if (history.length > 0) {
            // Cria um Set com as datas únicas em que houve treino (ignorando a hora)
            const uniqueDates = new Set(
                history.map(item => {
                    const d = new Date(item.started_at);
                    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                })
            );

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

            let dateToCheck = new Date();

            // Verifica se treinou hoje ou ontem para iniciar a contagem
            if (uniqueDates.has(todayStr)) {
                currentStreak++;
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            } else if (uniqueDates.has(yesterdayStr)) {
                dateToCheck.setDate(dateToCheck.getDate() - 1); // Ofensiva mantida por ontem
            } else {
                // Não treinou hoje nem ontem = Ofensiva 0
                currentStreak = 0;
            }

            // Se a ofensiva começou, volta os dias para trás para ver até onde vai
            if (currentStreak > 0 || uniqueDates.has(yesterdayStr)) {
                while (true) {
                    const checkStr = `${dateToCheck.getFullYear()}-${dateToCheck.getMonth()}-${dateToCheck.getDate()}`;
                    if (uniqueDates.has(checkStr)) {
                        currentStreak++;
                        dateToCheck.setDate(dateToCheck.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }

        return { totalWorkouts, totalXp, avgDuration, currentStreak };
    }, [history]);

    const getZigZagPosition = (index: number) => {
        const positions = ['center', 'flex-end', 'center', 'flex-start'];
        return positions[index % 4];
    };

    if (loading) {
        return (
            <ScreenBackground>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />

                {/* Cabeçalho do Legado */}
                <View className="pt-2 pb-4 px-6 z-50">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-white text-3xl font-black tracking-tight">Meu Legado</Text>
                            <View className="flex-row items-center mt-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 self-start shadow-sm">
                                <Flame size={14} color="#FCD34D" fill="#FCD34D" />
                                <Text className="text-white font-bold text-[10px] ml-1.5 uppercase tracking-wider">
                                    Nível {User?.level || 1} • {stats.totalXp} XP
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-white/10 p-2.5 rounded-full border border-white/20"
                        >
                            <CircleX size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu de Abas */}
                <View className="bg-white/10 border border-white/20 rounded-2xl p-2 flex-row gap-2 shadow-sm mx-6 ">
                    <ActionButton
                        label="Jornada"
                        icon={<MapIcon color={activeTab === "journey" ? "white" : "#9CA3AF"} size={20} />}
                        colors={["#0073B9", "#0088CC"]}
                        active={activeTab === "journey"}
                        onPress={() => setActiveTab("journey")}
                    />
                    <ActionButton
                        label="Estatísticas"
                        icon={<BarChart3 color={activeTab === "stats" ? "white" : "#9CA3AF"} size={20} />}
                        colors={["#0073B9", "#0088CC"]}
                        active={activeTab === "stats"}
                        onPress={() => setActiveTab("stats")}
                    />
                </View>

                <View className="flex-1 mt-2">
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                        {/* ABA: JORNADA */}
                        {activeTab === "journey" ? (
                            <View className="items-center pt-4 px-6">
                                {history.length === 0 ? (
                                    <View className="items-center justify-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed w-full mt-4">
                                        <Text className="text-white/60 font-medium text-sm text-center px-4">
                                            Sua jornada de força começou agora.{'\n'}Complete treinos para ver seu legado!
                                        </Text>
                                    </View>
                                ) : (
                                    history.map((item, index) => {
                                        const align = getZigZagPosition(index);
                                        const intensityColor = item.intensity === 'high' ? '#EF4444' : item.intensity === 'medium' ? '#F59E0B' : '#10B981';

                                        return (
                                            <View key={item.id} className="mb-12 w-full relative" style={{ alignItems: align as any }}>

                                                {/* Linha de conexão */}
                                                {index < history.length - 1 && (
                                                    <View
                                                        className="absolute w-1 bg-white/20 -bottom-12 rounded-full"
                                                        style={{
                                                            height: 50,
                                                            left: align === 'center' ? '50%' : align === 'flex-start' ? '30%' : '70%',
                                                            transform: [{ translateX: -2 }],
                                                            zIndex: 0
                                                        }}
                                                    />
                                                )}

                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    className="w-[85%] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm z-10"
                                                >
                                                    <View
                                                        className="absolute left-0 top-0 bottom-0 w-2"
                                                        style={{ backgroundColor: intensityColor }}
                                                    />

                                                    <View className="p-4 pl-6">
                                                        <View className="flex-row justify-between items-center mb-3">
                                                            <View className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                                                                <Text className="text-[10px] uppercase tracking-wider text-[#0073B9] font-bold">
                                                                    {new Date(item.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                                </Text>
                                                            </View>

                                                            {/* Intensidade Textual */}
                                                            <View className="flex-row items-center">
                                                                <Text className="text-[10px] uppercase tracking-wider font-bold" style={{ color: intensityColor }}>
                                                                    {translateIntensity(item.intensity)}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View className="flex-row items-center mb-4">
                                                            <Text className="text-[#1D2D3E] font-black text-lg flex-1 leading-6 pr-2" numberOfLines={2}>
                                                                {item.training_name}
                                                            </Text>
                                                            <View className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                                <Target size={20} color="#0073B9" />
                                                            </View>
                                                        </View>

                                                        {/* Se houver comentário do treino, mostra aqui */}
                                                        {item.comment ? (
                                                            <View className="mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-row items-start gap-2">
                                                                <MessageSquareText size={14} color="#9CA3AF" className="mt-0.5" />
                                                                <Text className="text-gray-500 text-xs font-medium flex-1 italic leading-4">
                                                                    "{item.comment}"
                                                                </Text>
                                                            </View>
                                                        ) : null}

                                                        <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                                                            <View className="flex-row items-center bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                                                <Clock size={12} color="#6B7280" />
                                                                <Text className="text-gray-600 text-xs ml-1.5 font-bold">
                                                                    {item.duration_minutes || '--'} min
                                                                </Text>
                                                            </View>

                                                            <View className="flex-row items-center bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                                                                <Zap size={12} color="#F59E0B" fill="#F59E0B" />
                                                                <Text className="text-amber-600 text-xs font-black ml-1 uppercase tracking-wider">
                                                                    +{item.xp_earned} XP
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>

                                            </View>
                                        );
                                    })
                                )}
                            </View>

                        ) : (

                            /* ABA: ESTATÍSTICAS */
                            <View className="pt-2 pb-10">
                                <View className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-200 mx-6">
                                    <FrequencyTrainingMonth trainingHistoryMonth={history} />
                                </View>

                                <Text className="text-white text-[10px] uppercase font-bold tracking-widest mt-4 mb-4 mx-8">
                                    Resumo Geral (Força)
                                </Text>

                                <View className="flex-row flex-wrap justify-between px-6 gap-y-4">
                                    {/* Card: Ofensiva */}
                                    <View className="w-[48%] bg-white p-4 rounded-[20px] border border-gray-200 shadow-sm">
                                        <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-3">
                                            <Flame size={20} color="#F97316" fill="#F97316" />
                                        </View>
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Ofensiva</Text>
                                        <Text className="text-[#1D2D3E] text-2xl font-black">
                                            {stats.currentStreak} <Text className="text-sm text-gray-400 font-bold">dias</Text>
                                        </Text>
                                    </View>

                                    {/* Card: Total de Treinos */}
                                    <View className="w-[48%] bg-white p-4 rounded-[20px] border border-gray-200 shadow-sm">
                                        <View className="w-10 h-10 rounded-full bg-[#0073B9]/10 items-center justify-center mb-3">
                                            <Dumbbell size={20} color="#0073B9" />
                                        </View>
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Treinos Feitos</Text>
                                        <Text className="text-[#1D2D3E] text-2xl font-black">{stats.totalWorkouts}</Text>
                                    </View>

                                    {/* Card: Tempo Médio */}
                                    <View className="w-[48%] bg-white p-4 rounded-[20px] border border-gray-200 shadow-sm">
                                        <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mb-3">
                                            <Clock size={20} color="#10B981" />
                                        </View>
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Tempo Médio</Text>
                                        <Text className="text-[#1D2D3E] text-2xl font-black">{stats.avgDuration}<Text className="text-sm text-gray-400 font-bold">m</Text></Text>
                                    </View>

                                    {/* Card: XP Total */}
                                    <View className="w-[48%] bg-white p-4 rounded-[20px] border border-gray-200 shadow-sm">
                                        <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mb-3">
                                            <Zap size={20} color="#8B5CF6" />
                                        </View>
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">XP Ganho</Text>
                                        <Text className="text-[#1D2D3E] text-2xl font-black">{stats.totalXp}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </ScreenBackground>
    );
}