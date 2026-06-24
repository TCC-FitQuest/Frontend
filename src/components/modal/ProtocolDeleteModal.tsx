import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { CustomModal } from "./CustomModal";
import { useToast } from '../ui/ToastProvider';
import { deleteProtocols } from '../../service/trainingProtocolService';
import { useTrainingProtocolStore } from '../../store/useTrainingProtocol';

interface ProtocolDeleteModalProps {
    visible: boolean
    onClose: () => void
    protocolToDelete: { id: any; name: string } | null
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ProtocolDeleteModal({
    visible,
    onClose,
    protocolToDelete
}: ProtocolDeleteModalProps) {
    const { showToast } = useToast() as ToastContextType;
    const [isDeleting, setIsDeleting] = useState(false);

    const removeTrainingProtocol = useTrainingProtocolStore((state) => state.removeTrainingProtocol)

    const handleDeleteProtocol = async () => {
        if (!protocolToDelete) return;

        try {
            setIsDeleting(true);

            await deleteProtocols(protocolToDelete.id);
            removeTrainingProtocol(protocolToDelete.id);

            showToast('Protocolo excluído com sucesso!', 'success');
            onClose();
        } catch (err) {
            console.error('Erro ao deletar protocolo', err);
            showToast('Erro ao excluir protocolo. Tente novamente.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <CustomModal
            isOpen={visible}
            onClose={onClose}
            showCloseButton={false}
            title="Excluir Protocolo"
        >
            <View className="items-center pb-2">
                <View className="w-16 h-16 rounded-full bg-red-50 border border-red-100 items-center justify-center mb-4 shadow-sm">
                    <Trash2 size={28} color="#EF4444" />
                </View>

                <Text className="text-gray-500 text-center text-sm mb-2 font-medium">
                    Tem certeza que deseja excluir permanentemente o protocolo:
                </Text>

                <Text className="text-[#1D2D3E] text-xl font-black text-center leading-6 px-4">
                    "{protocolToDelete?.name}"
                </Text>

                <View className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 mt-4 mb-6 w-full">
                    <Text className="text-gray-400 text-xs text-center font-bold uppercase tracking-wider">
                        ⚠️ Essa ação não pode ser desfeita
                    </Text>
                </View>

                <View className="flex-row gap-3 w-full">
                    <Pressable
                        disabled={isDeleting}
                        onPress={() => onClose()}
                        className="flex-1 py-3.5 rounded-xl bg-gray-100 border border-gray-200 items-center justify-center active:bg-gray-200"
                    >
                        <Text className="text-gray-600 font-bold uppercase tracking-wider text-xs">
                            Cancelar
                        </Text>
                    </Pressable>

                    <Pressable
                        disabled={isDeleting}
                        onPress={handleDeleteProtocol}
                        className="flex-1 py-3.5 rounded-xl bg-[#EF4444] border border-[#DC2626] items-center justify-center shadow-sm active:bg-[#DC2626]"
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text className="text-white font-bold uppercase tracking-wider text-xs">
                                Sim, Excluir
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </CustomModal>
    )
}