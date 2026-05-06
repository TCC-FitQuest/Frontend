import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useUserStore } from "../../store/useUserStore";
import { getTrainingHistoryByUserId, getUserProgression } from "../../service/trainingHistory";
import { ScreenBackground } from "../../components/ui/ScreenBackground";
import {
    CircleX,
    Map as MapIcon,
    Flame,
    ChevronDown,
    ChevronUp,
    Zap,
    Clock,
    Target,
    Star
} from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NavigationTypes } from "../../navigation/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FrequencyTrainingMonth } from "../../components/ui/FrequencyTrainingMonth";
import { Header } from "../../components/ui/Header";

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ExerciseProgressionCard = ({ ex, formatChartData }: { ex: any, formatChartData: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const chartData = formatChartData(ex.data_points);
    const maxWeight = Math.max(...ex.data_points.map((p: any) => p.weight));

    return (
        <View className="mb-4 bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpand}
                className="p-5 flex-row justify-between items-center"
            >
                <View className="flex-1">
                    <Text className="text-[#1D2D3E] font-bold text-lg leading-6">{ex.exercise_name}</Text>
                    <Text className="text-gray-500 text-xs font-medium mt-0.5">
                        {isExpanded ? "Ocultar gráfico" : "Ver evolução de carga"}
                    </Text>
                </View>

                <View className="flex-row items-center ml-2">
                    <View className="bg-[#0073B9]/10 px-3 py-1.5 rounded-xl border border-[#0073B9]/20 items-center mr-3">
                        <Text className="text-[#0073B9] text-[9px] font-black uppercase tracking-widest mb-0.5">PR</Text>
                        <Text className="text-[#1D2D3E] font-bold text-sm leading-4">{maxWeight}kg</Text>
                    </View>
                    <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                        {isExpanded ? (
                            <ChevronUp size={16} color="#9CA3AF" />
                        ) : (
                            <ChevronDown size={16} color="#9CA3AF" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View className="pb-5 px-5 ml-[-20]">
                    <LineChart
                        data={chartData}
                        height={120}
                        width={width - 80}
                        initialSpacing={20}
                        color="#0073B9"
                        thickness={3}
                        startFillColor="rgba(0, 115, 185, 0.2)"
                        endFillColor="rgba(0, 115, 185, 0.01)"
                        startOpacity={0.9}
                        endOpacity={0.1}
                        areaChart
                        noOfSections={3}
                        rulesColor="#F3F4F6"
                        yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                        xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 8, fontWeight: 'bold' }}
                        hideDataPoints={false}
                        dataPointsColor="#0073B9"
                        pointerConfig={{
                            pointerStripColor: '#0073B9',
                            pointerStripWidth: 2,
                            pointerColor: '#0073B9',
                            radius: 4,
                            pointerLabelComponent: (items: any) => (
                                <View className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                    <Text className="text-[#1D2D3E] font-bold text-xs">{items[0].value}kg</Text>
                                </View>
                            ),
                        }}
                    />
                </View>
            )}
        </View>
    );
};

export default function TrainingHistory() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();
    const [history, setHistory] = useState<any[]>([]);
    const [progression, setProgression] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'journey' | 'stats'>('journey');

    const [loading, setLoading] = useState(true);

    const User = useUserStore((state) => state.user);

    useEffect(() => {
        const fetchData = async () => {
            if (!User?.id) return;
            setLoading(true);
            try {
                const historyResponse = await getTrainingHistoryByUserId(User.id);
                const sortedHistory = (historyResponse ?? []).sort((a: any, b: any) =>
                    new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
                );
                setHistory(sortedHistory);
                const progResponse = await getUserProgression(Number(User.id));
                setProgression(progResponse ?? []);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [User?.id]);

    const xpAcumulado = useMemo(() =>
        history.reduce((acc, i) => acc + Number(i.xp_earned || 0), 0)
        , [history]);

    const getZigZagPosition = (index: number) => {
        const positions = ['center', 'flex-end', 'center', 'flex-start'];
        return positions[index % 4];
    };

    const formatChartData = (dataPoints: any[]) => {
        if (!dataPoints || dataPoints.length === 0) return [];
        const dailyMax: Record<string, { weight: number, timestamp: number }> = {};
        dataPoints.forEach(p => {
            const dateObj = new Date(p.date);
            const dateKey = dateObj.toLocaleDateString('pt-BR');
            if (!dailyMax[dateKey] || p.weight > dailyMax[dateKey].weight) {
                dailyMax[dateKey] = { weight: p.weight, timestamp: dateObj.getTime() };
            }
        });
        return Object.entries(dailyMax)
            .map(([label, info]) => ({
                value: info.weight,
                label: label.split('/')[0] + '/' + label.split('/')[1],
                timestamp: info.timestamp,
                dataPointText: `${info.weight}kg`,
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
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

                <View className="pt-2 pb-5 px-6 z-50">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-white text-3xl font-black tracking-tight">Meu Legado</Text>
                            <View className="flex-row items-center mt-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 self-start shadow-sm">
                                <Flame size={14} color="#FCD34D" fill="#FCD34D" />
                                <Text className="text-white font-bold text-[10px] ml-1.5 uppercase tracking-wider">
                                    Nível {User?.level || 1} • {xpAcumulado} XP
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

                <View className="flex-1">
                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                        {activeTab === "journey" ? (
                            <View className="items-center pt-4">
                                {history.map((item, index) => {
                                    const align = getZigZagPosition(index);
                                    const isBoss = false;
                                    const intensityColor = item.intensity === 'high' ? '#EF4444' : item.intensity === 'medium' ? '#0073B9' : '#10B981';

                                    const renderStars = (score: number) => {
                                        return (
                                            <View className="flex-row gap-1">
                                                {[1, 2, 3].map((starIndex) => (
                                                    <Star
                                                        key={starIndex}
                                                        size={14}
                                                        color={starIndex <= score ? "#F59E0B" : "#D1D5DB"}
                                                        fill={starIndex <= score ? "#F59E0B" : "transparent"}
                                                    />
                                                ))}
                                            </View>
                                        );
                                    };

                                    return (
                                        <View key={item.id} className="mb-12 w-full relative" style={{ alignItems: align as any }}>

                                            {index < history.length - 1 && (
                                                <View
                                                    className="absolute w-1 bg-white/20 -bottom-12 rounded-full"
                                                    style={{
                                                        height: 50,
                                                        left: align === 'center' ? '50%' : align === 'flex-start' ? '25%' : '75%',
                                                        transform: [{ translateX: -2 }],
                                                        zIndex: 0
                                                    }}
                                                />
                                            )}

                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                className={`w-[85%] bg-white border rounded-3xl overflow-hidden shadow-sm z-10 
                                                    ${isBoss ? 'border-amber-400' : 'border-gray-200'}
                                                `}
                                            >
                                                <View
                                                    className="absolute left-0 top-0 bottom-0 w-2"
                                                    style={{ backgroundColor: isBoss ? '#F59E0B' : intensityColor }}
                                                />

                                                <View className="p-4 pl-6">

                                                    <View className="flex-row justify-between items-center mb-3">

                                                        <View className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                                                            <Text className="text-[10px] uppercase tracking-wider text-[#0073B9] font-bold">
                                                                {new Date(item.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View className="flex-row items-center mb-4">
                                                        <Text className="text-[#1D2D3E] font-black text-lg flex-1 leading-6 pr-2" numberOfLines={2}>
                                                            {item.training_name}
                                                        </Text>
                                                        <View className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                            {isBoss ? (
                                                                <Flame size={20} color="#F59E0B" fill="#F59E0B" />
                                                            ) : (
                                                                <Target size={20} color="#0073B9" />
                                                            )}
                                                        </View>
                                                    </View>

                                                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                                                        <View className="flex-row items-center bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                                            <Clock size={12} color="#6B7280" />
                                                            <Text className="text-gray-600 text-xs ml-1.5 font-bold">
                                                                {item.duration_minutes} min
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

                                                {isBoss && (
                                                    <View className="bg-amber-500 py-1.5 items-center">
                                                        <Text className="text-amber-50 text-[10px] font-black uppercase tracking-[3px]">
                                                            Treino Épico
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>

                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <View className="pt-2">
                                <View className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-200">
                                    <FrequencyTrainingMonth trainingHistoryMonth={history} />
                                </View>

                                <Text className="text-white text-[10px] uppercase font-bold tracking-widest mt-8 mb-4 ml-2">
                                    Análise de Força por Exercício
                                </Text>

                                {progression.map((ex, index) => (
                                    <ExerciseProgressionCard
                                        key={index}
                                        ex={ex}
                                        formatChartData={formatChartData}
                                    />
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </ScreenBackground>
    );
}