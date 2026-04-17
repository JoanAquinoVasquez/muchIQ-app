import React from 'react';
import { StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import useToastStore, { ToastType } from '../../store/useToastStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle',
        color: COLORS.success,
        bg: '#F0FDF4',
        border: '#DCFCE7',
      };
    case 'error':
      return {
        icon: 'alert-circle',
        color: COLORS.error,
        bg: '#FEF2F2',
        border: '#FEE2E2',
      };
    case 'warning':
      return {
        icon: 'warning',
        color: COLORS.warning,
        bg: '#FFFBEB',
        border: '#FEF3C7',
      };
    default:
      return {
        icon: 'information-circle',
        color: COLORS.primary,
        bg: '#F0F9FF',
        border: '#E0F2FE',
      };
  }
};

const Toast = () => {
  const { isVisible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();

  if (!isVisible) return null;

  const config = getToastConfig(type);
  const topOffset = Platform.OS === 'ios' ? Math.max(insets.top, 20) : SPACING.md;

  return (
    <Animatable.View
      animation={isVisible ? "fadeInDown" : "fadeOutUp"}
      duration={300}
      style={[
        styles.container,
        { top: topOffset }
      ]}
      pointerEvents="none"
    >
      <View style={[styles.toast, { borderColor: config.border, backgroundColor: config.bg }, SHADOWS.md]}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Platform.OS === 'web' ? Math.min(width - 40, 400) : '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: '#374151',
    lineHeight: 18,
  },
});

export default Toast;
