import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../theme';
import { Itinerary, ItineraryDay } from '../../services/itineraryService';

interface ItineraryTimelineProps {
  isVisible: boolean;
  onClose: () => void;
  itinerary: Itinerary;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function ItineraryTimeline({
  isVisible,
  onClose,
  itinerary,
  onSave,
  isSaving
}: ItineraryTimelineProps) {
  
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('museo') || cat.includes('cultura')) return 'business-outline';
    if (cat.includes('restaurante') || cat.includes('comida') || cat.includes('gastronom')) return 'restaurant-outline';
    if (cat.includes('playa') || cat.includes('mar')) return 'water-outline';
    if (cat.includes('parque') || cat.includes('naturaleza')) return 'leaf-outline';
    if (cat.includes('compras') || cat.includes('mercado')) return 'cart-outline';
    return 'navigate-outline';
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('restaurante')) return '#FF6B6B';
    if (cat.includes('museo')) return '#4ECDC4';
    if (cat.includes('playa')) return '#45B7D1';
    return COLORS.primary;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Tu Plan con MuchIQ</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{itinerary.title}</Text>
          </View>
          {onSave && (
            <TouchableOpacity 
              onPress={onSave} 
              disabled={isSaving}
              style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            >
              <Ionicons name={isSaving ? "hourglass-outline" : "bookmark-outline"} size={22} color={COLORS.textWhite} />
            </TouchableOpacity>
          )}
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {itinerary.days.map((day, dIdx) => (
            <View key={dIdx} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <LinearGradient
                  colors={[COLORS.accent, COLORS.accentDark]}
                  style={styles.dayBadge}
                >
                  <Text style={styles.dayNumber}>Día {day.dayNumber}</Text>
                </LinearGradient>
                <Text style={styles.dayTitle}>{day.title}</Text>
              </View>

              <View style={styles.timelineContainer}>
                {day.activities.map((activity, aIdx) => (
                  <Animatable.View 
                    key={aIdx} 
                    animation="fadeInRight" 
                    delay={aIdx * 100}
                    style={styles.activityRow}
                  >
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>{activity.time}</Text>
                      <View style={[styles.dot, { backgroundColor: getCategoryColor(activity.category) }]} />
                      {aIdx < day.activities.length - 1 && <View style={styles.line} />}
                    </View>

                    <View style={styles.activityCard}>
                      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(activity.category) + '20' }]}>
                        <Ionicons 
                          name={getCategoryIcon(activity.category) as any} 
                          size={20} 
                          color={getCategoryColor(activity.category)} 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.placeName}</Text>
                        <Text style={styles.activityDesc}>{activity.description}</Text>
                        <View style={styles.addressRow}>
                          <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
                          <Text style={styles.addressText} numberOfLines={1}>{activity.address}</Text>
                        </View>
                      </View>
                    </View>
                  </Animatable.View>
                ))}
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  daySection: {
    marginBottom: SPACING.xl,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dayBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  dayNumber: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  dayTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  timelineContainer: {
    marginLeft: 15,
  },
  activityRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
    ...SHADOWS.sm,
    zIndex: 2,
  },
  line: {
    position: 'absolute',
    top: 35,
    bottom: -30,
    width: 2,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  activityCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  activityDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});
