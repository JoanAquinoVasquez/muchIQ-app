import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoBackgroundProps {
  opacity?: number;
  showGradient?: boolean;
}

// Web-only: inyecta CSS global para forzar que el <video> cubra todo
function injectWebVideoStyle() {
  if (Platform.OS !== 'web') return;
  const styleId = 'video-bg-fix';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Fuerza que el elemento <video> cubra 100% del contenedor en web */
    [data-video-background] video {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center !important;
    }
    [data-video-background] {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
}

export default function VideoBackground({ 
  opacity = 0.6, 
  showGradient = true 
}: VideoBackgroundProps) {
  const videoRef = useRef<Video>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      injectWebVideoStyle();
      // Aplica el atributo data al nodo DOM real para que el CSS lo tome
      if (containerRef.current) {
        const node = containerRef.current as any;
        if (node?.setAttribute) {
          node.setAttribute('data-video-background', 'true');
        }
      }
    }
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isLoaded) {
      setIsLoaded(true);
    }
  };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      // Para web, asigna el data attribute via prop (React Native Web lo pasa al DOM)
      {...(Platform.OS === 'web' ? { 'data-video-background': 'true' } as any : {})}
    >
      <Video
        ref={videoRef}
        source={require('@assets/videos/background.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        rate={0.75}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {showGradient && (
        <LinearGradient
          colors={[
            `rgba(26, 155, 142, ${opacity * 0.4})`,
            `rgba(21, 107, 99, ${opacity * 0.6})`,
            `rgba(31, 41, 55, ${opacity})`,
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});