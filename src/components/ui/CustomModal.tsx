import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../theme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'delete' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export default function CustomModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Entendido',
  cancelText = 'Cancelar'
}: CustomModalProps) {
  
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: COLORS.primary, bg: COLORS.primary + '15' };
      case 'error':
        return { name: 'alert-circle' as const, color: COLORS.error, bg: COLORS.error + '15' };
      case 'delete':
      case 'confirm':
        return { name: type === 'delete' ? 'trash-outline' as const : 'help-circle-outline' as const, color: COLORS.error, bg: COLORS.error + '15' };
      default:
        return { name: 'information-circle' as const, color: COLORS.primary, bg: COLORS.primary + '15' };
    }
  };

  const icon = getIconConfig();
  const isActionModal = !!onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View 
          animation="zoomIn" 
          duration={300}
          style={styles.card}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name} size={40} color={icon.color} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{message}</Text>
          </View>

          <View style={styles.actions}>
            {isActionModal ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  <LinearGradient
                    colors={type === 'delete' ? [COLORS.error, '#d32f2f'] : [COLORS.primary, COLORS.primaryDark]}
                    style={styles.gradient}
                  >
                    <Text style={styles.confirmText}>{confirmText}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.button, { flex: 1, backgroundColor: icon.color, borderRadius: RADIUS.md }]}
                onPress={onClose}
              >
                <Text style={[styles.confirmText, { textAlign: 'center' }]}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    flex: 2,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  confirmText: {
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.bold,
  },
});
