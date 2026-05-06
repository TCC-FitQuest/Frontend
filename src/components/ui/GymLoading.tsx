import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

interface GymLoadingProps {
  text1?: string;
  text2?: string;
}

export function GymLoading({ text1 = "Carregando", text2 = "Aguarde um momento" }: GymLoadingProps) {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(1);
  const dots = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1
    );

    pulse.value = withRepeat(
      withTiming(1.2, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    dots.value = withRepeat(
      withTiming(3, { duration: 900 }),
      -1
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: pulse.value }],
  }));

  const dotStyle = (index: number) =>
    useAnimatedStyle(() => ({
      opacity: dots.value >= index ? 1 : 0.2,
    }));

  return (
    <View className="flex-1 items-center justify-center">
      <Animated.View
        style={rotateStyle}
        className="mb-6 bg-cyan-500/20 p-6 rounded-full border border-cyan-400/40"
      >
        <Ionicons name="barbell" size={42} color="#22d3ee" />
      </Animated.View>

      <Text className="text-cyan-400 text-lg font-bold tracking-wide">
        {text1}
      </Text>

      <View className="flex-row mt-2 space-x-1">
        {[1, 2, 3].map((i) => (
          <Animated.Text
            key={i}
            style={dotStyle(i)}
            className="text-cyan-400 text-xl font-bold"
          >
            .
          </Animated.Text>
        ))}
      </View>

      <Text className="mt-4 text-slate-500 text-xs">
        {text2}
      </Text>
    </View>
  );
}
