import { Modal, View, Text, Pressable, FlatList, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Clock, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { acceptFriendRequest, getReceivedFriendRequests, getSentFriendRequests, removeFriend } from '../../service/friend';
import { useUserStore } from '../../store/useUserStore';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useToast } from '../ui/ToastProvider';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type Props = {
    visible: boolean;
    onClose: () => void;
    refreshFriends: () => void;
};

export function FriendRequestsModal({ visible, onClose, refreshFriends }: Props) {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const { showToast } = useToast() as ToastContextType;
    const [loading, setLoading] = useState(false);
    const user = useUserStore(state => state.user);

    const friendsReceived = useFriendsStore(state => state.friendsReceived);
    const setFriendsReceived = useFriendsStore(state => state.setFriendsReceived);
    const removeFriendReceived = useFriendsStore(state => state.removeFriendReceived);
    const friendsSent = useFriendsStore(state => state.friendsSent);
    const setFriendsSent = useFriendsStore(state => state.setFriendsSent);


    async function loadRequests() {
        try {
            setLoading(true);
            const [receivedData, sentData] = await Promise.all([
                getReceivedFriendRequests(Number(user?.id)),
                getSentFriendRequests(Number(user?.id)),
            ]);

            setFriendsReceived(receivedData);
            setFriendsSent(sentData);
        } finally {
            setLoading(false);
        }
    }

    async function handleAccept(id: number) {
        await acceptFriendRequest(id, user ? Number(user.id) : 0)
            .then(() => {
                setTimeout(() => {
                    showToast('SOLICITAÇÃO DE AMIZADE ACEITA', 'success');
                }, 400);
                removeFriendReceived(id);
                refreshFriends();
                onClose()
            })
            .catch((error) => {
                console.error('Error:', error);
                setTimeout(() => {
                    showToast('ERRO AO ACEITAR SOLICITAÇÃO', 'error');
                }, 400);
                onClose()
            });
    }

    async function handleReject(id: number) {
        await removeFriend(id, user ? Number(user.id) : 0)
            .then(() => {
                removeFriendReceived(id);
                setTimeout(() => {
                    showToast('SOLICITAÇÃO DE AMIZADE REJEITADA', 'success');
                }, 400);
                refreshFriends();
                onClose()
            })
            .catch((error) => {
                console.error('Error:', error);
                setTimeout(() => {
                    showToast('ERRO AO REJEITAR SOLICITAÇÃO', 'error');
                }, 400);
                onClose()
            });

    }

    useEffect(() => {
        if (!visible) return

        loadRequests();
        setActiveTab('received');
    }, [visible, user]);

    const data = activeTab === 'received' ? friendsReceived : friendsSent;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/60 justify-end">

                {/* Container principal agora com fundo claro (slate-50) em vez de escuro */}
                <View className="bg-slate-50 rounded-t-3xl overflow-hidden h-[90%] shadow-lg">

                    {/* Cabeçalho Limpo */}
                    <View className="flex-row justify-between items-center p-5 bg-white border-b border-slate-200">
                        <Text className="text-slate-950 font-bold text-lg">
                            Solicitações de amizade
                        </Text>

                        <View className="flex-row gap-4">
                            <Pressable onPress={loadRequests} className="active:opacity-50">
                                <RefreshCw size={20} color="#64748b" />
                            </Pressable>

                            <Pressable onPress={onClose} className="active:opacity-50">
                                <X size={22} color="#64748b" />
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-row gap-2 px-5 py-4 bg-white border-b border-slate-200 mb-2">
                        <Pressable
                            onPress={() => setActiveTab('received')}
                            className={`flex-1 py-3 rounded-xl border ${activeTab === 'received'
                                ? 'bg-[#007bff] border-[#007bff]'
                                : 'bg-slate-100 border-slate-200'
                                }`}
                        >
                            <Text
                                className={`text-center font-bold uppercase text-[11px] ${activeTab === 'received'
                                    ? 'text-white'
                                    : 'text-slate-500'
                                    }`}
                            >
                                Recebidas ({friendsReceived.length})
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab('sent')}
                            className={`flex-1 py-3 rounded-xl border ${activeTab === 'sent'
                                ? 'bg-[#007bff] border-[#007bff]'
                                : 'bg-slate-100 border-slate-200'
                                }`}
                        >
                            <Text
                                className={`text-center font-bold uppercase text-[11px] ${activeTab === 'sent'
                                    ? 'text-white'
                                    : 'text-slate-500'
                                    }`}
                            >
                                Enviadas ({friendsSent.length})
                            </Text>
                        </Pressable>
                    </View>

                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#007bff" />
                        </View>
                    ) : data.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Clock size={40} color="#cbd5e1" />
                            <Text className="text-slate-500 font-medium text-center mt-3">
                                {activeTab === 'received'
                                    ? 'Nenhuma solicitação recebida.'
                                    : 'Nenhuma solicitação enviada.'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ padding: 20, gap: 12 }}
                            renderItem={({ item }) => (
                                /* Cada item da lista é um "cartão branco" */
                                <View className="flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
                                    <View className="flex-1">
                                        <Text className="text-slate-950 font-bold text-base">
                                            {item.username}
                                        </Text>

                                        {activeTab === 'sent' && (
                                            <Text className="text-slate-500 text-xs font-medium mt-1">
                                                Aguardando resposta...
                                            </Text>
                                        )}
                                    </View>

                                    {activeTab === 'received' && (
                                        <View className="flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            {/* Botão de recusar neutro e limpo */}
                                            <Pressable
                                                onPress={() => handleReject(item.id)}
                                                className="flex-1 md:flex-none flex-row items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 active:bg-slate-200"
                                            >
                                                <X size={14} color="#64748b" />
                                                <Text className="text-slate-600 text-xs font-bold uppercase">
                                                    Recusar
                                                </Text>
                                            </Pressable>

                                            {/* Botão de aceitar como principal na cor azul */}
                                            <Pressable
                                                onPress={() => handleAccept(item.id)}
                                                className="flex-1 md:flex-none flex-row items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-[#007bff] active:bg-[#0069d9]"
                                            >
                                                <Check size={14} color="white" />
                                                <Text className="text-white text-xs font-bold uppercase">
                                                    Aceitar
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
