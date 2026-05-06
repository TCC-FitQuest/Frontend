export const DAYS_ORDER: Record<string, number> = {
    'segunda': 1,
    'terça': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6,
    'sábado': 6,
    'domingo': 7,
};

export const DAYS = [
    { key: 'domingo', label: "D" },
    { key: 'segunda', label: "S" },
    { key: 'terça', label: "T" },
    { key: 'quarta', label: "Q" },
    { key: 'quinta', label: "Q" },
    { key: 'sexta', label: "S" },
    { key: 'sabado', label: "S" },
];

export function isToday(dayName: string): boolean {
    if (!dayName) return false;
    const daysMap: Record<string, number> = {
        'domingo': 0, 'sunday': 0,
        'segunda-feira': 1, 'segunda': 1, 'monday': 1,
        'terça-feira': 2, 'terça': 2, 'tuesday': 2,
        'quarta-feira': 3, 'quarta': 3, 'wednesday': 3,
        'quinta-feira': 4, 'quinta': 4, 'thursday': 4,
        'sexta-feira': 5, 'sexta': 5, 'friday': 5,
        'sábado': 6, 'sabado': 6, 'saturday': 6
    };
    const todayIndex = new Date().getDay();
    return daysMap[dayName.toLowerCase().trim()] === todayIndex;
}
