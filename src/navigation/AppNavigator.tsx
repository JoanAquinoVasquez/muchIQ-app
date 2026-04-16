import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@screens/WelcomeScreen';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import HomeScreen from '@screens/HomeScreen';
import PlaceDetailScreen from '@screens/PlaceDetailScreen';
import RewardsScreen from '@screens/RewardsScreen';
import ProfileScreen from '@screens/ProfileScreen';
import NearbyScreen from '@screens/NearbyScreen';
import CategoryPlacesScreen from '@screens/CategoryPlacesScreen';
import AIAssistantScreen from '@screens/AIAssistantScreen';
import ExploreScreen from '@screens/ExploreScreen';
import DishDetailScreen from '@screens/DishDetailScreen';
import EditProfileScreen from '@screens/EditProfileScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PlaceDetail: { placeId: string };
  Rewards: undefined;
  Profile: undefined;
  Nearby: undefined;
  CategoryPlaces: { category: string };
  AIAssistant: undefined;
  Explore: undefined;
  DishDetail: { dishId: string };
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const APP_NAME = 'MuchIQ';

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ title: `${APP_NAME} — Descubre Lambayeque` }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: `Iniciar Sesión — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: `Crear Cuenta — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: `Inicio — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: `Detalle del Lugar — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ title: `Mis Recompensas — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: `Mi Perfil — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="Nearby"
        component={NearbyScreen}
        options={{ title: `Lugares Cercanos — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="CategoryPlaces"
        component={CategoryPlacesScreen}
        options={{ title: `Explorar Categoría — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          title: `Asistente IA — ${APP_NAME}`,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: `Explorar — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="DishDetail"
        component={DishDetailScreen}
        options={{ title: `Detalle del Platillo — ${APP_NAME}` }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: `Editar Perfil — ${APP_NAME}` }}
      />
    </Stack.Navigator>
  );
}