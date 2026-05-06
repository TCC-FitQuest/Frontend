

const typeColors = {
    // Add your color mappings here
};

const COLOR_KEYS = Object.keys(typeColors) as (keyof typeof typeColors)[];

export function assignRandomColors<T extends { id: number }>(trainings: T[]) {
    const shuffled = [...COLOR_KEYS].sort(() => Math.random() - 0.5);

    return trainings.map((training, index) => ({
        ...training,
        colorKey: shuffled[index % shuffled.length],
    }));
}
