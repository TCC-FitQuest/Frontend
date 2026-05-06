import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from 'moti';
import {
    Clock,
    Calendar,
    Zap,
    ChevronRight,
    Dumbbell,
    BarChart3,
    Activity
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { TrainingHistory } from "../../../models/TrainingHistory";
import { getTrainingHistoryByUserId } from "../../../service/trainingHistory";
import { useUserStore } from "../../../store/useUserStore";

export default function TrainingTab() {
    const user = useUserStore(state => state.user);
    const [history, setHistory] = useState<TrainingHistory[]>([]);

    const navigation = useNavigation<any>();

    useEffect(() => {
        if (!user?.id) return;

        getTrainingHistoryByUserId(user.id)
            .then((res: any) => setHistory(res))
            .catch((err: any) =>
                console.error("Erro ao buscar histórico:", err)
            );
    }, [user]);

    const stats = useMemo(() => {
        const completed = history.filter(h => h.status === "complete");

        const calculateStreak = () => {
            if (completed.length === 0) return 0;
            const dates = completed
                .map(h => new Date(h.finished_at).toISOString().split('T')[0])
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            const uniqueDates = [...new Set(dates)];

            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) return 0;

            for (let i = 0; i < uniqueDates.length; i++) {
                const expected = new Date();
                const startOffset = uniqueDates[0] === today ? 0 : 1;
                expected.setDate(expected.getDate() - i - startOffset);
                if (uniqueDates[i] === expected.toISOString().split('T')[0]) streak++;
                else break;
            }
            return streak;
        };

        const streak = calculateStreak();
        const totalMinutes = completed.reduce((acc, curr) => {
            const duration = curr.duration_minutes || "00:00";
            let min = 0, sec = 0;
            if (duration.includes('m') || duration.includes('s')) {
                const minMatch = duration.match(/(\d+)m/);
                const secMatch = duration.match(/(\d+)s/);
                min = minMatch ? Number(minMatch[1]) : 0;
                sec = secMatch ? Number(secMatch[1]) : 0;
            } else {
                const parts = duration.split(':');
                min = Number(parts[0]) || 0;
                sec = Number(parts[1]) || 0;
            }
            return acc + min + (sec / 60);
        }, 0);

        const avgTime = completed.length > 0 ? Math.round(totalMinutes / completed.length) : 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyCount = completed.filter(h => new Date(h.finished_at) >= sevenDaysAgo).length;
        const lastTraining = completed[0]?.training_name || "Nenhum registro";

        return { avgTime, weeklyCount, lastTraining, total: completed.length, streak };
    }, [history]);

    return (
        <View className="mt-2">
            <View className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <View className="p-6">

                    {/* Cabeçalho da Atividade */}
                    <View className="flex-row items-center mb-6">
                        <View className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                            <Activity size={24} color="#007bff" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                Última Atividade
                            </Text>
                            <Text className="text-slate-950 text-lg font-black" numberOfLines={1}>
                                {stats.lastTraining}
                            </Text>
                        </View>
                    </View>

                    {/* Grade de Estatísticas - Visual Slate Claro */}
                    <View className="flex-row gap-3 mb-6">
                        <StatItem
                            icon={<Clock size={16} color="#64748b" />}
                            label="Média"
                            value={`${stats.avgTime}m`}
                            active={false}
                        />
                        <StatItem
                            icon={<Calendar size={16} color="#64748b" />}
                            label="7 Dias"
                            value={`${stats.weeklyCount}x`}
                            active={false}
                        />
                        <StatItem
                            icon={<Zap size={16} color={stats.streak > 0 ? "#007bff" : "#64748b"} />}
                            label="Streak"
                            value={`${stats.streak}d`}
                            active={stats.streak > 0}
                        />
                    </View>

                    {/* Ações Rápidas - Cards Brancos */}
                    <View className="gap-3">
                        <ActionButton
                            onPress={() => navigation.navigate("ProtocolsManagementScreen")}
                            icon={<Dumbbell size={18} color="#007bff" />}
                            title="Protocolos de Treino"
                            subtitle="Configurar rotinas"
                        />
                        <ActionButton
                            onPress={() => navigation.navigate("TrainingHistory")}
                            icon={<BarChart3 size={18} color="#007bff" />}
                            title="Análise Evolutiva"
                            subtitle="Histórico completo"
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

const StatItem = ({ icon, label, value, active }: any) => (
    <View className={`flex-1 p-4 rounded-3xl border ${active ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
        <View className="mb-2">{icon}</View>
        <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">{label}</Text>
        <Text className={`text-lg font-black ${active ? 'text-[#007bff]' : 'text-slate-950'}`}>{value}</Text>
    </View>
);

const ActionButton = ({ onPress, icon, title, subtitle }: any) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
    >
        <View className="flex-row items-center gap-4">
            <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {icon}
            </View>
            <View>
                <Text className="text-slate-950 text-xs font-bold">{title}</Text>
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">{subtitle}</Text>
            </View>
        </View>
        <ChevronRight size={16} color="#cbd5e1" />
    </Pressable>
);