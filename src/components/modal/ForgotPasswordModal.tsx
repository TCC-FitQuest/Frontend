import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { resetPassword, sendEmailResetPasswordRequest } from '../../service/auth';
import { useToast } from '../../components/ui/ToastProvider';

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function ForgotPasswordModal({ visible, onClose }: ForgotPasswordModalProps) {
    const { showToast } = useToast() as ToastContextType;

    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSendResetCode() {
        if (!email) {
            showToast('Por favor, insira seu e-mail.', 'error');
            return
        }

        setLoading(true)
        try {
            await sendEmailResetPasswordRequest({ email: email.trim() })
            showToast('Código enviado para o seu e-mail.', 'success');
            setStep('code')
        } catch (error) {
            console.error(error)
            showToast('Não foi possível enviar o código. Verifique o e-mail.', 'error');
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirmReset() {
        if (!code || !newPassword) {
            showToast('Preencha o código e a nova senha.', 'error');
            return
        }

        setLoading(true)
        try {
            await resetPassword({
                code: code.trim(),
                new_password: newPassword
            })

            showToast('Sua senha foi redefinida com sucesso!', 'success');
            handleClose()
        } catch (error) {
            console.error(error)
            showToast('Código inválido ou expirado.', 'error');
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        onClose()
        setTimeout(() => {
            setStep('email')
            setEmail('')
            setCode('')
            setNewPassword('')
        }, 300)
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="flex-1 justify-center px-6 bg-black/40">
                    <View className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100">

                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-slate-900 text-lg font-black">
                                {step === 'email' ? 'Recuperar Senha' : 'Nova Senha'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                className="bg-slate-100 p-1.5 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {step === 'email' ? (
                            <>
                                <Text className="text-slate-500 text-[11px] font-medium mb-5 px-1">
                                    Digite seu e-mail de cadastro abaixo para receber um código de recuperação.
                                </Text>
                                <View className="mb-6">
                                    <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                        E-mail
                                    </Text>
                                    <Input
                                        icon="mail-outline"
                                        placeholder="seu@email.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleSendResetCode}
                                    disabled={loading}
                                    className="bg-[#007bff] py-4 rounded-2xl items-center active:bg-[#0069d9]"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white font-bold uppercase text-xs tracking-wider">
                                            Enviar Código
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text className="text-slate-500 text-[11px] font-medium mb-5 px-1">
                                    Insira o código recebido no seu e-mail e defina a sua nova senha.
                                </Text>
                                <View className="mb-4">
                                    <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                        Código de Recuperação
                                    </Text>
                                    <Input
                                        icon="key-outline"
                                        placeholder="Ex: 123456"
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View className="mb-8">
                                    <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                        Nova Senha
                                    </Text>
                                    <Input
                                        icon="lock-closed-outline"
                                        placeholder="Sua nova senha"
                                        secureTextEntry={!showNewPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        rightIcon={
                                            <Ionicons
                                                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20} color="#94a3b8"
                                                onPress={() => setShowNewPassword(!showNewPassword)}
                                            />
                                        }
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleConfirmReset}
                                    disabled={loading}
                                    className="bg-[#007bff] py-4 rounded-2xl items-center active:bg-[#0069d9]"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white font-bold uppercase text-xs tracking-wider">
                                            Redefinir Senha
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

function Input({ icon, rightIcon, ...props }: any) {
    return (
        <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200">
            <Ionicons name={icon} size={20} color="#94a3b8" />
            <TextInput
                {...props}
                placeholderTextColor="#94a3b8"
                className="ml-3 flex-1 text-slate-950 font-medium"
            />
            {rightIcon && (
                <View className="ml-2">
                    {rightIcon}
                </View>
            )}
        </View>
    )
}