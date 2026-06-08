import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput } from 'react-native';
import {
    ArrowLeft,
    Star,
    Clock,
    Flame,
    Trophy,
    CheckCircle2,
    Play,
    X,
    AlertTriangle,
    Share2
} from 'lucide-react-native';

import QRCode from "react-native-qrcode-svg";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NavigationTypes } from '../../navigation/types';

import { useTrainingStore } from '../../store/useTrainingStore';
import { useUserStore } from '../../store/useUserStore';
import { useTrainingHistoryStore } from '../../store/useTraningHistory';

import { createdTrainingHistory, getLastExercisesStats, saveBulkExerciseSets, updateTrainingHistory } from '../../service/trainingHistory';
import { getTrainingExerciseWeekById } from '../../service/trainingService';
import { updateUser } from '../../service/userService';

import { useToast } from '../../components/ui/ToastProvider';
import { ScreenBackground } from '../../components/ui/ScreenBackground';

import { Header } from '../../components/ui/Header';
import { useTimerStore } from '../../store/useTimerStore';
import { ActionButton } from '../../components/ui/ActionButton';

interface TrainingExerciseSet {
    id: number;
    set_number: number;
    reps: string;
    rest: string;
    details: string;
    completed: boolean;
    weight_used?: string;
    reps_performed?: string;
}

interface Exercise {
    id: number;
    name: string;
    status: string;
    video_url: string;
    order: number
    sets: TrainingExerciseSet[];
}

export default function TrainingDetail() {
    const { showToast } = useToast() as any;
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    const selectedTraining = useTrainingStore((state) => state.selectedTraining);
    const setSelectedTraining = useTrainingStore((state) => state.setSelectedTraining);

    const [trainingExercise, setTrainingExercise] = useState<Exercise[]>([]);

    const trainingExerciseStoreHistory: Exercise[] = useTrainingStore((state) => state.trainingExercise) ?? [];
    const setTrainingExerciseHistory = useTrainingStore((state) => state.setTrainingExercise);

    const setTrainingHistory = useTrainingHistoryStore((state) => state.setTrainingHistory);

    const trainingProtocolHistoryStrength = useTrainingStore((state) => state.trainingProtocolHistoryStrength)

    const trainingHistory = trainingProtocolHistoryStrength.filter(
        item => item?.status === "progress"
    )[0];

    const setTrainingProtocolHistoryStrength = useTrainingStore((state) => state.setTrainingProtocolHistoryStrength)

    const { timer, startTimer, stopTimer, resetTimer } = useTimerStore();

    const [elapsedTime, setElapsedTime] = useState<string>("00:00");
    const [showQrModal, setShowQrModal] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
    const [comment, setComment] = useState("");
    const [xpGainedToday, setXpGainedToday] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
    const [isResting, setIsResting] = useState(false);

    const isCurrentTrainingInProgress = useMemo(() => {
        return trainingHistory?.training_id === selectedTraining.id && trainingHistory?.status === "progress";
    }, [trainingHistory, selectedTraining.id]);

    const expandedExercise = trainingExercise?.find(
        (e: { id: number | null }) => e.id === expandedVideo
    );

    function getMediaType(url?: string): "video" | "image" | null {
        if (!url) return null;
        const cleanUrl = url.split("?")[0].toLowerCase();
        if (cleanUrl.match(/\.(mp4|mov|webm|mkv)$/)) return "video";
        if (cleanUrl.match(/\.(jpg|jpeg|png|webp)$/)) return "image";
        return null;
    }

    const qrPayload = JSON.stringify({
        day: selectedTraining.day,
        exercises: trainingExercise.length,
        id: selectedTraining.id,
        status: selectedTraining.status,
        title: selectedTraining.title,
        training_id: selectedTraining.training_id,
        type: selectedTraining.type,
        xp: selectedTraining.xp ?? 0,
    });

    const isThisTrainingInProgress = useMemo(() => {
        return trainingHistory?.training_id === selectedTraining.id && trainingHistory?.status === "progress";
    }, [trainingHistory, selectedTraining.id]);

    const hasConflict = useMemo(() => {
        return trainingHistory?.training_id !== selectedTraining.id && trainingHistory?.status === "progress";
    }, [trainingHistory, selectedTraining.id, trainingProtocolHistoryStrength]);

    useEffect(() => {
        if (!selectedTraining.id) return;

        const isInProgress = trainingHistory?.training_id === selectedTraining.id && trainingHistory?.status === "progress";

        if (isInProgress && trainingExerciseStoreHistory.length > 0) {
            setTrainingExercise(trainingExerciseStoreHistory);
            return;
        }

        async function loadTrainingData() {
            try {
                const response = await getTrainingExerciseWeekById(selectedTraining.id);
                const exerciseIds = response.map((ex: any) => ex.id);

                const result = await getLastExercisesStats(exerciseIds);
                const stats = (result?.data || result) || [];

                const normalized = response
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                    .map((ex: any) => {
                        const exHistory = Array.isArray(stats)
                            ? stats.filter((s: any) => s.exercise_id === ex.id)
                            : [];

                        return {
                            ...ex,
                            status: "progress",
                            sets: Array.isArray(ex.sets) ? ex.sets.flat()
                                .sort((a: any, b: any) => a.set_number - b.set_number)
                                .map((s: any) => {
                                    const prev = exHistory.find((h: any) => h.set_number === s.set_number);
                                    return {
                                        ...s,
                                        completed: false,
                                        weight_used: prev?.weight_used ? String(prev.weight_used) : "",
                                        reps_performed: prev?.reps_performed ? String(prev.reps_performed) : ""
                                    };
                                }) : []
                        };
                    });

                setTrainingExercise(normalized);
            } catch (error) {
                console.error("Erro ao carregar treino e histórico:", error);
            }
        }

        loadTrainingData();
    }, [selectedTraining.id, trainingHistory?.training_id]);

    useEffect(() => {
        if (!isThisTrainingInProgress || !trainingHistory?.started_at) {
            setElapsedTime("00:00");
            return;
        }

        const startTime = new Date(trainingHistory.started_at).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            if (diff < 0) return;

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsedTime(
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [isThisTrainingInProgress, trainingHistory?.id, trainingHistory?.started_at]);

    const handleToggleSet = (exerciseId: number, setId: number, restValue: string) => {
        if (!isThisTrainingInProgress) return;

        const updated = trainingExercise.map((ex) => {
            if (ex.id !== exerciseId) return ex;

            const updatedSets = ex.sets.map((s) => {
                if (s.id !== setId) return s;
                const newCompleted = !s.completed;
                if (newCompleted) {
                    const seconds = parseInt(restValue.replace(/[^0-9]/g, '')) || 60;
                    startTimer(seconds);
                    setIsResting(true);
                }
                return { ...s, completed: newCompleted };
            });

            return {
                ...ex,
                sets: updatedSets.sort((a, b) => a.set_number - b.set_number)
            };
        });

        const finalSorted = updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTrainingExerciseHistory(finalSorted);
        setTrainingExercise(finalSorted);
    };

    async function handleStartTraining() {
        if (hasConflict) return;
        try {
            const data = {
                user_id: Number(user?.id),
                training_id: selectedTraining.id,
                training_name: selectedTraining.title,
                training_protocol: "",
                started_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
                duration_minutes: "",
                intensity: "",
                status: "progress",
                xp_earned: 100,
                comment: "",
                coach_comment: "",
                description: "",
                type_training: "strength"
            };

            const response = await createdTrainingHistory(data);
            setTrainingProtocolHistoryStrength([
                ...(trainingProtocolHistoryStrength || []),
                { ...data, id: response.id }
            ])
            setTrainingHistory(response);
            setSelectedTraining({ ...selectedTraining, status: 'progress' });
        } catch (error) {
            console.error(error);
        }
    }

    function getXpToNextLevel(level: number) {
        const baseXp = 100;
        const factor = 1.5;
        return Math.floor(baseXp * Math.pow(factor, level - 1));
    }

    const challenges = useMemo(() => {
        const [minutes] = elapsedTime.split(':').map(Number);
        const durationBonus = minutes >= 60;

        const allExercisesDone = trainingExercise.length > 0 && trainingExercise.every(ex => ex.status === 'complete');
        const allSetsDone = trainingExercise.every(ex => ex.sets.every(s => s.completed));
        const completionBonus = allExercisesDone && allSetsDone;

        const daysMap = { 'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6, 'segunda-feira': 1, 'terça-feira': 2, 'quarta-feira': 3, 'quinta-feira': 4, 'sexta-feira': 5 };
        const isCorrectDay = daysMap[selectedTraining.day?.toLowerCase() as keyof typeof daysMap] === new Date().getDay();

        return { durationBonus, completionBonus, isCorrectDay };
    }, [elapsedTime, trainingExercise, selectedTraining.day]);

    async function handleFinishTraining() {
        if (!user) return;
        const baseXP = 100;
        const bonusXP = (Object.values(challenges).filter(Boolean).length) * 50;
        const today = new Date().toISOString();
        const alreadyEarnedXpToday = false;

        setXpGainedToday(alreadyEarnedXpToday)
        const earned = alreadyEarnedXpToday ? 0 : (baseXP + bonusXP);

        const data = {
            finished_at: today,
            duration_minutes: elapsedTime,
            intensity,
            status: "complete",
            xp_earned: earned,
            comment,
            score: Object.values(challenges).filter(Boolean).length
        };

        await updateTrainingHistory(trainingHistory.id, data);

        const setsToSave = trainingExercise.flatMap(ex =>
            ex.sets
                .map(s => ({
                    training_history_id: trainingHistory.id,
                    exercise_id: ex.id,
                    set_number: s.set_number,
                    weight_used: parseInt(s.weight_used || "0"),
                    reps_performed: parseInt(s.reps_performed || "0")
                }))
        );

        if (setsToSave.length > 0) {
            await saveBulkExerciseSets(setsToSave);
        }

        let newXp = user.xp;
        let newLevel = user.level;

        if (earned > 0) {
            newXp += earned;
            let xpToNext = getXpToNextLevel(newLevel);
            while (newXp >= xpToNext) {
                newXp -= xpToNext;
                newLevel++;
                xpToNext = getXpToNextLevel(newLevel);
            }
            await updateUser(user.id, { xp: newXp, level: newLevel, season_points: user.season_points + earned });
            setUser({ ...user, xp: newXp, level: newLevel, season_points: user.season_points + earned })
        }

        setTrainingExercise([]);
        setTrainingHistory(null);
        setSelectedTraining([]);
        setTrainingExerciseHistory([]);
        setShowFinishModal(false);
        showToast('TREINO FINALIZADO!', 'success');
        navigation.navigate("MainHome");
    }

    const handleUpdateSetData = (exerciseId: number, setId: number, field: 'weight_used' | 'reps_performed', value: string) => {
        const updated = trainingExercise.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            const updatedSets = ex.sets.map((s) => {
                if (s.id !== setId) return s;
                return { ...s, [field]: value };
            });
            return { ...ex, sets: updatedSets };
        });

        setTrainingExerciseHistory(updated);
        setTrainingExercise(updated);
    };

    const totalSets = trainingExercise.length;
    const completedCount = trainingExercise.filter(ex => ex.status === "complete").length;
    const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

                    <View className="flex-row items-center justify-between px-6 pt-2 pb-5">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="flex-row items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl border border-white/20 shadow-sm"
                        >
                            <ArrowLeft color="#FFFFFF" size={18} />
                            <Text className="text-white font-bold text-xs uppercase tracking-wider">Voltar</Text>
                        </TouchableOpacity>

                        {/*   <TouchableOpacity
                            onPress={() => setShowQrModal(true)}
                            className="p-2.5 bg-white/10 rounded-xl border border-white/20 shadow-sm"
                        >
                            <Share2 color="#FFFFFF" size={18} />
                        </TouchableOpacity> */}
                    </View>

                    <View className="mx-6 mb-6 bg-white border border-gray-200 rounded-2xl p-4 gap-4 shadow-sm">
                        {hasConflict ? (
                            <View className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex-row items-center gap-3">
                                <AlertTriangle color="#F59E0B" size={20} />
                                <Text className="text-amber-700 font-bold text-[11px] flex-1">
                                    Finalize o treino de "{trainingHistory.training_name}" antes de iniciar este.
                                </Text>
                            </View>
                        ) : (

                            <TouchableOpacity
                                onPress={isCurrentTrainingInProgress ? () => setShowFinishModal(true) : () => handleStartTraining()}
                                className={`py-3.5 rounded-xl flex-row justify-center items-center gap-2 ${isCurrentTrainingInProgress ? "bg-[#10B981]" : "bg-[#0073B9]"}`}
                            >
                                <Play color="#FFFFFF" size={18} />
                                <Text className="font-bold text-white uppercase tracking-wider text-sm">
                                    {isCurrentTrainingInProgress ? "Finalizar Treino" : "Iniciar Treino"}
                                </Text>
                            </TouchableOpacity>



                        )}

                        <View className="flex-row justify-between items-center">
                            <View className={`flex-row items-center gap-2 ${isCurrentTrainingInProgress ? "" : "opacity-50"}`}>
                                <Flame color="#0073B9" size={18} />
                                <Text className="text-[#1D2D3E] font-bold text-sm">Progresso {completedCount}/{totalSets}</Text>
                            </View>
                            {trainingHistory && trainingHistory.status === "progress" &&
                                <View className="flex-row items-center gap-1 bg-[#10B981]/10 px-2.5 py-1 rounded-md border border-[#10B981]/20">
                                    <Clock color="#10B981" size={14} />
                                    <Text className="text-[#047857] font-bold text-xs">{elapsedTime}</Text>
                                </View>
                            }
                        </View>

                        <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <View style={{ width: `${progress}%` }} className="h-full bg-[#0073B9]" />
                        </View>
                    </View>

                    <View
                        pointerEvents={isCurrentTrainingInProgress ? "auto" : "none"}
                        className={`px-6 ${isCurrentTrainingInProgress ? "" : "opacity-60"}`}
                    >
                        {/* Textos Ajustados para o Fundo Escuro */}
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-white font-black text-2xl flex-1 mr-2 tracking-tight">
                                {selectedTraining.title}
                            </Text>
                        </View>

                        {!isCurrentTrainingInProgress && !hasConflict && (
                            <Text className="text-white/60 text-xs italic mb-5 text-start font-medium">
                                Toque em "Iniciar Treino" lá em cima para marcar suas séries.
                            </Text>
                        )}

                        {trainingExercise.map((exercise) => (
                            <View key={exercise.id} className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border ${exercise.status === "complete" ? "border-[#10B981]/50" : "border-gray-200"}`}>
                                <Text className="text-[#1D2D3E] font-black mb-4 text-base tracking-tight">{exercise.name}</Text>

                                {exercise.sets.map((s) => (
                                    <View key={s.id} className={`p-3 rounded-xl mb-3 border ${s.completed ? 'bg-[#ECFDF5] border-[#10B981]/30' : 'bg-gray-50 border-gray-200'}`}>


                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-col  justify-start gap-2">
                                                <Text className="text-[#1D2D3E] font-bold text-xs uppercase tracking-wider">Série {s.set_number}</Text>
                                                <Text className="text-gray-500 text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                                                    Alvo: {s.reps} reps • {s.rest}
                                                </Text>

                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleToggleSet(exercise.id, s.id, s.rest)}
                                                className={`p-2.5 rounded-lg justify-center items-center shadow-sm border ${s.completed ? 'bg-[#10B981] border-[#10B981]' : 'bg-gray-100 border-gray-200'}`}
                                            >
                                                <CheckCircle2 color={s.completed ? "#FFFFFF" : "#9CA3AF"} size={22} />
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                ))}

                                <TouchableOpacity
                                    onPress={() => (
                                        setTrainingExerciseHistory(trainingExercise.map(ex => ex.id === exercise.id ? { ...ex, status: ex.status === 'complete' ? 'progress' : 'complete' } : ex)),
                                        setTrainingExercise(trainingExercise.map(ex => ex.id === exercise.id ? { ...ex, status: ex.status === 'complete' ? 'progress' : 'complete' } : ex))
                                    )}
                                    className={`mt-2 py-3.5 rounded-xl items-center border shadow-sm ${exercise.status === 'complete'
                                        ? 'bg-red-50 border-red-100'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <Text className={`font-bold text-xs uppercase tracking-wider ${exercise.status === 'complete' ? 'text-red-500' : 'text-[#0073B9]'}`}>
                                        {exercise.status === 'complete' ? "Desmarcar Exercício" : "Marcar Exercício Concluído"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <Modal visible={showQrModal} transparent animationType="fade">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowQrModal(false)}
                        className="flex-1 bg-black/70 items-center justify-center p-6"
                    >
                        <View className="bg-white rounded-3xl p-6 items-center gap-4 w-full max-w-sm shadow-2xl">
                            <View className="flex-row justify-between items-center w-full mb-2">
                                <Text className="text-[#1D2D3E] font-black text-xl tracking-tight">
                                    Compartilhar treino
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowQrModal(false)}
                                    className="bg-gray-100 p-2 rounded-full border border-gray-200"
                                >
                                    <X color="#6B7280" size={20} />
                                </TouchableOpacity>
                            </View>

                            <View className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
                                <QRCode value={qrPayload} size={220} />
                            </View>

                            <Text className="text-gray-500 text-sm text-center px-4 font-medium leading-5">
                                Peça para seu amigo escanear para abrir este treino no app
                            </Text>

                            <Text className="text-[#0073B9] font-black text-center text-lg mt-2">
                                {selectedTraining.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* MODAL DE TREINO FINALIZADO */}
                <Modal visible={showFinishModal} transparent animationType="fade">
                    <View className="flex-1 bg-black/70 justify-center items-center p-6">
                        <View className="bg-white rounded-3xl p-6 w-full max-w-sm gap-5 shadow-2xl">
                            <View className="items-center">
                                <View className="bg-[#10B981]/10 p-4 rounded-full mb-3 border border-[#10B981]/20">
                                    <Trophy color="#10B981" size={36} />
                                </View>
                                <Text className="text-[#1D2D3E] text-2xl font-black tracking-tight">Treino Finalizado!</Text>
                                <Text className="text-gray-500 text-sm mt-1 font-medium">Ótimo trabalho hoje.</Text>
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-2xl items-center shadow-sm">
                                    <Clock color="#6B7280" size={18} />
                                    <Text className="text-[#1D2D3E] font-black mt-1.5">{elapsedTime}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold mt-0.5 tracking-wider">Duração</Text>
                                </View>

                                <View className={`flex-1 border p-3 rounded-2xl items-center shadow-sm ${xpGainedToday ? 'border-amber-200 bg-amber-50' : 'border-[#10B981]/30 bg-[#ECFDF5]'}`}>
                                    <Star color={xpGainedToday ? "#F59E0B" : "#10B981"} size={18} fill={xpGainedToday ? "#F59E0B" : "#10B981"} />
                                    <Text className={`font-black mt-1.5 ${xpGainedToday ? 'text-amber-600' : 'text-[#047857]'}`}>
                                        {xpGainedToday ? "Limite" : "+100 XP"}
                                    </Text>
                                    <Text className={`text-[10px] uppercase font-bold mt-0.5 tracking-wider ${xpGainedToday ? 'text-amber-500/70' : 'text-[#10B981]/70'}`}>Recompensa</Text>
                                </View>
                            </View>

                            {xpGainedToday && (
                                <View className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                                    <Text className="text-amber-700 text-xs text-center font-medium leading-4">
                                        Você já atingiu o limite de XP de hoje, mas seu histórico será salvo normalmente!
                                    </Text>
                                </View>
                            )}

                            <View className="gap-2 mt-2">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Esforço Percebido</Text>
                                <View className="flex-row justify-between gap-2">
                                    {[
                                        { id: 'low', label: 'Leve', color: '#10B981', bg: '#ECFDF5' },
                                        { id: 'medium', label: 'Moderado', color: '#0073B9', bg: '#E0F2FE' },
                                        { id: 'high', label: 'Intenso', color: '#EF4444', bg: '#FEF2F2' }
                                    ].map((lvl) => (
                                        <TouchableOpacity
                                            key={lvl.id}
                                            onPress={() => setIntensity(lvl.id as any)}
                                            className={`flex-1 py-3 rounded-xl border-2 items-center`}
                                            style={{
                                                borderColor: intensity === lvl.id ? lvl.color : '#E5E7EB',
                                                backgroundColor: intensity === lvl.id ? lvl.bg : '#F9FAFB'
                                            }}
                                        >
                                            <Text className={`text-xs font-bold ${intensity === lvl.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {lvl.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="bg-gray-50 border border-gray-300 rounded-xl p-3 shadow-sm">
                                <TextInput
                                    value={comment}
                                    onChangeText={setComment}
                                    placeholder="Alguma observação sobre o treino?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    className="text-[#1D2D3E] text-sm min-h-[40px]"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleFinishTraining}
                                activeOpacity={0.8}
                                className="bg-[#0073B9] py-4 rounded-2xl shadow-lg shadow-[#0073B9]/30 mt-1"
                            >
                                <Text className="text-white font-black text-center uppercase tracking-widest text-sm">
                                    Confirmar Conclusão
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>

            <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24 }}>
                {timer !== "00:00" && (
                    <View className="bg-white border border-gray-200 p-4 rounded-3xl flex-row items-center justify-between shadow-2xl shadow-black/50">
                        <View className="flex-row items-center gap-4">
                            <View className="bg-[#0073B9]/10 p-3 rounded-2xl border border-[#0073B9]/20">
                                <Clock color="#0073B9" size={24} />
                            </View>
                            <View>
                                <Text className="text-[#0073B9] text-[10px] font-bold uppercase tracking-widest">
                                    Descanso Ativo
                                </Text>
                                <Text className="text-[#1D2D3E] text-3xl font-black leading-none mt-1">
                                    {timer}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => resetTimer()}
                            className="bg-red-50 p-3.5 rounded-2xl border border-red-100"
                        >
                            <X color="#EF4444" size={20} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScreenBackground>
    );
}