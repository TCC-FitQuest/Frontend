import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Users, Crown, User, Plus, UserPlus, UserMinus } from 'lucide-react-native';

import { AddFriendModal } from '../../components/modal/AddFriendModal';
import { FriendRequestsModal } from '../../components/modal/FriendRequestsModal';
import { useUserStore } from '../../store/useUserStore';
import { getFriendsByUserId, removeFriend } from '../../service/friend';
import { useToast } from '../../components/ui/ToastProvider';
import { Header } from '../../components/ui/Header';
import { ScreenBackground } from '../../components/ui/ScreenBackground';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function FriendsTab() {
    const user = useUserStore(state => state.user);
    const { showToast } = useToast() as ToastContextType;
    const [friends, setFriends] = useState<any[]>([]);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        async function loadFriends() {
            try {
                await getFriendsByUserId(Number(user?.id))
                    .then((response: any) => {
                        setFriends(response)
                    })
                    .catch((err: any) =>
                        console.error("Erro ao buscar amigos:", err)
                    )
            } catch (error) {
                console.error("Erro ao carregar amigos:", error);
            }
        }
        loadFriends();
    }, [refreshing]);

    const handleRemoveFriend = async (friendId: number) => {
        try {
            await removeFriend(friendId, user ? Number(user.id) : 0);
            setFriends(prev => prev.filter(friend => friend.id !== friendId));
            setTimeout(() => {
                showToast('AMIGO REMOVIDO', 'success');
            }, 400);
        } catch (error) {
            console.error(error);
            setTimeout(() => {
                showToast('ERRO AO REMOVER AMIGO', 'error');
            }, 400);
        }
    }

    const EmptyFriends = () => (
        <View className="items-center justify-center bg-white border border-gray-200 rounded-3xl p-8 mt-2 shadow-sm">
            <View className="w-20 h-20 bg-gray-50 rounded-full border border-gray-100 items-center justify-center mb-4">
                <UserPlus size={40} color="#D1D5DB" />
            </View>
            <Text className="text-[#1D2D3E] text-xl font-black mb-2 text-center">
                Nenhum amigo
            </Text>
            <Text className="text-gray-500 text-sm text-center leading-5 font-medium px-4">
                Treinar acompanhado é muito melhor! Adicione amigos para comparar níveis e conquistas.
            </Text>
        </View>
    );

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                <Header />

                {/* Título da Página - Alinhamento idêntico ao "Protocolo Ativo" da tela de treinos */}
                <View className="px-6 mt-4 mb-6 flex-row justify-between items-end">
                    <View>
                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">
                            Comunidade
                        </Text>
                        <Text className="text-white text-3xl font-black tracking-tight">
                            AMIGOS
                        </Text>
                    </View>
                    <View className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                        <Text className="text-white font-bold text-xs">
                            {friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}
                        </Text>
                    </View>
                </View>

                {/* Bloco de Ações - Estética Branco/Cinza super limpa */}
                <View className="px-6 mb-6">
                    <View className="bg-white rounded-2xl p-2 flex-row gap-2 shadow-sm border border-gray-200">
                        <TouchableOpacity
                            onPress={() => setShowAddFriend(true)}
                            className="flex-1 bg-gray-50 py-3.5 rounded-xl flex-row items-center justify-center gap-2 border border-gray-100"
                        >
                            <Plus color="#1D2D3E" size={18} strokeWidth={2.5} />
                            <Text className="text-[#1D2D3E] font-bold text-sm">Adicionar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowRequests(true)}
                            className="flex-1 bg-gray-50 py-3.5 rounded-xl flex-row items-center justify-center gap-2 border border-gray-100"
                        >
                            <User color="#1D2D3E" size={18} strokeWidth={2.5} />
                            <Text className="text-[#1D2D3E] font-bold text-sm">Solicitações</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Lista de Amigos */}
                <View className="flex-1 px-6">
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 140 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<EmptyFriends />}
                        renderItem={({ item }) => (
                            <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-4 flex-row items-center gap-4">

                                {/* Avatar */}
                                <View className="relative">
                                    <View className="w-14 h-14 rounded-full bg-gray-50 items-center justify-center border border-gray-200">
                                        <User size={24} color="#9CA3AF" />
                                    </View>
                                    {item.isOnline && (
                                        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </View>

                                {/* Info do Usuário */}
                                <View className="flex-1">
                                    <Text className="text-[#1D2D3E] font-bold text-lg mb-0.5" numberOfLines={1}>
                                        {item.username}
                                    </Text>
                                    <View className="flex-row items-center gap-1.5">
                                        <Crown size={14} color="#FCD34D" />
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            Nível {item.level}
                                        </Text>
                                    </View>
                                </View>

                                {/* Botão Remover - Ícone elegante ao invés de texto grande */}
                                <TouchableOpacity
                                    className="w-11 h-11 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                                    onPress={() => handleRemoveFriend(item.id)}
                                >
                                    <UserMinus size={20} color="#EF4444" />
                                </TouchableOpacity>

                            </View>
                        )}
                    />
                </View>

                <AddFriendModal
                    visible={showAddFriend}
                    onClose={() => setShowAddFriend(false)}
                    refreshFriends={() => setRefreshing(prev => !prev)}
                />

                <FriendRequestsModal
                    visible={showRequests}
                    onClose={() => setShowRequests(false)}
                    refreshFriends={() => setRefreshing(prev => !prev)}
                />
            </View>
        </ScreenBackground>
    );
}