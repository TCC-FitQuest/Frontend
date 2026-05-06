import React from "react";
import { ActivityIndicator, View, Modal, Text } from "react-native";

type LoaderProps = {
  visible: boolean;
  text?: string;
  fullscreen?: boolean;
};

export const Loading: React.FC<LoaderProps> = ({ visible, text, fullscreen = false }) => {
  if (!visible) return null;

  if (fullscreen) {
    return (
      <View className="flex-1 justify-center items-center" >
        <ActivityIndicator size="large" color="#fff" />
        {text && <Text className="text-white mt-3" > {text} </Text>
        }
      </View>
    );
  }

  return (
    <Modal transparent animationType="fade" visible={visible} >
      <View className="flex-1 justify-center items-center" >
        <View className="rounded-2xl p-6 items-center" >
          <ActivityIndicator size="large" color="#fff" />
          {text && <Text className="mt-3 text-black" > {text} </Text>}
        </View>
      </View>
    </Modal>
  );
};