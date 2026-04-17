import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import aiService from '@services/aiService';
import itineraryService, { Itinerary } from '@services/itineraryService';
import ItineraryTimeline from '@components/itinerary/ItineraryTimeline';
import CustomModal from '@components/ui/CustomModal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  itineraryData?: Itinerary; 
}

interface TextPart {
  text: string;
  isBold: boolean;
}

export default function AIAssistantScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! 👋 Soy tu guía turístico virtual de Lambayeque. ¿En qué puedo ayudarte hoy?\n\nPuedo recomendarte:\n• Lugares turísticos cercanos\n• Gastronomía típica\n• Crear itinerarios personalizados\n• Información cultural e histórica',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Estados para itinerario
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [isItineraryVisible, setIsItineraryVisible] = useState(false);
  const [isSavingItinerary, setIsSavingItinerary] = useState(false);

  // Estado para alertas personalizadas
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'delete' | 'confirm';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'delete' | 'confirm' = 'info', onConfirm?: () => void) => {
    setCustomAlert({ visible: true, title, message, type, onConfirm });
  };

  const suggestedQueries = [
    '¿Qué lugares turísticos puedo visitar hoy?',
    'Recomiéndame comida típica de Lambayeque',
    'Crea un itinerario de un día',
    '¿Dónde puedo ver arte local?',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Obtener historial reciente (últimos 6 mensajes por ejemplo) para dar contexto
      const history = messages.slice(-6).map(m => ({
        text: m.text,
        isUser: m.isUser
      }));

      const response = await aiService.getRecommendation(messageText, undefined, undefined, history);
      
      console.log('✅ Respuesta recibida:', response);
      
      // Intentar extraer JSON de itinerario
      let cleanedText = response.aiResponse;
      let itineraryData: Itinerary | undefined = undefined;

      const itineraryRegex = /\[ITINERARY_JSON\]([\s\S]*?)\[\/ITINERARY_JSON\]/;
      const match = cleanedText.match(itineraryRegex);

      if (match && match[1]) {
        try {
          itineraryData = JSON.parse(match[1]);
          // Limpiar el texto para que no muestre el JSON crudo en el chat
          cleanedText = cleanedText.replace(itineraryRegex, '').trim();
        } catch (e) {
          console.error("Error al parsear JSON de itinerario:", e);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanedText,
        isUser: false,
        timestamp: new Date(),
        itineraryData: itineraryData
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('❌ Error en handleSendMessage:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Lo siento, hubo un error: ${error.message}\n\nPor favor, verifica:\n• Tu conexión a internet\n• Que el servidor esté activo\n• Intenta nuevamente en unos momentos`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setShowMenu(false);
    showCustomAlert(
      '¿Reiniciar aventura?', 
      'Se borrarán todos los mensajes del chat. Esta acción no se puede deshacer.', 
      'delete',
      () => {
        setMessages([
          {
            id: '1',
            text: '¡Hola! 👋 Soy tu guía MuchIQ. He reiniciado nuestra bitácora de viaje.\n\n¿A dónde te gustaría que planeemos ir ahora?',
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        scrollToBottom();
      }
    );
  };

  const handleSaveItinerary = async () => {
    if (!activeItinerary) return;
    setIsSavingItinerary(true);
    try {
      console.log("💾 Guardando itinerario...", activeItinerary.title);
      await itineraryService.saveItinerary(activeItinerary);
      
      const successMsg = '¡Excelente! Tu plan de viaje ha sido guardado con éxito.';
      showCustomAlert('¡Excelente!', successMsg, 'success');
      
      // Cerramos el visor del itinerario para que se vea el mensaje de éxito
      setIsItineraryVisible(false);
    } catch (error: any) {
      console.error("❌ Error al guardar itinerario:", error);
      const errorMsg = error.message || 'No se pudo guardar el itinerario';
      showCustomAlert('Error', errorMsg, 'error');
    } finally {
      setIsSavingItinerary(false);
    }
  };

  const openItinerary = (data: Itinerary) => {
    setActiveItinerary(data);
    setIsItineraryVisible(true);
  };

  // Función para parsear texto con formato **negrita**
  const parseMarkdown = (text: string): TextPart[] => {
    const parts: TextPart[] = [];
    const regex = /(\*\*.*?\*\*)/g;
    const matches = text.split(regex);

    matches.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Es texto en negrita
        parts.push({
          text: part.slice(2, -2),
          isBold: true,
        });
      } else if (part) {
        // Es texto normal
        parts.push({
          text: part,
          isBold: false,
        });
      }
    });

    return parts;
  };

  // Componente para renderizar texto con formato
  const FormattedText = ({ text, isUserMessage }: { text: string; isUserMessage: boolean }) => {
    const parts = parseMarkdown(text);
    const baseStyle = isUserMessage ? styles.userText : styles.aiText;

    return (
      <Text style={baseStyle}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={[
              baseStyle,
              part.isBold && styles.boldText,
            ]}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  const renderMessage = (message: Message, index: number) => {
    return (
      <Animatable.View
        key={message.id}
        animation="fadeInUp"
        delay={index * 50}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!message.isUser && (
          <View style={styles.aiAvatar}>
            <Image
              source={require('../../assets/mascota.jpg')}
              style={styles.mascotaImage}
              resizeMode="cover"
            />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <FormattedText text={message.text} isUserMessage={message.isUser} />
          
          {message.itineraryData && (
            <TouchableOpacity 
              style={styles.itineraryBadge}
              onPress={() => openItinerary(message.itineraryData!)}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.itineraryBadgeGradient}
              >
                <Ionicons name="sparkles" size={16} color={COLORS.textWhite} />
                <Text style={styles.itineraryBadgeText}>Ver Plan Visual</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.timestamp,
              message.isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
            {message.timestamp.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {message.isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
        )}
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Image
              source={require('../../assets/mascota.jpg')}
              style={styles.headerMascotaImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Asistente IA</Text>
            <Text style={styles.headerSubtitle}>MuchIQ</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <Animatable.View 
            animation="fadeInUp" 
            duration={200}
            style={styles.menuContent}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleClearChat}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.menuItemTextDestructive}>Limpiar conversación</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => setShowMenu(false)}
            >
              <Ionicons name="close-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.menuItemText}>Cerrar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>

      <CustomModal
        visible={customAlert.visible}
        onClose={() => setCustomAlert({ ...customAlert, visible: false })}
        onConfirm={customAlert.onConfirm}
        title={customAlert.title}
        message={customAlert.message}
        type={customAlert.type}
        confirmText={customAlert.type === 'delete' ? 'Sí, borrar' : 'Entendido'}
      />

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isLoading && (
            <Animatable.View
              animation="fadeIn"
              style={[styles.messageContainer, styles.aiMessageContainer]}
            >
              <View style={styles.aiAvatar}>
                <Image
                  source={require('../../assets/mascota.jpg')}
                  style={styles.mascotaImage}
                  resizeMode="cover"
                />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Pensando...</Text>
              </View>
            </Animatable.View>
          )}
        </ScrollView>

        {/* Suggested Queries */}
        {messages.length === 1 && !isLoading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestedQueries.map((query, index) => (
              <Animatable.View
                key={index}
                animation="fadeInRight"
                delay={index * 100}
              >
                <TouchableOpacity
                  style={styles.suggestionChip}
                  onPress={() => handleSendMessage(query)}
                >
                  <Text style={styles.suggestionText}>{query}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={COLORS.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={
                  inputText.trim() && !isLoading
                    ? [COLORS.primary, COLORS.primaryDark]
                    : [COLORS.textLight, COLORS.textLight]
                }
                style={styles.sendButtonGradient}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={COLORS.textWhite}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de Itinerario */}
      {activeItinerary && (
        <ItineraryTimeline
          isVisible={isItineraryVisible}
          onClose={() => setIsItineraryVisible(false)}
          itinerary={activeItinerary}
          onSave={handleSaveItinerary}
          isSaving={isSavingItinerary}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.accentLight,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accentLight,
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  mascotaImage: {
    width: '100%',
    height: '100%',
  },
  headerMascotaImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  itineraryBadge: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  itineraryBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  itineraryBadgeText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  messageText: {
    fontSize: TYPOGRAPHY.base,
    lineHeight: TYPOGRAPHY.base * 1.5,
  },
  userText: {
    color: COLORS.textWhite,
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  boldText: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: TYPOGRAPHY.xs,
    marginTop: SPACING.xs,
  },
  userTimestamp: {
    color: COLORS.accentLight,
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textLight,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  suggestionsContainer: {
    maxHeight: 60,
    marginBottom: SPACING.sm,
  },
  suggestionsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.sm,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: SPACING.xs,
  },
  sendButton: {
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    paddingTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  menuItemTextDestructive: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.semibold,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 340,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  confirmIconContainer: {
    marginBottom: SPACING.md,
  },
  confirmTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.semibold,
    fontSize: TYPOGRAPHY.sm,
  },
  deleteButton: {
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.textWhite,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.sm,
  },
});