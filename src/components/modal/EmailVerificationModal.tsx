import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
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

export function EmailVerificationModal({
    visible,
    email,
    loading,
    onClose,
}: Props) {
    const [code, setCode] = useState('');

    async function handleEmailConfirmation() {
        try {

            const data = {
                email: encodeURIComponent(email),
                code: code
            }

            await emailConfirmation(data)
                .then(respose => {
                    onClose?.()
                })
                .catch(error => {
                    console.error(error)
                })

        } catch (e) {
            console.error(e);
        }
    }


    async function handleSendEmailVerification() {
        try {

            sendEmailVerification(encodeURIComponent(email))



        } catch (e) {
            console.error(e);
        }
    }


    return (
        <Modal transparent animationType="fade" visible={visible}>
            <BlurView intensity={70} tint="dark" className="flex-1 justify-center px-6">

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View className="bg-slate-900 rounded-3xl p-6 border border-blue-500/30">
                        <TouchableOpacity
                            onPress={onClose}
                            className="absolute right-4 top-4 z-10"
                            hitSlop={10}
                        >
                            <Ionicons name="close" size={22} color="#94a3b8" />
                        </TouchableOpacity>
                        <View className="items-center mb-4">
                            <LinearGradient
                                colors={['#3b82f6', '#06b6d4']}
                                className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                            >
                                <Ionicons name="mail-outline" size={28} color="#fff" />
                            </LinearGradient>

                            <Text className="text-white text-xl font-bold">
                                Ative sua conta
                            </Text>

                            <Text className="text-slate-400 text-sm text-center mt-1">
                                Enviamos um código para{'\n'}
                                <Text className="text-blue-400">{email}</Text>
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-blue-300 text-sm mb-2">
                                Código de verificação
                            </Text>

                            <View className="flex-row items-center bg-slate-800 rounded-xl px-4 py-3 border border-blue-500/30">
                                <Ionicons name="key-outline" size={20} color="#60a5fa" />
                                <TextInput
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    placeholder="000000"
                                    placeholderTextColor="#64748b"
                                    className="ml-3 flex-1 text-white text-lg tracking-widest"
                                />
                            </View>
                        </View>

                        <LinearGradient
                            colors={['#3b82f6', '#06b6d4']}
                            className="rounded-xl mb-3"
                        >
                            <TouchableOpacity
                                disabled={loading || code.length < 3}
                                onPress={() => handleEmailConfirmation()}
                                className="py-4"
                            >
                                <Text className="text-white text-center font-bold">
                                    Confirmar código
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        <TouchableOpacity onPress={() => handleSendEmailVerification()}>
                            <Text className="text-center text-blue-400 text-sm">
                                Reenviar código
                            </Text>
                        </TouchableOpacity>

                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}
