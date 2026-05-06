import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    TouchableOpacity,
} from "react-native";
import {
    User,
    Edit,
    Camera,
    LogOut
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";

import { useUserStore } from "../../store/useUserStore";
import { uploadProfileImage } from "../../service/uploadMedia";
import { ScreenBackground } from "../../components/ui/ScreenBackground";
import { useAuthStore } from "../../store/useAuthStore";
import ProfileUpdate from "../../components/modal/ProfileUpdate";
import TrainingTab from "./Tabs/TrainingTab";

export default function ProfileScreen() {
    const user = useUserStore(state => state.user);
    const setToken = useAuthStore((state) => state.setToken);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);

    const pickMedia = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
            if (result.canceled) return;
            const asset = result.assets[0];
            const formData = new FormData();
            formData.append("file", { uri: asset.uri, name: "avatar.jpg", type: "image/jpeg" } as any);
            const res = await uploadProfileImage(formData);
            useUserStore.getState().updateUser({ avatar: res.url });
        } catch (error) {
            console.error(error);
        }
    };

    const xpStats = useMemo(() => {
        const level = user?.level || 1;
        const currentXp = user?.xp || 0;
        const getXpRequired = (lvl: number) => Math.floor(100 * Math.pow(1.5, lvl - 1));
        const xpToNext = getXpRequired(level);
        return { xpToNext, progress: Math.min(currentXp / xpToNext, 1), currentXp };
    }, [user?.xp, user?.level]);

    const handleLogout = () => {
        setToken('');
    };

    return (
        <ScreenBackground>
            <View style={{ flex: 1, zIndex: 10 }}>
                {/* Cabeçalho do Perfil - Integrado ao fundo escuro */}
                <View className="pt-14 pb-8 px-6">
                    <View className="flex-row items-center gap-5">
                        <View className="relative">
                            <View className="w-24 h-24 rounded-3xl border border-white/20 overflow-hidden bg-white/5 items-center justify-center">
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} className="w-full h-full" />
                                ) : (
                                    <User color="#9CA3AF" size={40} />
                                )}
                            </View>

                            {/* Botão de câmera branco para manter o visual clean */}
                            <Pressable
                                onPress={pickMedia}
                                className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm"
                            >
                                <Camera color="#1D2D3E" size={16} />
                            </Pressable>
                        </View>

                        <View className="flex-1">
                            <Text className="text-white text-2xl font-black tracking-tight">
                                {user?.username.split('#')[0]}
                                <Text className="text-white/40 font-medium">#{user?.username.split('#')[1]}</Text>
                            </Text>
                            <Text className="text-white/60 text-xs mt-1 leading-4" numberOfLines={2}>
                                {user?.bio || "Defina sua bio no botão editar..."}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setEditModalOpen(true)}
                                className="self-start flex-row items-center gap-1.5 mt-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
                            >
                                <Edit color="#FFFFFF" size={12} />
                                <Text className="text-white text-xs font-bold">Editar Perfil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Progress Bar do Nível */}
                    <View className="mt-8">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Nível {user?.level}</Text>
                            <Text className="text-white text-[10px] font-bold">{xpStats.currentXp} / {xpStats.xpToNext} XP</Text>
                        </View>
                        <View
                            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
                        >
                            <MotiView
                                from={{ width: 0 }}
                                animate={{ width: containerWidth * xpStats.progress }}
                                transition={{ type: 'timing', duration: 1000 }}
                                className="h-full bg-[#0073B9]"
                            />
                        </View>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                >
                    <TrainingTab />

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-6 flex-row items-center justify-center bg-white py-4 rounded-2xl border border-gray-200 shadow-sm"
                    >
                        <LogOut size={18} color="#EF4444" />
                        <Text className="ml-2 text-[#EF4444] font-bold uppercase tracking-wider text-xs">Sair da Conta</Text>
                    </TouchableOpacity>
                </ScrollView>

                <ProfileUpdate visible={editModalOpen} onClose={() => setEditModalOpen(false)} />
            </View>
        </ScreenBackground>
    );
}