import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CircleX, Settings2, ChevronRight, Dumbbell, User } from 'lucide-react-native'; // Ícones adicionados
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { getTrainingByType, getTrainingByUserId, getTrainingWeekByTrainingId } from '../../service/trainingService';
import { NavigationTypes } from '../../navigation/types';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { useTrainingProtocolStore } from '../../store/useTrainingProtocol';
import { useTrainingStore } from '../../store/useTrainingStore';
import { updateUser } from '../../service/userService';
import { useUserStore } from '../../store/useUserStore';
import { Header } from '../../components/ui/Header';
import { ActionButton } from '../../components/ui/ActionButton'; // ActionButton importado

type TabType = 'gym' | 'personal';

export default function SelectTrainingProtocol() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>();

    // Controle das Abas
    const [activeTab, setActiveTab] = useState<TabType>('gym');

    // Estados para cada tipo de treino
    const [trainings, setTrainings] = useState<any[]>([]); // Gym/Plataforma
    const [personalProtocols, setPersonalProtocols] = useState<any[]>([]);

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const setProtocol = useTrainingProtocolStore((state) => state.setProtocol);
    const setTrainingProtocol = useTrainingStore((state) => state.setTrainingProtocol);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [gymRes, userRes] = await Promise.all([
                    getTrainingByType('gym'),
                    getTrainingByUserId(Number(user?.id) || 0)
                ]);

                setTrainings(gymRes || []);
                setPersonalProtocols(userRes?.personal_protocols || []);
            } catch (error) {
                console.error("Erro ao buscar treinos:", error);
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

    // Função para renderizar o conteúdo baseado na aba selecionada
    const renderContent = () => {
        let currentList = [];
        let emptyMessage = "";

        switch (activeTab) {
            case 'gym':
                currentList = trainings;
                emptyMessage = "Nenhum treino na plataforma.";
                break;
            case 'personal':
                currentList = personalProtocols;
                emptyMessage = "Nenhum treino personalizado.";
                break;
        }

        if (currentList.length > 0) {
            return currentList.map(renderTrainingCard);
        }

        return (
            <View className="items-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                <Text className="text-white/60 font-medium text-sm">{emptyMessage}</Text>
            </View>
        );
    };

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />
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
                    <View className="px-6 mb-4">
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

                    {/* Botões atualizados usando o ActionButton */}
                    <View className="bg-white/10 border border-white/20 rounded-2xl p-2 flex-row gap-2 shadow-sm mx-6 mb-6">
                        <ActionButton
                            label="Plataforma"
                            icon={<Dumbbell color={activeTab === "gym" ? "white" : "#9CA3AF"} size={20} />}
                            colors={["#0073B9", "#0088CC"]}
                            active={activeTab === "gym"}
                            onPress={() => setActiveTab("gym")}
                        />
                        <ActionButton
                            label="Pessoais"
                            icon={<User color={activeTab === "personal" ? "white" : "#9CA3AF"} size={20} />}
                            colors={["#0073B9", "#0088CC"]}
                            active={activeTab === "personal"}
                            onPress={() => setActiveTab("personal")}
                        />
                    </View>

                    {/* Conteúdo Renderizado Corretamente */}
                    <View className="px-6">
                        {renderContent()}
                    </View>

                </ScrollView>
            </View>
        </ScreenBackground>
    );
}