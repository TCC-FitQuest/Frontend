import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CircleX, Settings2, ChevronRight } from 'lucide-react-native';
import Modal from 'react-native-modal';
import { CameraView } from 'expo-camera';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { getTrainingByType, getTrainingByUserId, getTrainingWeekByTrainingId } from '../../service/trainingService';
import { NavigationTypes } from '../../navigation/types';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { useTrainingProtocolStore } from '../../store/useTrainingProtocol';
import { useTrainingStore } from '../../store/useTrainingStore';
import { updateUser } from '../../service/userService';
import { useUserStore } from '../../store/useUserStore';
import { Header } from '../../components/ui/Header';

export function SelectTrainingProtocol() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();
    const [showCustom, setShowCustom] = useState(true);
    const [trainings, setTrainings] = useState<any[]>([]);
    const [trainingsPersonal, setTrainingsPersonal] = useState<any[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const setProtocol = useTrainingProtocolStore((state) => state.setProtocol);
    const setTrainingProtocol = useTrainingStore((state) => state.setTrainingProtocol);
    const setTrainingFriend = useTrainingStore((state) => state.setTrainingFriend);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [gymRes, personalRes] = await Promise.all([
                    getTrainingByType('gym'),
                    getTrainingByUserId(Number(user?.id) || 0)
                ]);
                setTrainings(gymRes);
                setTrainingsPersonal(personalRes);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [user]);

    const handleTraining = async (trainingProtocol: any) => {
        try {
            const response = await getTrainingWeekByTrainingId(trainingProtocol.id);
            setProtocol(trainingProtocol);
            setTrainingProtocol(response);

            if (user) {
                await updateUser(user.id, { active_protocol_id: trainingProtocol.id });
                setUser({ ...user, active_protocol_id: trainingProtocol.id });
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
        }
    };

    // Componente reutilizável para os cards com visual limpo
    const renderTrainingCard = (option: any) => (
        <TouchableOpacity
            key={option.id}
            onPress={() => handleTraining(option)}
            activeOpacity={0.7}
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
        >
            <View className="flex-1 pr-4">
                <Text className="text-[#1D2D3E] font-bold text-base mb-1 tracking-tight">
                    {option.name}
                </Text>
                <Text className="text-gray-500 text-xs font-medium leading-4" numberOfLines={2}>
                    {option.description || "Sem descrição disponível"}
                </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                <ChevronRight size={16} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />

                {/* Título e Botão Fechar - Adaptados para o fundo escuro */}
                <View className="px-6 py-4 flex-row justify-between items-center mt-2">
                    <View>
                        <Text className="text-white text-3xl font-black tracking-tight">Treinos</Text>
                        <Text className="text-white/60 text-sm font-medium mt-1">Escolha seu protocolo ativo</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainHome')}
                        className="bg-white/10 p-2.5 rounded-full border border-white/20"
                    >
                        <CircleX size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Botão Gerenciar Protocolos - Fundo Translúcido */}
                    <View className="px-6 mb-6 mt-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ProtocolsManagementScreen')}
                            className="flex-row items-center justify-center gap-2 bg-white/10 border border-white/20 shadow-sm rounded-2xl py-4"
                        >
                            <Settings2 size={20} color="#FFFFFF" />
                            <Text className="text-white font-bold text-sm uppercase tracking-wider">
                                Gerenciar Protocolos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/*  <View className="flex-row gap-3 px-6 mb-6">
                        <TouchableOpacity
                            onPress={() => setShowCustom(false)}
                            className={`flex-1 py-3.5 rounded-xl border ${!showCustom
                                ? 'bg-white border-white shadow-sm'
                                : 'bg-white/10 border-white/20'
                                }`}
                        >
                            <Text className={`font-bold text-center text-xs uppercase tracking-wider ${!showCustom ? 'text-[#1D2D3E]' : 'text-white/60'
                                }`}>
                                Plataforma
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowCustom(true)}
                            className={`flex-1 py-3.5 rounded-xl border ${showCustom
                                ? 'bg-white border-white shadow-sm'
                                : 'bg-white/10 border-white/20'
                                }`}
                        >
                            <Text className={`font-bold text-center text-xs uppercase tracking-wider ${showCustom ? 'text-[#1D2D3E]' : 'text-white/60'
                                }`}>
                                Personalizados
                            </Text>
                        </TouchableOpacity>
                    </View> */}

                    <View className="px-6">
                        {!showCustom ? (
                            trainings.length > 0 ? (
                                trainings.map(renderTrainingCard)
                            ) : (
                                <View className="items-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                                    <Text className="text-white/60 font-medium text-sm">Nenhum treino na plataforma.</Text>
                                </View>
                            )
                        ) : (
                            trainingsPersonal.length > 0 ? (
                                trainingsPersonal.map(renderTrainingCard)
                            ) : (
                                <View className="items-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                                    <Text className="text-white/60 font-medium text-sm">Nenhum treino personalizado.</Text>
                                </View>
                            )
                        )}
                    </View>
                </ScrollView>

                {/* Modal de Scanner */}
                <Modal isVisible={scannerOpen} style={{ margin: 0 }} onBackdropPress={() => setScannerOpen(false)}>
                    <View className="flex-1 bg-black">
                        <CameraView
                            style={{ flex: 1 }}
                            onBarcodeScanned={({ data }) => {
                                setScannerOpen(false);
                                try {
                                    setTrainingFriend(JSON.parse(data));
                                    navigation.goBack();
                                } catch { console.error('QR inválido'); }
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setScannerOpen(false)}
                            className="absolute bottom-12 self-center bg-black/50 px-8 py-4 rounded-full border border-white/20"
                        >
                            <Text className="text-white font-bold tracking-widest uppercase text-xs">Fechar Scanner</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        </ScreenBackground>
    );
}