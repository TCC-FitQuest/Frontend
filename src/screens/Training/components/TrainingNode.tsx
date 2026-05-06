import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { Dumbbell, SquareCheckBig, Zap, Lock, Calendar } from "lucide-react-native";
import { isToday } from "../../../utils/days";
import { Training } from "../../../models/Training";
import { TrainingHistory } from "../../../models/TrainingHistory";

interface TrainingNodeProps {
    training: Training
    trainingHistory?: TrainingHistory[];
    index: number;
    onPress: () => void;
}

const PRIMARY_COLOR = "#3b82f6";

function getStatusFromHistory(trainingId: number, history: TrainingHistory[] = []) {
    const relevantHistory = history.filter(item => item.training_id === trainingId);

    if (relevantHistory.find(item => item.status === "progress")) return "progress";
    if (relevantHistory.find(item => item.status === "complete")) return "complete";
    return "available";
}

export function TrainingNode({ training, index, onPress, trainingHistory = [] }: TrainingNodeProps) {

    const historyStatus = getStatusFromHistory(training.id, trainingHistory);
    const finalStatus = training.status === "locked" ? "locked" : historyStatus;
    const trainingIsToday = useMemo(() => isToday(training.day), [training.day]);

    const isLocked = finalStatus === "locked";
    const isActive = finalStatus === "progress" || (trainingIsToday && finalStatus === "available");

    const iconColor = isLocked ? "rgba(59, 130, 246, 0.3)" : PRIMARY_COLOR;
    const borderColor = isLocked ? "rgba(59, 130, 246, 0.2)" : PRIMARY_COLOR;
    const textColor = isLocked ? "rgba(255, 255, 255, 0.3)" : "white";

    return (
        <View style={{ width: "100%", alignItems: "center", marginBottom: 16 }}>
            <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', damping: 14 }}
            >
                <MotiPressable
                    onPress={!isLocked ? onPress : undefined}
                    animate={({ pressed }) => {
                        "worklet";
                        return { scale: pressed ? 0.96 : 1 };
                    }}
                >
                    <View
                        style={{
                            width: 320,
                            height: 90,
                            backgroundColor: isLocked ? "rgba(15,23,42,0.4)" : "#0f172a",
                            borderWidth: 1.5,
                            borderColor: borderColor,
                            borderRadius: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            shadowColor: PRIMARY_COLOR,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: isActive ? 0.4 : 0,
                            shadowRadius: 10,
                            elevation: isActive ? 6 : 0,
                        }}
                    >
                        <MotiView
                            animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={{ duration: 2000, repeat: Infinity }}
                            style={{ marginRight: 16 }}
                        >
                            {finalStatus === "complete" ? (
                                <SquareCheckBig size={32} color={iconColor} />
                            ) : finalStatus === "progress" ? (
                                <Zap size={32} color={iconColor} fill={iconColor} />
                            ) : finalStatus === "locked" ? (
                                <Lock size={32} color={iconColor} />
                            ) : trainingIsToday ? (
                                <Calendar size={32} color={iconColor} />
                            ) : (
                                <Dumbbell size={32} color={iconColor} />
                            )}
                        </MotiView>

                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: textColor,
                                    fontSize: 15,
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    marginBottom: 4
                                }}
                            >
                                {training.title}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: iconColor, fontWeight: "bold", fontSize: 12 }}>
                                    {training.day}
                                </Text>

                                {trainingIsToday && finalStatus !== "complete" && (
                                    <View style={{ backgroundColor: iconColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>HOJE</Text>
                                    </View>
                                )}

                                {finalStatus === "progress" && (
                                    <Text style={{ color: iconColor, fontSize: 9, fontWeight: '900' }}>
                                        • EM ANDAMENTO
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </MotiPressable>
            </MotiView>
        </View>
    );
}