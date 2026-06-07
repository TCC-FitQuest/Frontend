import { View, Text, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { MotiView } from 'moti';
import {
    ArrowLeft,
    Plus,
    Dumbbell,
    Trash2,
    Edit2,
    Play
} from 'lucide-react-native';

import { useUserStore } from '../../store/useUserStore';
import { getTrainingByUserId } from '../../service/trainingService';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NavigationTypes } from '../../navigation/types';
import { useTrainingProtocolStore } from '../../store/useTrainingProtocol';

import ProtocolDeleteModal from '../../components/modal/ProtocolDeleteModal';
import { Header } from '../../components/ui/Header';
import { ScreenBackground } from '../../components/ui/ScreenBackground';

export default function ProtocolsManagementScreen() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();
    const user = useUserStore((state) => state.user);

    const trainingsAll = useTrainingProtocolStore((state) => state.trainingProtocolAll) ?? [];
    const setTrainingProtocolAll = useTrainingProtocolStore((state) => state.setTrainingProtocolAll);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [protocolToDelete, setProtocolToDelete] = useState<any | null>(null);

    const setTrainingProtocolUpdate = useTrainingProtocolStore((state) => state.setTrainingProtocolUpdate);

    useEffect(() => {
        if (!user?.id) return;

        getTrainingByUserId(Number(user?.id))
            .then((response) => {
                const protocols = response?.all_protocols ? response.all_protocols : (Array.isArray(response) ? response : []);
                setTrainingProtocolAll(protocols);
            })
            .catch(console.error);

    }, [user]);

    const openDeleteModal = (protocol: any) => {
        setProtocolToDelete(protocol);
        setShowDeleteModal(true);
    };

    // Filtra automaticamente para exibir apenas os protocolos pessoais do usuário
    const personalTrainings = trainingsAll.filter((protocol: any) => !protocol.community_id);

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />

                {/* Topo: Título, Voltar e Novo */}
                <View className="flex-row items-center gap-3 mb-6 px-6 mt-2">
                    <Pressable
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 items-center justify-center shadow-sm"
                    >
                        <ArrowLeft size={20} color="#FFFFFF" />
                    </Pressable>

                    <View className="flex-1">
                        <Text className="text-white font-black text-2xl tracking-tight">
                            Meus Protocolos
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => navigation.navigate("CreateTrainingProtocol")}
                        className="flex-row items-center gap-1.5 bg-white/10 px-3 py-2.5 rounded-xl border border-white/20 shadow-sm"
                    >
                        <Plus size={16} color="#FFFFFF" />
                        <Text className="text-white font-bold text-xs uppercase tracking-wider">Novo</Text>
                    </Pressable>
                </View>

                {/* Lista de Protocolos Pessoais */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
                    {personalTrainings.length === 0 && (
                        <View className="items-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed mt-4">
                            <Text className="text-white/60 font-medium text-sm">Você ainda não possui nenhum protocolo.</Text>
                        </View>
                    )}

                    {personalTrainings.map((protocol: any) => {
                        return (
                            <MotiView
                                key={protocol.id}
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                className={`rounded-2xl border p-4 mb-4 shadow-sm bg-white ${user?.active_protocol_id === protocol.id ? 'border-[#10B981]/50' : 'border-gray-200'
                                    }`}
                            >
                                {user?.active_protocol_id === protocol.id && (
                                    <View className="mb-3 bg-[#ECFDF5] border border-[#10B981]/30 px-3 py-1.5 rounded-lg flex-row items-center self-start gap-2">
                                        <Play size={12} color="#10B981" />
                                        <Text className="text-[#047857] text-[10px] uppercase tracking-widest font-bold">
                                            Protocolo Ativo
                                        </Text>
                                    </View>
                                )}

                                <View className="flex-row gap-4">
                                    <View className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center">
                                        <Dumbbell size={24} color="#0073B9" />
                                    </View>

                                    <View className="flex-1 justify-center">
                                        <Text className="text-[#1D2D3E] font-black text-lg mb-1 leading-6">
                                            {protocol.name}
                                        </Text>

                                        <Text
                                            className="text-gray-500 text-xs font-medium leading-4"
                                            numberOfLines={2}
                                        >
                                            {protocol.description || "Nenhuma descrição informada."}
                                        </Text>
                                    </View>
                                </View>

                                {protocol.training_type === 'user' && (
                                    <View className="flex-row justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <Pressable
                                            onPress={() => {
                                                setTrainingProtocolUpdate(protocol);
                                                navigation.navigate('CreateTrainingProtocol');
                                            }}
                                            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0073B9]/10 border border-[#0073B9]/20"
                                        >
                                            <Edit2 size={16} color="#0073B9" />
                                            <Text className="text-[#0073B9] font-bold text-xs uppercase tracking-wider">Editar</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => openDeleteModal(protocol)}
                                            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 border border-red-100"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                            <Text className="text-red-500 font-bold text-xs uppercase tracking-wider">Excluir</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </MotiView>
                        );
                    })}
                </ScrollView>

                <ProtocolDeleteModal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    protocolToDelete={protocolToDelete}
                />
            </View>
        </ScreenBackground>
    );
}