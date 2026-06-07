import { View, Text } from "react-native";
import { MotiView } from "moti";
import { Dumbbell } from "lucide-react-native";

interface Props {
    trainingHistoryMonth?: any[];
}

export function FrequencyTrainingMonth({ trainingHistoryMonth = [] }: Props) {

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Dados para montar o calendário real do mês
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo, 6 = Sábado
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Verifica quais dias tiveram treino concluído (Ignora aeróbicos por segurança)
    const frequencyByDay = trainingHistoryMonth.reduce((acc, item) => {
        const date = new Date(item.started_at || item.finished_at);

        if (date.getMonth() !== month || date.getFullYear() !== year) {
            return acc;
        }

        if (item.status === "complete" && item.type_training !== "aerobic") {
            acc[date.getDate()] = true;
        }

        return acc;
    }, {} as Record<number, boolean>);

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full"
        >
            {/* Cabeçalho do Calendário */}
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-[#1D2D3E] font-black text-lg tracking-tight">
                        Frequência
                    </Text>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        {monthNames[month]} {year}
                    </Text>
                </View>

                <View className="flex-row items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <Dumbbell size={14} color="#0073B9" />
                    <Text className="text-[#0073B9] text-[10px] font-black uppercase tracking-wider">
                        Musculação
                    </Text>
                </View>
            </View>

            {/* Dias da Semana (D S T Q Q S S) */}
            <View className="flex-row flex-wrap mb-2">
                {weekdays.map((day, index) => (
                    <View key={`weekday-${index}`} className="w-[14.28%] items-center mb-2">
                        <Text className="text-gray-400 text-[10px] font-bold uppercase">
                            {day}
                        </Text>
                    </View>
                ))}

                {/* Dias Vazios (Para alinhar o dia 1 ao dia da semana correto) */}
                {emptyDays.map((_, index) => (
                    <View key={`empty-${index}`} className="w-[14.28%] items-center mb-2" />
                ))}

                {/* Dias do Mês */}
                {daysArray.map((day) => {
                    const didTrain = frequencyByDay[day];
                    const isToday = day === today.getDate();

                    return (
                        <View key={`day-${day}`} className="w-[14.28%] items-center mb-2">
                            <View
                                className={`w-8 h-8 rounded-full items-center justify-center 
                                    ${didTrain ? 'bg-[#0073B9] shadow-sm shadow-[#0073B9]/30' : 'bg-gray-50'}
                                    ${isToday && !didTrain ? 'border-2 border-gray-200 bg-white' : ''}
                                `}
                            >
                                <Text
                                    className={`text-xs font-bold
                                        ${didTrain ? 'text-white' : 'text-gray-400'}
                                        ${isToday && !didTrain ? 'text-[#1D2D3E]' : ''}
                                    `}
                                >
                                    {day}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </MotiView>
    );
}