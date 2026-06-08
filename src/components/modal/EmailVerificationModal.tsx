import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { emailConfirmation, sendEmailVerification } from '../../service/auth';

interface Props {
    visible: boolean;
    email: string;
    loading?: boolean;
    onConfirm: (code: string) => void;
    onResend: () => void;
    onClose?: () => void;
}

type ModalStep = 'ask_2fa' | 'verify_code';

export function EmailVerificationModal({
    visible,
    email,
    loading,
    onClose,
}: Props) {
    const [step, setStep] = useState<ModalStep>('ask_2fa');
    const [code, setCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);

    // Reseta o estado do modal sempre que ele for aberto
    useEffect(() => {
        if (visible) {
            setStep('ask_2fa');
            setCode('');
        }
    }, [visible]);

    async function handleEmailConfirmation() {
        try {
            const data = {
                email: encodeURIComponent(email),
                code: code
            };

            await emailConfirmation(data)
                .then(response => {
                    onClose?.();
                })
                .catch(error => {
                    console.error(error);
                });

        } catch (e) {
            console.error(e);
        }
    }

    async function handleSendEmailVerification() {
        try {
            setIsSendingCode(true);
            await sendEmailVerification(encodeURIComponent(email));
        } catch (e) {
            console.error(e);
        } finally {
            setIsSendingCode(false);
        }
    }

    // Função que é chamada quando o usuário aceita o 2FA
    async function handleEnable2FA() {
        await handleSendEmailVerification();
        setStep('verify_code');
    }

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <BlurView intensity={90} tint="dark" className="flex-1 justify-center px-6">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View className="bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100">

                        {/* Botão fechar principal */}
                        <TouchableOpacity
                            onPress={onClose}
                            className="absolute right-5 top-5 z-10 bg-slate-100 p-1.5 rounded-full"
                            hitSlop={10}
                        >
                            <Ionicons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>

                        {/* RENDERIZAÇÃO CONDICIONAL DOS PASSOS */}
                        {step === 'ask_2fa' ? (
                            // --- PASSO 1: PERGUNTA SE QUER ATIVAR 2FA ---
                            <>
                                <View className="items-center mb-6 mt-2">
                                    <LinearGradient
                                        colors={['#007bff', '#0056b3']}
                                        className="w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
                                    >
                                        <Ionicons name="shield-checkmark-outline" size={32} color="#fff" />
                                    </LinearGradient>

                                    <Text className="text-[#1D2D3E] text-2xl font-black tracking-tight text-center">
                                        Mais segurança para o seu treino
                                    </Text>

                                    <Text className="text-slate-500 text-sm text-center mt-3 font-medium px-2 leading-5">
                                        Deseja ativar a verificação de duas etapas para proteger ainda mais a sua conta de aventureiro?
                                    </Text>
                                </View>

                                <View className="gap-3">
                                    <LinearGradient
                                        colors={['#007bff', '#0056b3']}
                                        className="rounded-2xl shadow-md shadow-blue-500/20"
                                    >
                                        <TouchableOpacity
                                            disabled={isSendingCode}
                                            onPress={handleEnable2FA}
                                            className="py-4.5 active:opacity-90 flex-row justify-center items-center h-12"
                                            style={{ opacity: isSendingCode ? 0.7 : 1 }}
                                        >
                                            {isSendingCode ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text className="text-white text-center font-bold uppercase text-xs tracking-wider">
                                                    Sim, quero ativar
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </LinearGradient>

                                    <TouchableOpacity
                                        onPress={onClose}
                                        disabled={isSendingCode}
                                        className="py-3.5 bg-slate-50 rounded-2xl border border-slate-200 active:bg-slate-100"
                                    >
                                        <Text className="text-center text-slate-500 font-bold uppercase text-xs tracking-wider">
                                            Não, pular por enquanto
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            // --- PASSO 2: INSERIR O CÓDIGO ---
                            <>
                                <View className="items-center mb-6 mt-2">
                                    <LinearGradient
                                        colors={['#007bff', '#0056b3']}
                                        className="w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
                                    >
                                        <Ionicons name="mail-outline" size={32} color="#fff" />
                                    </LinearGradient>

                                    <Text className="text-[#1D2D3E] text-2xl font-black tracking-tight">
                                        Ative sua conta
                                    </Text>

                                    <Text className="text-slate-500 text-sm text-center mt-2 font-medium px-2 leading-5">
                                        Enviamos um código de 6 dígitos para o e-mail{'\n'}
                                        <Text className="text-[#007bff] font-bold">{email}</Text>
                                    </Text>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1 tracking-wider">
                                        Código de verificação
                                    </Text>

                                    <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-4 border border-slate-200">
                                        <Ionicons name="key-outline" size={20} color="#94a3b8" />
                                        <TextInput
                                            value={code}
                                            onChangeText={setCode}
                                            keyboardType="numeric"
                                            maxLength={6}
                                            placeholder="000000"
                                            placeholderTextColor="#94a3b8"
                                            className="ml-3 flex-1 text-slate-950 text-xl font-bold tracking-[10px]"
                                            style={{ paddingLeft: Platform.OS === 'ios' ? 10 : 0 }}
                                        />
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={['#007bff', '#0056b3']}
                                    className="rounded-2xl mb-4 shadow-md shadow-blue-500/20"
                                >
                                    <TouchableOpacity
                                        disabled={loading || code.length < 6}
                                        onPress={handleEmailConfirmation}
                                        className="py-4.5 active:opacity-90 h-12 justify-center"
                                        style={{ opacity: (loading || code.length < 6) ? 0.6 : 1 }}
                                    >
                                        <Text className="text-white text-center font-bold uppercase text-xs tracking-wider">
                                            {loading ? 'Verificando...' : 'Confirmar código'}
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>

                                <TouchableOpacity
                                    onPress={handleSendEmailVerification}
                                    className="py-2"
                                >
                                    <Text className="text-center text-[#007bff] text-sm font-semibold">
                                        Não recebeu? Reenviar código
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}