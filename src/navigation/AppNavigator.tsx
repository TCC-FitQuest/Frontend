import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Authentication/login';
import TrainingDetail from '../screens/Training/StrengthDetail';
import TrainingHistory from '../screens/Training/TrainingHistory';
import SelectTrainingProtocol from '../screens/Protocol/SelectTrainingProtocol';
import { CreateTrainingProtocol } from '../screens/Protocol/CreateProtocolScreen';
import ProtocolsManagementScreen from '../screens/Protocol/ProtocolsManagementScreen';

import AthleteTabNavigator from './AthleteTabNavigator';

import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

const Stack = createNativeStackNavigator();

const MainTabsWrapper = () => {
    return <AthleteTabNavigator />;
};

export default function AppNavigator() {
    const token = useAuthStore((state) => state.token);
    const user = useUserStore((state) => state.user);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsReady(true), 500);
    }, []);

    if (!isReady) return null;

    const isLogged = !!token && !!user;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLogged ? (
                <>
                    <Stack.Screen name="MainHome" component={MainTabsWrapper} />
                    <Stack.Screen name="TrainingDetail" component={TrainingDetail} />
                    <Stack.Screen name="TrainingHistory" component={TrainingHistory} />
                    <Stack.Screen name="SelectTrainingProtocol" component={SelectTrainingProtocol} />
                    <Stack.Screen name="CreateTrainingProtocol" component={CreateTrainingProtocol} />
                    <Stack.Screen name="ProtocolsManagementScreen" component={ProtocolsManagementScreen} />
                </>
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}
