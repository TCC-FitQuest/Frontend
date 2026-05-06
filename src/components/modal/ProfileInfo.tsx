import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator
} from "react-native";
import { User } from "lucide-react-native";

import { useToast } from "../ui/ToastProvider";
import {
    sendFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest
} from "../../service/friend";
import { useUserStore } from "../../store/useUserStore";

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface RankedUser {
    id: number;
    username: string;
    avatar: string | null;
    level: number;
    xp: number;
    position?: number;
}

interface ProfileInfoProps {
    visible: boolean;
    onClose: () => void;
    selectedUser: RankedUser;
}

export default function ProfileInfo({ visible, onClose, selectedUser }: ProfileInfoProps) {
    const user = useUserStore((state) => state.user);
    const { showToast } = useToast() as ToastContextType;

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'none' | 'sent' | 'received' | 'self'>('none');

    useEffect(() => {
        if (visible && selectedUser && user) {
            checkFriendshipStatus();
        }
    }, [visible, selectedUser, user]);

    async function checkFriendshipStatus() {
        if (Number(user?.id) === Number(selectedUser.id)) {
            setStatus('self');
            return;
        }

        try {
            setLoading(true);
            const [receivedData, sentData] = await Promise.all([
                getReceivedFriendRequests(Number(user?.id)),
                getSentFriendRequests(Number(user?.id)),
            ]);

            console.log(receivedData, sentData);

            const alreadySent = sentData.some((req: any) => Number(req.id) === Number(selectedUser.id));
            if (alreadySent) {
                setStatus('sent');
                return;
            }

            const alreadyReceived = receivedData.some((req: any) => Number(req.id) === Number(selectedUser.id));
            if (alreadyReceived) {
                setStatus('received');
                return;
            }

            setStatus('none');

        } catch (error) {
            console.error("Erro ao carregar status de amizade:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleFriendRequest(userId: number) {
        try {
            setLoading(true);
            await sendFriendRequest(String(userId));
            setStatus('sent');

            showToast('SOLICITAÇÃO ENVIADA!', 'success');
        } catch (error) {
            showToast('ERRO AO ENVIAR SOLICITAÇÃO', 'error');
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

    const renderButton = () => {
        switch (status) {
            case 'self':
                return (
                    <View className="bg-slate-800 w-full py-4 rounded-2xl items-center border border-slate-700">
                        <Text className="text-slate-400 font-black uppercase">Seu Perfil</Text>
                    </View>
                );
            case 'sent':
                return (
                    <View className="bg-slate-700 w-full py-4 rounded-2xl items-center opacity-60">
                        <Text className="text-white font-black uppercase">Solicitação Pendente</Text>
                    </View>
                );
            case 'received':
                return (
                    <TouchableOpacity
                        className="bg-blue-600 w-full py-4 rounded-2xl items-center"
                        onPress={() => handleAccept(selectedUser.id)}
                    >
                        <Text className="text-white font-black uppercase">Aceitar Convite</Text>
                    </TouchableOpacity>
                );
            default:
                return (
                    <TouchableOpacity
                        onPress={() => handleFriendRequest(selectedUser.id)}
                        className="bg-amber-500 w-full py-4 rounded-2xl items-center shadow-lg active:bg-amber-600"
                    >
                        <Text className="text-black font-black uppercase tracking-widest">
                            Enviar Convite
                        </Text>
                    </TouchableOpacity>
                );
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 items-center justify-center px-6">
                <View className="bg-slate-900 border border-slate-700 p-8 rounded-[32px] w-full items-center">
                    {loading ? (
                        <ActivityIndicator size="large" color="#EAB308" />
                    ) : (
                        selectedUser && (
                            <>
                                <View className="w-24 h-24 rounded-full bg-amber-500/20 items-center justify-center border-4 border-amber-500/30 mb-4">
                                    <User size={50} color="#EAB308" />
                                </View>

                                <Text className="text-white text-2xl font-black mb-1">
                                    {selectedUser.username.toUpperCase()}
                                </Text>

                                <View className="flex-row gap-4 mb-8">
                                    <View className="items-center">
                                        <Text className="text-slate-500 text-[10px] uppercase font-bold">Nível</Text>
                                        <Text className="text-white font-bold text-lg">{selectedUser.level}</Text>
                                    </View>
                                    <View className="w-[1px] bg-slate-700" />
                                    <View className="items-center">
                                        <Text className="text-slate-500 text-[10px] uppercase font-bold">Experiência</Text>
                                        <Text className="text-amber-500 font-bold text-lg">{selectedUser.xp} XP</Text>
                                    </View>
                                </View>

                                {renderButton()}

                                <TouchableOpacity onPress={onClose} className="mt-6">
                                    <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                                        Voltar
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )
                    )}
                </View>
            </View>
        </Modal>
    );
}