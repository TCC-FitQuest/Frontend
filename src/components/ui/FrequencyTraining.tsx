import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Array reordenado visualmente para começar na Segunda (1) e terminar no Domingo (0)
const DAYS = [
    { key: 1, label: "S" },
    { key: 2, label: "T" },
    { key: 3, label: "Q" },
    { key: 4, label: "Q" },
    { key: 5, label: "S" },
    { key: 6, label: "S" },
    { key: 0, label: "D" },
];

interface Props {
    trainingHistoryWeek?: any[];
}

export function FrequencyTraining({ trainingHistoryWeek = [] }: Props) {

    // O reduce continua funcionando perfeitamente, mapeando o getDay() corretamente
    const frequencyByDay = trainingHistoryWeek.reduce((acc, item) => {
        const dayIndex = new Date(item.started_at).getDay();

        if (item.status === "complete" && item.type_training === "strength") {
            acc[dayIndex] = true;
        }

        return acc;
    }, {} as Record<number, boolean>);

    return (
        <View>
            <Text className="text-[#1D2D3E] text-base mb-4 font-bold">
                Frequência de Treinos
            </Text>

            <View className="flex-row justify-between px-1">
                {DAYS.map((day) => {
                    const didStrength = !!frequencyByDay[day.key];

                    return (
                        <View
                            key={day.key}
                            className="items-center gap-2"
                        >
                            <View
                                className={`w-10 h-10 rounded-full items-center justify-center ${didStrength
                                    ? "bg-[#0073B9]" // Preenchido com Azul Vibrante
                                    : "bg-transparent border-[1.5px] border-[#0073B9] rounded-full" // Vazio apenas com borda
                                    }`}
                            >
                                {didStrength && (
                                    <Ionicons
                                        name="checkmark"
                                        size={22}
                                        color="#FFFFFF"
                                    />
                                )}
                            </View>

                            {/* Letra do dia da semana */}
                            <Text className="text-[11px] font-bold text-[#1D2D3E]">
                                {day.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}