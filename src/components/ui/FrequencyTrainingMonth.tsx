import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

interface Props {
    trainingHistoryMonth?: any[];
}

export function FrequencyTrainingMonth({ trainingHistoryMonth = [] }: Props) {

    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const frequencyByDay = trainingHistoryMonth.reduce((acc, item) => {
        const date = new Date(item.started_at);

        if (date.getMonth() !== month || date.getFullYear() !== year) {
            return acc;
        }

        const day = date.getDate();

        if (!acc[day]) {
            acc[day] = {
                strength: false,
                cardio: false,
            };
        }

        if (item.status === "complete") {
            if (item.type_training === "strength") acc[day].strength = true;
            if (item.type_training === "aerobic") acc[day].cardio = true;
        }

        return acc;
    }, {} as Record<number, { strength: boolean; cardio: boolean }>);

    return (
        <View className="px-4 ">
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="bg-slate-900 rounded-2xl p-4 border border-purple-500/30"
            >
                <View>
                    <Text className="text-slate-400 text-sm mb-3">
                        Frequência Mensal
                    </Text>

                    <View className="flex-row flex-wrap gap-y-1">
                        {daysArray.map((day) => {
                            const data = frequencyByDay[day];
                            const didStrength = data?.strength;
                            const didCardio = data?.cardio;
                            const bothDone = didStrength && didCardio;

                            return (
                                <View
                                    key={day}
                                    className="w-[14.28%] items-center"
                                >
                                    <View className="w-9 h-9 items-center justify-center relative">
                                        <View
                                            className={`absolute w-9 h-9 rounded-full border-2
                                        ${didStrength ? "border-blue-500" : "border-slate-700"}
                                    `}
                                        />

                                        <View
                                            className={`absolute w-6 h-6 rounded-full border-2
                                        ${didCardio ? "border-green-500" : "border-slate-700"}
                                    `}
                                        />

                                        <Ionicons
                                            name={
                                                bothDone
                                                    ? "flash"
                                                    : didStrength
                                                        ? "barbell"
                                                        : didCardio
                                                            ? "walk"
                                                            : "ellipse-outline"
                                            }
                                            size={12}
                                            color={
                                                bothDone
                                                    ? "#a855f7"
                                                    : didStrength
                                                        ? "#3b82f6"
                                                        : didCardio
                                                            ? "#22c55e"
                                                            : "#475569"
                                            }
                                        />
                                    </View>

                                    <Text className="text-[10px] text-slate-400">
                                        {day}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View className="flex-row justify-between mt-4 px-2">
                        <Text className="text-xs text-blue-400">🏋️ Musculação</Text>
                        <Text className="text-xs text-green-400">🏃 Aeróbico</Text>
                        <Text className="text-xs text-purple-400">⚡ Ambos</Text>
                    </View>
                </View>
            </MotiView>
        </View>
    );
}
