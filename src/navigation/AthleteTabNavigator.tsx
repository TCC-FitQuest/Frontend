import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TrainingScreen } from '../screens/Training/TrainingScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

import Leaderboard from '../screens/Leaderboard/Leaderboard';

import { BottomNavigation } from '../components/ui/BottomNavigation';
import TrainingHistory from '../screens/Training/TrainingHistory';
import FriendsTab from '../screens/Friends/FriendsScreen';

const Tab = createBottomTabNavigator();

export default function AthleteTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="TrainingScreen" component={TrainingScreen} />
            <Tab.Screen name="TrainingHistory" component={TrainingHistory} />
            <Tab.Screen name="Leaderboard" component={Leaderboard} />
            <Tab.Screen name="Friends" component={FriendsTab} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

