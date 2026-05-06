import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ActivityIndicator,
    FlatList,
    TouchableOpacity
} from 'react-native';
import {
    Search,
    User as UserIcon,
    Ghost,
    Clock,
    CheckCircle2,
    UserPlus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
    sendFriendRequest,
    searchUsers,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest
} from '../../service/friend';
import { useUserStore } from "../../store/useUserStore";
import { CustomModal } from './CustomModal';
import { useToast } from '../ui/ToastProvider';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type Props = {
    visible: boolean;
    onClose: () => void;
    refreshFriends: () => void;
};

export function AddFriendModal({ visible, onClose, refreshFriends }: Props) {
    const user = useUserStore((state) => state.user);
    const { showToast } = useToast() as ToastContextType;

    const [mode, setMode] = useState<'manual' | 'search'>('search');
    const [friendNameOrId, setFriendNameOrId] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const [sentRequests, setSentRequests] = useState<number[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<number[]>([]);

    useEffect(() => {
        if (visible && user) {
            fetchFriendshipContext();
        }
    }, [visible]);

    async function fetchFriendshipContext() {
        try {
            const [received, sent] = await Promise.all([
                getReceivedFriendRequests(Number(user?.id)),
                getSentFriendRequests(Number(user?.id)),
            ]);
            setReceivedRequests(received.map((r: any) => Number(r.id)));
            setSentRequests(sent.map((r: any) => Number(r.id)));
        } catch (error) {
            console.error("Erro ao sincronizar amizades:", error);
        }
    }

    useEffect(() => {
        if (mode === 'search' && searchValue.trim().length > 2) {
            const delayDebounceFn = setTimeout(() => {
                handleSearch();
            }, 600);
            return () => clearTimeout(delayDebounceFn);
        } else if (searchValue.length === 0) {
            setResults([]);
        }
    }, [searchValue, mode]);

    const handleClose = () => {
        setFriendNameOrId('');
        setResults([]);
        setSearchValue('');
        onClose();
    };

    async function handleSearch() {
        try {
            setSearching(true);
            const response = await searchUsers(searchValue);

            const filtered = (response.data || []).filter(
                (item: any) => Number(item.id) !== Number(user?.id)
            );

            setResults(filtered);
        } catch (err) {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }

    async function handleAddFriend(userId: number) {
        try {
            setLoading(true);
            await sendFriendRequest(String(userId));
            setSentRequests(prev => [...prev, userId]);
            showToast('SOLICITAÇÃO ENVIADA!', 'success');
            refreshFriends();
        } catch (error) {
            showToast('ERRO AO ENVIAR SOLICITAÇÃO', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleAcceptFriend(targetId: number) {
        try {
            setLoading(true);
            await acceptFriendRequest(targetId, Number(user?.id));

            // Remove da lista de recebidos localmente para limpar a UI
            setReceivedRequests(prev => prev.filter(id => id !== targetId));

            showToast('CONVITE ACEITO!', 'success');
            refreshFriends();
            handleClose();
        } catch (error) {
            showToast('ERRO AO ACEITAR CONVITE', 'error');
        } finally {
            setLoading(false);
        }
    }

    const renderActionButton = (targetUserId: number) => {
        const id = Number(targetUserId);

        if (sentRequests.includes(id)) {
            return (
                <View className="bg-slate-100 px-3 py-2 rounded-xl flex-row items-center gap-1 border border-slate-200">
                    <Clock size={12} color="#94a3b8" />
                    <Text className="text-slate-500 font-bold text-[10px] uppercase">Pendente</Text>
                </View>
            );
        }

        if (receivedRequests.includes(id)) {
            return (
                <TouchableOpacity
                    onPress={() => handleAcceptFriend(id)}
                    className="bg-[#007bff] px-3 py-2 rounded-xl flex-row items-center gap-1 active:bg-[#0069d9]"
                >
                    <CheckCircle2 size={12} color="white" />
                    <Text className="text-white font-bold text-[10px] uppercase">Aceitar</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                onPress={() => handleAddFriend(id)}
                disabled={loading}
                className="bg-slate-950 px-4 py-2 rounded-xl active:bg-slate-800"
            >
                <Text className="text-white font-bold text-[10px] uppercase">Adicionar</Text>
            </TouchableOpacity>
        );
    };

    const EmptySearch = () => (
        <View className="items-center justify-center py-12">
            <Ghost size={40} color="#cbd5e1" />
            <Text className="text-slate-500 mt-2 font-medium">Nenhum jogador encontrado</Text>
        </View>
    );

    return (
        <CustomModal
            isOpen={visible}
            onClose={handleClose}
            title="Adicionar Amigo"
            subtitle="Encontre seus parceiros de treino"
        >
            {mode === 'manual' ? (
                <View>
                    <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">NOME OU ID</Text>
                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 mb-6">
                        <UserIcon size={18} color="#94a3b8" />
                        <TextInput
                            placeholder="Ex: Player#123"
                            placeholderTextColor="#94a3b8"
                            value={friendNameOrId}
                            onChangeText={setFriendNameOrId}
                            className="flex-1 text-slate-950 ml-3 font-medium"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => handleAddFriend(Number(friendNameOrId))}
                        disabled={loading || !friendNameOrId.trim()}
                    >
                        <LinearGradient
                            colors={['#2563eb', '#3b82f6']}
                            className={`py-4 rounded-2xl flex-row justify-center items-center gap-2 ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? <ActivityIndicator color="white" /> : (
                                <>
                                    <UserPlus size={18} color="white" />
                                    <Text className="text-white font-bold uppercase">Enviar Convite</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="h-80">
                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 py-1 mb-4">
                        <Search size={18} color={searching ? "#007bff" : "#94a3b8"} />
                        <TextInput
                            placeholder="Buscar jogadores..."
                            placeholderTextColor="#94a3b8"
                            value={searchValue}
                            onChangeText={setSearchValue}
                            className="flex-1 px-3 py-3 text-slate-950 font-medium"
                        />
                        {searching && <ActivityIndicator size="small" color="#007bff" />}
                    </View>

                    <FlatList
                        data={results}
                        keyExtractor={(item) => String(item.id)}
                        ListEmptyComponent={<EmptySearch />}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl mb-2 border border-slate-200">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
                                        <UserIcon size={18} color="#94a3b8" />
                                    </View>
                                    <View>
                                        <Text className="text-slate-950 font-bold">{item.username}</Text>
                                        <Text className="text-slate-600 text-[10px] uppercase font-medium">Nível {item.level || 0}</Text>
                                    </View>
                                </View>

                                {renderActionButton(item.id)}
                            </View>
                        )}
                    />
                </View>
            )}
        </CustomModal>
    );
}