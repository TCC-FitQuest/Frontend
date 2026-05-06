import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';

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

            await deleteProtocols(protocolToDelete.id)
                .then(() => {
                    removeTrainingProtocol(protocolToDelete.id)
                    showToast('PROTOCOLO EXCLUÍDO COM SUCESSO!', 'success');
                })
                .catch((err) => {
                    console.error('Erro ao deletar protocolo', err);
                    showToast('ERRO AO EXCLUIR PROTOCOLO. TENTE NOVAMENTE.', 'error');
                })
                .finally(() => {
                    setIsDeleting(false)
                    onClose()
                });

        } catch (err) {
            console.error('Erro ao deletar protocolo', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <CustomModal
            isOpen={visible}
            onClose={onClose}
            showCloseButton={false}
            title="Excluir protocolo"
        >
            <View>
                {/* Texto adaptado para o fundo branco do novo CustomModal */}
                <Text className="text-slate-600 mb-8 text-center text-base">
                    Tem certeza que deseja excluir o protocolo{' '}
                    <Text className="text-slate-950 font-bold">
                        {protocolToDelete?.name}
                    </Text>
                    ?{'\n'}Essa ação não pode ser desfeita.
                </Text>

                <View className="flex-row gap-3">
                    {/* Botão Cancelar neutro e limpo */}
                    <Pressable
                        disabled={isDeleting}
                        onPress={() => onClose()}
                        className="flex-1 py-3.5 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center active:bg-slate-200"
                    >
                        <Text className="text-slate-600 font-bold uppercase text-xs">
                            Cancelar
                        </Text>
                    </Pressable>

                    {/* Botão de Excluir em destaque vermelho */}
                    <Pressable
                        disabled={isDeleting}
                        onPress={handleDeleteProtocol}
                        className="flex-1 py-3.5 rounded-xl bg-red-600 items-center justify-center active:bg-red-700"
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text className="text-white font-bold uppercase text-xs">
                                Excluir
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </CustomModal>
    )
}