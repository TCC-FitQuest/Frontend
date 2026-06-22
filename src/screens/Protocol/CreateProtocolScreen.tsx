import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { NavigationTypes } from '../../navigation/types'
import { ArrowLeft, Plus, Save, Trash2, Dumbbell, ChevronRight, Copy, ChevronDown } from 'lucide-react-native'
import { useUserStore } from '../../store/useUserStore'
import { useTrainingProtocolStore } from '../../store/useTrainingProtocol'
import { getTrainingExerciseWeekById, getTrainingWeekByTrainingId } from '../../service/trainingService'
import api from '../../service/api'
import { GymLoading } from '../../components/ui/GymLoading'
import { Ionicons } from '@expo/vector-icons'
import { useTrainingStore } from '../../store/useTrainingStore'
import { DAYS, DAYS_ORDER } from '../../utils/days'
import { ScreenBackground } from '../../components/ui/ScreenBackground'
import { useToast } from '../../components/ui/ToastProvider'

interface SetItem {
    id?: number
    reps: string
    rest: string
}

interface Exercise {
    id: string | number
    name: string
    sets: SetItem[]
    media?: {
        url: string
        type: 'image' | 'video'
    }
}

interface Workout {
    id: string | number
    day?: string
    name: string
    description: string
    exercises: Exercise[]
    isExpanded: boolean
}

export function CreateTrainingProtocol() {
    const { showToast } = useToast() as any;
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();
    const [isLoading, setIsLoading] = useState(false);

    const [protocolName, setProtocolName] = useState('')
    const [protocolDescription, setProtocolDescription] = useState('')
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [protocolId, setProtocolId] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const trainingsAll = useTrainingProtocolStore((state) => state.trainingProtocolAll) ?? [];
    const setTrainingProtocolAll = useTrainingProtocolStore((state) => state.setTrainingProtocolAll);
    const updateTrainingProtocol = useTrainingProtocolStore((state) => state.updateTrainingProtocol);

    const isBackendId = (id: any) => typeof id === 'number'

    const user = useUserStore((state) => state.user);

    const trainingProtocolUpdate = useTrainingProtocolStore((state) => state.trainingProtocolUpdate);
    const setTrainingProtocolUpdate = useTrainingProtocolStore((state) => state.setTrainingProtocolUpdate);
    console.log("Training Protocol Update:", trainingProtocolUpdate);

    const protocol = useTrainingProtocolStore((state) => state.protocol)
    const setProtocol = useTrainingProtocolStore((state) => state.setProtocol)

    const trainingProtocol = useTrainingStore((state) => state.trainingProtocol)
    const setTrainingProtocol = useTrainingStore((state) => state.setTrainingProtocol)
    const addTrainingProtocol = useTrainingStore((state) => state.addTrainingProtocol)
    const updateTrainingProtocolById = useTrainingStore((state) => state.updateTrainingProtocolById)

    const [workoutsToDelete, setWorkoutsToDelete] = useState<number[]>([])
    const [exercisesToDelete, setExercisesToDelete] = useState<number[]>([])
    const [setsToDelete, setSetsToDelete] = useState<number[]>([])


    const handleSelectDay = (workoutId: string | number, day: string) => {
        updateWorkout(workoutId, { day: day });
    };

    const getMediaTypeFromUrl = (
        url?: string
    ): 'video' | 'image' | undefined => {
        if (!url) return undefined

        const cleanUrl = url.split('?')[0].toLowerCase()

        if (cleanUrl.match(/\.(mp4|mov|webm|mkv)$/)) return 'video'
        if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)$/)) return 'image'

        return undefined
    }


    const loadExercises = async (id: number): Promise<Exercise[]> => {
        try {
            const response = await getTrainingExerciseWeekById(id)

            const sortedExercises = response.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

            return sortedExercises.map((e: any) => ({
                id: e.id,
                name: e.name,
                order: e.order,
                media: e.video_url
                    ? {
                        url: e.video_url,
                        type: getMediaTypeFromUrl(e.video_url),
                    }
                    : undefined,

                sets: Array.isArray(e.sets)
                    ? e.sets
                        .sort((a: any, b: any) => a.set_number - b.set_number)
                        .map((s: any) => ({
                            id: s.id,
                            reps: String(s.reps),
                            rest: s.rest,
                            set_number: s.set_numbe
                        }))
                    : [],
            }))
        } catch (err) {
            console.error('Erro ao carregar exercícios', err)
            return []
        }
    }

    useEffect(() => {
        if (!trainingProtocolUpdate) return
        setProtocolId(trainingProtocolUpdate.id)
        const loadProtocol = async () => {
            try {
                setProtocolName(trainingProtocolUpdate.name)
                setProtocolDescription(trainingProtocolUpdate.description)

                const weeks = await getTrainingWeekByTrainingId(
                    trainingProtocolUpdate.id
                )

                if (protocol.id === trainingProtocolUpdate.id)
                    setTrainingProtocol(weeks)

                const formattedWorkouts: Workout[] = await Promise.all(
                    weeks.map(async (w: any) => {
                        const exercises = await loadExercises(w.id)

                        return {
                            id: w.id,
                            name: w.title,
                            description: '',
                            isExpanded: false,
                            exercises,
                            day: w.day
                        }
                    })
                )

                formattedWorkouts.sort((a, b) => {
                    const orderA = DAYS_ORDER[a.day as string] ?? 99;
                    const orderB = DAYS_ORDER[b.day as string] ?? 99;
                    return orderA - orderB;
                });

                setWorkouts(formattedWorkouts);
            } catch (err) {
                console.error('Erro ao carregar protocolo', err)
                showToast('Erro ao carregar os dados do protocolo.', 'error');
            }
        }

        loadProtocol()
    }, [trainingProtocolUpdate])

    const addWorkout = () => {
        setWorkouts(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                name: `Treino ${String.fromCharCode(65 + prev.length)}`,
                description: '',
                exercises: [],
                isExpanded: true,
            },
        ])
    }

    const updateWorkout = (id: string | number, data: Partial<Workout>) => {
        setWorkouts(prev =>
            prev.map(w => (w.id === id ? { ...w, ...data } : w)),
        )
    }

    const removeWorkout = (id: string | number) => {
        if (typeof id === 'number') {
            setWorkoutsToDelete(prev => [...prev, id]);
        }
        setWorkouts(prev => prev.filter(w => w.id !== id))
    }

    const addExercise = (workoutId: string | number) => {
        setWorkouts(prev =>
            prev.map(w => {
                if (w.id === workoutId) {

                    const nextOrder = w.exercises.length;
                    return {
                        ...w,
                        exercises: [
                            ...w.exercises,
                            {
                                id: Date.now().toString(),
                                name: '',
                                order: nextOrder,
                                sets: [{ reps: '10', rest: '60s' }],
                            },
                        ],
                    };
                }
                return w;
            }),
        )
    }

    const updateExercise = (
        workoutId: string | number,
        exerciseId: string | number,
        data: Partial<Exercise>,
    ) => {
        setWorkouts(prev =>
            prev.map(w =>
                w.id === workoutId
                    ? {
                        ...w,
                        exercises: w.exercises.map(e =>
                            e.id === exerciseId ? { ...e, ...data } : e,
                        ),
                    }
                    : w,
            ),
        )
    }

    const removeExercise = (
        workoutId: string | number,
        exerciseId: string | number,
    ) => {
        if (typeof exerciseId === 'number') {
            setExercisesToDelete(prev => [...prev, exerciseId]);
        }
        setWorkouts(prev =>
            prev.map(w =>
                w.id === workoutId
                    ? {
                        ...w,
                        exercises: w.exercises.filter(e => e.id !== exerciseId),
                    }
                    : w,
            ),
        )
    }

    const addSet = (workoutId: string | number, exerciseId: string | number) => {
        setWorkouts(prev =>
            prev.map(w =>
                w.id === workoutId
                    ? {
                        ...w,
                        exercises: w.exercises.map(e => {
                            if (e.id === exerciseId) {
                                const lastSet = e.sets[e.sets.length - 1];
                                return {
                                    ...e,
                                    sets: [
                                        ...e.sets,
                                        {
                                            reps: lastSet?.reps || '10',
                                            rest: lastSet?.rest || '60s'
                                        },
                                    ],
                                };
                            }
                            return e;
                        }),
                    }
                    : w,
            ),
        );
    };

    const updateSet = (
        workoutId: string | number,
        exerciseId: string | number,
        setIndex: number,
        field: 'reps' | 'rest',
        value: string,
    ) => {
        setWorkouts(prev =>
            prev.map(w =>
                w.id === workoutId
                    ? {
                        ...w,
                        exercises: w.exercises.map(e =>
                            e.id === exerciseId
                                ? {
                                    ...e,
                                    sets: e.sets.map((s, i) =>
                                        i === setIndex
                                            ? { ...s, [field]: value }
                                            : s,
                                    ),
                                }
                                : e,
                        ),
                    }
                    : w,
            ),
        )
    }

    const duplicateWorkout = (workout: Workout) => {
        const newWorkout: Workout = {
            ...workout,
            id: `copy-${Date.now()}`,
            name: `${workout.name} (Cópia)`,
            exercises: workout.exercises.map(ex => ({
                ...ex,
                id: `ex-copy-${Math.random()}`,
                sets: ex.sets.map(s => ({ ...s, id: undefined }))
            }))
        };
        setWorkouts(prev => [...prev, newWorkout]);
    }

    const removeSet = (
        workoutId: string | number,
        exerciseId: string | number,
        setIndex: number,
    ) => {

        const workout = workouts.find(w => w.id === workoutId);
        const exercise = workout?.exercises.find(e => e.id === exerciseId);
        const setToDelete = exercise?.sets[setIndex];

        if (setToDelete?.id) {
            setSetsToDelete(prev => [...prev, setToDelete.id!]);
        }

        setWorkouts(prev =>
            prev.map(w =>
                w.id === workoutId
                    ? {
                        ...w,
                        exercises: w.exercises.map(e =>
                            e.id === exerciseId
                                ? {
                                    ...e,
                                    sets: e.sets.filter((_, i) => i !== setIndex)
                                }
                                : e,
                        ),
                    }
                    : w,
            ),
        )
    }


    const handleSave = async () => {
        try {
            setIsLoading(true)

            // Identifica se é uma edição baseada na existência do ID
            const isEditing = !!protocolId;

            if (setsToDelete.length > 0) {
                await Promise.all(setsToDelete.map(id => api.delete(`/api/exercise/sets/${id}`)));
            }

            if (exercisesToDelete.length > 0) {
                await Promise.all(exercisesToDelete.map(id => api.delete(`/api/exercise/${id}`)));
            }

            if (workoutsToDelete.length > 0) {
                await Promise.all(workoutsToDelete.map(id => api.delete(`/api/training/${id}`)));
            }

            const protocolPayload = {
                name: protocolName,
                description: protocolDescription,
                is_active: true,
                training_type: 'user',
            }

            let currentProtocolId = protocolId

            if (isEditing) {
                await api.put(
                    `/api/training_protocol/${protocolId}`,
                    protocolPayload,
                )

                updateTrainingProtocol(protocolId, protocolPayload)

                if (protocol.id === protocolId) {
                    setProtocol({ ...protocolPayload, id: protocolId })
                }


            } else {
                const res = await api.post(
                    '/api/training_protocol/',
                    protocolPayload,
                )
                currentProtocolId = res.data.id
                await api.post(
                    '/api/user_protocol/',
                    { user_id: user?.id, training_id: currentProtocolId },
                )
                setProtocolId(res.data.id)

                setTrainingProtocolAll([...trainingsAll, { ...protocolPayload, id: res.data.id }])
            }

            for (const workout of workouts) {
                const workoutPayload = {
                    day: workout.day || "",
                    title: workout.name,
                    exercises: 0,
                    xp: 0,
                    status: "",
                    type: "",
                    training_id: currentProtocolId
                }

                let workoutId = workout.id

                if (isBackendId(workout.id)) {
                    await api.put(`/api/training/${workout.id}`, workoutPayload)

                    if (protocol.id === currentProtocolId)
                        updateTrainingProtocolById(workout.id, { ...workoutPayload, id: workout.id })

                } else {
                    const res = await api.post('/api/training/', workoutPayload)
                    workoutId = res.data.id
                    workout.id = workoutId
                    if (protocol.id === currentProtocolId)
                        addTrainingProtocol({ ...workoutPayload, id: res.data.id })

                }

                for (let j = 0; j < workout.exercises.length; j++) {
                    const exercise = workout.exercises[j];
                    const exercisePayload = {
                        name: exercise.name,
                        training_id: workoutId,
                        video_url: exercise.media ? exercise.media.url : null,
                        status: "",
                        order: j
                    }

                    let exerciseId = exercise.id

                    if (isBackendId(exercise.id)) {
                        await api.put(
                            `/api/exercise/${exercise.id}`,
                            exercisePayload,
                        )
                    } else {
                        const res = await api.post(
                            '/api/exercise/',
                            exercisePayload,
                        )
                        exerciseId = res.data.id
                        exercise.id = exerciseId
                    }


                    for (let i = 0; i < exercise.sets.length; i++) {
                        const set = exercise.sets[i]

                        const setPayload = {
                            set_number: i + 1,
                            reps: set.reps,
                            rest: set.rest,
                            details: "",
                            completed: false,
                        }

                        if (set.id) {
                            await api.put(
                                `/api/exercise/sets/${set.id}`,
                                setPayload,
                            )
                        } else {
                            const res = await api.post(
                                `/api/exercise/${exerciseId}/sets`,
                                setPayload,
                            )
                            set.id = res.data.id
                        }
                    }
                }
            }

            // Dispara o Toast correto
            showToast(isEditing ? 'Protocolo atualizado com sucesso!' : 'Protocolo criado com sucesso!', 'success');
            navigation.goBack();

        } catch (e) {
            console.error('Erro ao salvar protocolo', e)
            showToast('Erro ao salvar o protocolo. Tente novamente.', 'error');
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                {/* Cabeçalho Clean Integrado ao #1D2D3E */}
                <View className="pt-14 pb-4 px-6 border-b border-white/10 bg-white/5">
                    <View className="flex-row items-center justify-between gap-3">
                        <Pressable
                            onPress={() => {
                                if (setTrainingProtocolUpdate) setTrainingProtocolUpdate(null);
                                navigation.goBack();
                            }}
                            className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center border border-white/20 shadow-sm"
                        >
                            <ArrowLeft size={20} color="#FFFFFF" />
                        </Pressable>

                        <View className="flex-1 px-2">
                            <Text className="text-white font-black text-xl tracking-tight">
                                {protocolId ? 'Editar Protocolo' : 'Criar Protocolo'}
                            </Text>
                            <Text className="text-white/60 text-xs font-medium">
                                {protocolId ? 'Modifique seu programa de treinos' : 'Monte seu programa de treinos'}
                            </Text>
                        </View>

                        <Pressable
                            disabled={!protocolName || workouts?.length === 0}
                            onPress={handleSave}
                            className={`px-4 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm ${!protocolName || workouts?.length === 0
                                ? 'bg-gray-400 opacity-50'
                                : 'bg-[#10B981]'
                                }`}
                        >
                            <Save size={16} color="white" />
                            <Text className="text-white font-bold text-sm uppercase tracking-wider">Salvar</Text>
                        </Pressable>
                    </View>
                </View>

                {isLoading ? (
                    <GymLoading
                        text1={protocolId ? "Salvando alterações..." : "Criando protocolo..."}
                        text2="Isso pode levar alguns segundos"
                    />
                ) : (
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        keyboardShouldPersistTaps="handled"
                        extraScrollHeight={120}
                        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Bloco: Informações do Protocolo */}
                        <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
                            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3 ml-1">
                                Dados Principais
                            </Text>

                            <TextInput
                                value={protocolName}
                                onChangeText={setProtocolName}
                                placeholder="Nome do protocolo (Ex: Força Bruta)"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[#1D2D3E] font-bold text-base mb-3"
                            />

                            <TextInput
                                value={protocolDescription}
                                onChangeText={setProtocolDescription}
                                placeholder="Breve descrição do objetivo do treino"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[#1D2D3E] min-h-[80px]"
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>

                        {/* Cabeçalho da Seção de Treinos */}
                        <View className="flex-row items-center justify-between mb-4 px-1">
                            <Text className="text-white font-black text-lg">
                                Treinos ({workouts?.length || 0})
                            </Text>

                            <Pressable
                                onPress={addWorkout}
                                className="bg-white/10 border border-white/20 px-3 py-2 rounded-lg flex-row items-center gap-1.5"
                            >
                                <Plus size={16} color="#FFFFFF" />
                                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                                    Adicionar Treino
                                </Text>
                            </Pressable>
                        </View>

                        {/* Estado Vazio */}
                        {(!workouts || workouts.length === 0) && (
                            <View className="border-2 border-dashed border-white/20 bg-white/5 rounded-3xl p-8 items-center mt-2">
                                <View className="bg-white/10 p-4 rounded-full mb-3">
                                    <Dumbbell size={32} color="#FFFFFF" />
                                </View>
                                <Text className="text-white font-bold text-center">
                                    Nenhum treino adicionado
                                </Text>
                                <Text className="text-white/60 text-xs text-center mt-1">
                                    Toque em "Adicionar Treino" para começar a montar os dias da semana.
                                </Text>
                            </View>
                        )}

                        {workouts?.map((workout: any, wIndex: number) => (
                            <Animated.View
                                key={workout.id}
                                entering={FadeIn}
                                exiting={FadeOut}
                                layout={Layout.springify()}
                                className="bg-white border border-gray-200 rounded-2xl mb-4 shadow-sm overflow-hidden"
                            >
                                {/* Cabeçalho do Treino (Dias e Nome) */}
                                <View className="p-4 bg-gray-50 border-b border-gray-200">
                                    {/* Nome e Ações do Treino */}
                                    <View className="flex-row gap-3 items-center">
                                        <View className="w-10 h-10 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-sm">
                                            <Text className="text-[#1D2D3E] font-black text-lg">
                                                {String.fromCharCode(65 + wIndex)}
                                            </Text>
                                        </View>

                                        <View className="flex-1">
                                            <TextInput
                                                value={workout.name}
                                                onChangeText={t => updateWorkout(workout.id, { name: t })}
                                                placeholder="Ex: Peito e Tríceps"
                                                placeholderTextColor="#9CA3AF"
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[#1D2D3E] font-bold shadow-sm"
                                            />
                                        </View>

                                        <View className="flex-row gap-1.5">
                                            <Pressable
                                                onPress={() => updateWorkout(workout.id, { isExpanded: !workout.isExpanded })}
                                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-sm"
                                            >
                                                {workout.isExpanded ? (
                                                    <ChevronDown size={18} color="#4B5563" />
                                                ) : (
                                                    <ChevronRight size={18} color="#4B5563" />
                                                )}
                                            </Pressable>
                                            <Pressable
                                                onPress={() => duplicateWorkout(workout)}
                                                className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center shadow-sm"
                                            >
                                                <Copy size={16} color="#10B981" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => removeWorkout(workout.id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 items-center justify-center shadow-sm"
                                            >
                                                <Trash2 size={16} color="#EF4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>

                                {/* Área Expandida (Exercícios) */}
                                {workout.isExpanded && (
                                    <View className="p-4 bg-white">
                                        <Pressable
                                            onPress={() => addExercise(workout.id)}
                                            className="bg-[#0073B9]/10 border border-[#0073B9]/20 px-4 py-2.5 rounded-xl self-start mb-4 flex-row items-center gap-1.5"
                                        >
                                            <Plus size={14} color="#0073B9" />
                                            <Text className="text-[#0073B9] font-bold text-xs uppercase tracking-wider">
                                                Novo Exercício
                                            </Text>
                                        </Pressable>

                                        {workout.exercises?.map((exercise: any) => (
                                            <View
                                                key={exercise.id}
                                                className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-4 shadow-sm"
                                            >
                                                {/* Nome do Exercício */}
                                                <View className="flex-row items-center gap-2 mb-2">
                                                    <TextInput
                                                        value={exercise.name}
                                                        onChangeText={t => updateExercise(workout.id, exercise.id, { name: t })}
                                                        placeholder="Nome do exercício"
                                                        placeholderTextColor="#9CA3AF"
                                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[#1D2D3E] font-bold shadow-sm text-sm"
                                                    />

                                                    <Pressable
                                                        onPress={() => removeExercise(workout.id, exercise.id)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 items-center justify-center shadow-sm"
                                                    >
                                                        <Trash2 size={16} color="#EF4444" />
                                                    </Pressable>
                                                </View>

                                                <View className="space-y-3">
                                                    <View className="flex-row items-center justify-between px-1 mb-1">
                                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                            Séries e Repetições
                                                        </Text>

                                                        <Pressable
                                                            onPress={() => addSet(workout.id, exercise.id)}
                                                            className="bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-1.5 rounded-lg flex-row items-center gap-1"
                                                        >
                                                            <Plus size={12} color="#10B981" />
                                                            <Text className="text-[#10B981] text-xs font-bold uppercase tracking-wider">
                                                                Série
                                                            </Text>
                                                        </Pressable>
                                                    </View>

                                                    {exercise.sets?.map((set: any, index: number) => (
                                                        <View
                                                            key={index}
                                                            className="bg-white border border-gray-200 rounded-xl p-2.5 flex-row items-center gap-3 shadow-sm mb-2"
                                                        >
                                                            <View className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 items-center justify-center">
                                                                <Text className="text-[#1D2D3E] text-xs font-black">
                                                                    {index + 1}
                                                                </Text>
                                                            </View>

                                                            <View className="flex-1 flex-row gap-3">
                                                                <View className="flex-1">
                                                                    <TextInput
                                                                        value={set.reps}
                                                                        onChangeText={t => updateSet(workout.id, exercise.id, index, 'reps', t)}
                                                                        placeholder="Ex: 10-12"
                                                                        placeholderTextColor="#9CA3AF"
                                                                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1D2D3E] font-bold text-xs"
                                                                    />
                                                                    <Text className="text-gray-400 text-[9px] uppercase font-bold mt-1 tracking-wider ml-1">
                                                                        Repetições
                                                                    </Text>
                                                                </View>

                                                                <View className="flex-1">
                                                                    <TextInput
                                                                        value={set.rest}
                                                                        onChangeText={t => updateSet(workout.id, exercise.id, index, 'rest', t)}
                                                                        placeholder="Ex: 60"
                                                                        placeholderTextColor="#9CA3AF"
                                                                        keyboardType="numeric"
                                                                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1D2D3E] font-bold text-xs"
                                                                    />
                                                                    <Text className="text-gray-400 text-[9px] uppercase font-bold mt-1 tracking-wider ml-1">
                                                                        Descanso (s)
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {exercise.sets.length > 1 && (
                                                                <Pressable
                                                                    onPress={() => removeSet(workout.id, exercise.id, index)}
                                                                    className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center mb-3"
                                                                >
                                                                    <Trash2 size={14} color="#EF4444" />
                                                                </Pressable>
                                                            )}
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </Animated.View>
                        ))}
                    </KeyboardAwareScrollView>
                )}
            </View>
        </ScreenBackground>
    );
}