import React, { useState, useMemo } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { MotiView } from 'moti'
import { useUserStore } from '../../store/useUserStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/useAuthStore'
import { UserType } from '../../models/UserModel'
import { LogOut } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

export function Header() {
    const user = useUserStore((state) => state.user)
    const insets = useSafeAreaInsets()
    const [containerWidth, setContainerWidth] = useState(0)
    const setUser = useUserStore((state) => state.setUser as (user: UserType | null) => void)
    const setToken = useAuthStore((state) => state.setToken)

    const xpStats = useMemo(() => {
        const level = user?.level || 1
        const currentXp = user?.xp || 0

        const getXpRequired = (lvl: number) => {
            const baseXp = 100
            const factor = 1.5
            return Math.floor(baseXp * Math.pow(factor, lvl - 1))
        }

        const xpToNext = getXpRequired(level)
        const progress = Math.min(currentXp / xpToNext, 1)

        return {
            currentXp,
            xpToNext,
            progress
        }
    }, [user?.xp, user?.level])

    const logout = () => {
        setUser(null)
        setToken('')
    }

    const renderUsername = () => {
        const parts = user?.username?.split('#') || ['Convidado']
        return (
            <Text className="text-white font-bold text-base tracking-tight">
                {parts[0]}
                {parts[1] && <Text className="text-xs text-white/50 font-normal">#{parts[1]}</Text>}
            </Text>
        )
    }

    return (
        <View style={{ paddingTop: insets.top }}>

            <View className="px-5 py-4 flex-row items-center justify-between">

                <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full border-2 border-[#0073B9] overflow-hidden bg-white/10 items-center justify-center shadow-sm">
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} className="w-full h-full" />
                        ) : (
                            <Text className="text-white font-black text-lg">{user?.username?.charAt(0).toUpperCase()}</Text>
                        )}
                    </View>

                    <View className="ml-3 flex-1 max-w-[220px]">
                        {renderUsername()}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={logout}
                    className="p-2.5 bg-white/5 rounded-full border border-white/10 ml-2"
                >
                    <LogOut color="#FFFFFF" size={18} />
                </TouchableOpacity>

            </View>
            <View className="h-[1px] bg-white/10 w-full" />
        </View>
    )
}