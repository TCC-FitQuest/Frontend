import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'

import { singupAPI, loginAPI } from '../../service/auth'
import { useUserStore } from '../../store/useUserStore'
import { NavigationTypes } from '../../navigation/types'
import { UserRole } from '../../models/UserModel'
import { EmailVerificationModal } from '../../components/modal/EmailVerificationModal'
import { GymLoading } from '../../components/ui/GymLoading'

import { useAuthStore } from '../../store/useAuthStore'
import { ScreenBackground } from '../../components/ui/ScreenBackground'

const MAX_NAME = 12
const MAX_EMAIL = 100
const MAX_PASSWORD = 50

function getPasswordStrength(password: string) {
    let score = 0

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { label: 'Fraca', color: '#ef4444' }
    if (score === 2) return { label: 'Média', color: '#f59e0b' }
    if (score === 3) return { label: 'Boa', color: '#007bff' }

    return { label: 'Forte', color: '#22c55e' }
}

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<NavigationTypes>>()
    const setUser = useUserStore((s) => s.setUser)
    const setToken = useAuthStore((s) => s.setToken)

    const [isSignUp, setIsSignUp] = useState(false)
    const [role, setRole] = useState<UserRole>('user')
    const [loading, setLoading] = useState(false)
    const [showVerification, setShowVerification] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    })

    function handleChange(field: string, value: string) {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    async function handleSubmit() {
        if (loading) return

        try {
            setLoading(true)

            if (isSignUp) {
                if (form.name.length < 3) {
                    console.log('Nome muito curto')
                    return
                }

                if (form.password.length < 8) {
                    console.log('Senha muito fraca')
                    return
                }

                const payload = {
                    username: form.name,
                    email: form.email.trim(),
                    password: form.password,
                    type: role,
                    avatar: ""
                }

                await singupAPI(payload)

                setShowVerification(true)

                handleChange('password', '')
                setIsSignUp(false)
            } else {
                const response = await loginAPI({
                    email: form.email.trim(),
                    password: form.password
                })

                setUser(response)

                await SecureStore.setItemAsync(
                    'token',
                    response.access_token
                )
                setToken(response.access_token)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = getPasswordStrength(form.password)

    return (
        <ScreenBackground>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <EmailVerificationModal
                    visible={showVerification}
                    email={form.email}
                    loading={loading}
                    onConfirm={async () => {
                        setShowVerification(false)
                        navigation.navigate('Home')
                    }}
                    onResend={async () => { }}
                    onClose={() => setShowVerification(false)}
                />

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View className="flex-1 justify-center px-6 py-12">

                            <View className="items-center mb-8">
                                <Image
                                    source={require('../../../assets/icon.png')}
                                    className="w-32 h-32 rounded-3xl mb-4"
                                    resizeMode="contain"
                                />
                                <Text className="text-slate-400 text-sm mt-1 font-medium">
                                    Transforme seu treino em aventura
                                </Text>
                            </View>


                            <View className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100">
                                {loading ? (
                                    <View className="py-12">
                                        <GymLoading />
                                    </View>
                                ) : (
                                    <>
                                        <View className="flex-row gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <TouchableOpacity
                                                onPress={() => setIsSignUp(false)}
                                                className={`flex-1 py-3 rounded-xl shadow-sm  ${!isSignUp ? 'bg-white border border-slate-200' : 'bg-slate-100 border border-slate-100'}`}
                                            >
                                                <Text className={`text-center font-bold  uppercase text-[11px]  ${!isSignUp ? 'text-[#007bff]' : 'text-slate-500'}`}>
                                                    Login
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setIsSignUp(true)}
                                                className={`flex-1 py-3 rounded-xl shadow-sm ${isSignUp ? 'bg-white border border-slate-200' : 'bg-slate-100 border border-slate-100'}`}
                                            >
                                                <Text className={`text-center font-bold uppercase text-[11px] ${isSignUp ? 'text-[#007bff]' : 'text-slate-500 '}`}>
                                                    Criar Conta
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {isSignUp && (
                                            <View className="mb-4">
                                                <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                                    Nome de Aventureiro
                                                </Text>
                                                <Input
                                                    icon="person-outline"
                                                    placeholder="Seu nome"
                                                    maxLength={MAX_NAME}
                                                    value={form.name}
                                                    onChangeText={(t: string) => handleChange('name', t)}
                                                />
                                                <Text className="text-slate-400 text-[10px] mt-1.5 text-right font-medium">
                                                    {form.name.length}/{MAX_NAME}
                                                </Text>
                                            </View>
                                        )}

                                        <View className="mb-4">
                                            <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                                Email
                                            </Text>
                                            <Input
                                                icon="mail-outline"
                                                placeholder="seu@email.com"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                maxLength={MAX_EMAIL}
                                                value={form.email}
                                                onChangeText={(t: string) => handleChange('email', t)}
                                            />
                                        </View>

                                        <View className="mb-8">
                                            <Text className="text-slate-600 text-[10px] font-bold uppercase mb-2 ml-1">
                                                Senha
                                            </Text>
                                            <Input
                                                icon="lock-closed-outline"
                                                placeholder="••••••••"
                                                secureTextEntry={!showPassword}
                                                maxLength={MAX_PASSWORD}
                                                value={form.password}
                                                onChangeText={(t: string) => handleChange('password', t)}
                                                rightIcon={
                                                    <Ionicons
                                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                        size={20}
                                                        color="#94a3b8"
                                                        onPress={() => setShowPassword(!showPassword)}
                                                    />
                                                }
                                            />

                                            {form.password.length > 0 && isSignUp && (
                                                <View className="mt-3">
                                                    <Text className="text-[10px] font-bold uppercase mb-1.5" style={{ color: passwordStrength.color }}>
                                                        Nível de Segurança: {passwordStrength.label}
                                                    </Text>
                                                    <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <View
                                                            style={{
                                                                width: `${Math.min(form.password.length * 10, 100)}%`,
                                                                backgroundColor: passwordStrength.color
                                                            }}
                                                            className="h-full rounded-full"
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={loading}
                                            className="bg-[#007bff] py-4 rounded-2xl items-center active:bg-[#0069d9]"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-white text-center font-bold uppercase text-xs tracking-wider">
                                                {isSignUp ? 'Embarcar na Aventura' : 'Acessar Treino'}
                                            </Text>
                                        </TouchableOpacity>

                                        {isSignUp && (
                                            <Text className="text-slate-400 text-[10px] text-center mt-5 font-medium px-4">
                                                Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
                                            </Text>
                                        )}
                                    </>
                                )}
                            </View>

                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScreenBackground>
    )
}

function Input({ icon, rightIcon, ...props }: any) {
    return (
        <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200">
            <Ionicons
                name={icon}
                size={20}
                color="#94a3b8"
            />
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