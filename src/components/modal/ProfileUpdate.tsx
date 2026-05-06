import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { User } from 'lucide-react-native';
import { CustomModal } from "./CustomModal";
import { useUserStore } from '../../store/useUserStore';
import { updateUser } from '../../service/userService';

interface ProfileUpdateProps {
    visible: boolean;
    onClose: () => void;
}

export default function ProfileUpdate({ visible, onClose }: ProfileUpdateProps) {
    const user = useUserStore(state => state.user);
    const updateUserStore = useUserStore(state => state.updateUser);

    const [displayName, setDisplayName] = useState(user?.username.split('#')[0] ?? "");
    const userIdTag = user?.username.split('#')[1] ?? "0000";
    const [bio, setBio] = useState(user?.bio ?? "");

    const handleUpdateProfile = () => {
        if (!user) return;
        const finalUsername = `${displayName}#${userIdTag}`;

        updateUser(user.id, { username: finalUsername, bio })
            .then(() => {
                updateUserStore({ username: finalUsername, bio });
                onClose();
            })
            .catch(err => console.error("Erro ao atualizar:", err));
    };

    return (
        <CustomModal
            isOpen={visible}
            onClose={onClose}
            showCloseButton={false}
            title="Editar Perfil"
            subtitle="Personalize sua identidade no app"
            // Mantém o cabeçalho com azul escuro para dar contraste ao cartão branco
            headerColors={["#1e3a8a", "#0f172a"]}
        >
            <View>
                {/* Input Nome de Usuário */}
                <Text className="text-slate-600 text-[10px] font-bold mb-2 uppercase ml-1">Nome de usuário</Text>
                <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 mb-4">
                    <User size={18} color="#94a3b8" />
                    <TextInput
                        value={displayName}
                        onChangeText={setDisplayName}
                        maxLength={15}
                        className="flex-1 text-slate-950 ml-3 font-bold text-base"
                        placeholder="Seu nome"
                        placeholderTextColor="#94a3b8"
                    />
                    <Text className="text-slate-400 font-bold">#{userIdTag}</Text>
                </View>

                {/* Input Bio */}
                <Text className="text-slate-600 text-[10px] font-bold mb-2 uppercase ml-1">Bio</Text>
                <View className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 mb-6">
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        maxLength={80}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        className="text-slate-950 text-sm min-h-[80px]"
                        placeholder="Conte um pouco sobre você..."
                        placeholderTextColor="#94a3b8"
                    />
                    <Text className="text-right text-[10px] text-slate-500 mt-1">
                        {bio.length}/80
                    </Text>
                </View>

                {/* Botões de Ação */}
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() => onClose()}
                        className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center border border-slate-200 active:bg-slate-200 justify-center"
                    >
                        <Text className="text-slate-600 font-bold uppercase text-xs">Cancelar</Text>
                    </Pressable>

                    <TouchableOpacity
                        onPress={handleUpdateProfile}
                        activeOpacity={0.8}
                        className="flex-1 bg-[#007bff] py-3.5 rounded-xl items-center justify-center"
                    >
                        <Text className="text-white font-bold uppercase text-xs">Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </CustomModal>
    )
}