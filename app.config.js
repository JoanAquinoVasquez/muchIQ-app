export default {
  expo: {
    name: "Lambayeque Explorer",
    slug: "lambayeque-explorer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1A9B8E"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.lambayeque.explorer",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Permite encontrar lugares turísticos cercanos a ti.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Permite encontrar lugares turísticos cercanos a ti.",
        NSMicrophoneUsageDescription: "Permite usar el asistente de voz para recomendaciones personalizadas."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1A9B8E"
      },
      package: "com.lambayeque.explorer",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      // Configuración importante para desarrollo
      useNextNotificationsApi: true,
      softwareKeyboardLayoutMode: "pan"
    },
    plugins: [
      [
        "expo-av",
        {
          microphonePermission: "Permite usar el asistente de voz para recomendaciones personalizadas."
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Permite encontrar lugares turísticos cercanos a ti.",
          locationWhenInUsePermission: "Permite encontrar lugares turísticos cercanos a ti."
        }
      ]
    ],
    // Configuración extra importante
    extra: {
      eas: {
        projectId: "tu-project-id-aqui" // Opcional, pero útil si usas EAS
      }
    }
  }
};