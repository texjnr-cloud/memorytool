import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Contact } from '../models/Contact';
import { getContactsDueForReview, updateContact } from '../services/database';
import { calculateSM2 } from '../utils/sm2Algorithm';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

export default function QuizScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuizContacts();
  }, []);

  const loadQuizContacts = async () => {
    try {
      setIsLoading(true);
      const dueContacts = await getContactsDueForReview();
      setContacts(dueContacts);

      if (dueContacts.length === 0) {
        Alert.alert(
          'All Caught Up!',
          'You have no contacts to review right now. Great job!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading quiz contacts:', error);
      Alert.alert('Error', 'Failed to load contacts for review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    const currentContact = contacts[currentIndex];
    if (!currentContact) return;

    try {
      const sm2Result = calculateSM2(
        rating,
        currentContact.easinessFactor,
        currentContact.intervalDays || 0,
        currentContact.repetitionCount || 0
      );

      const updatedContact: Contact = {
        ...currentContact,
        lastReviewDate: new Date().toISOString(),
        nextReviewDate: sm2Result.nextReviewDate,
        easinessFactor: sm2Result.easinessFactor,
        repetitionCount: sm2Result.repetitionCount,
        intervalDays: sm2Result.intervalDays,
      };

      await updateContact(updatedContact);

      if (currentIndex < contacts.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        Alert.alert(
          'Quiz Complete!',
          `Great job! You've reviewed ${contacts.length} contact${
            contacts.length !== 1 ? 's' : ''
          }.`,
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to save review results');
    }
  };

  const getRatingColor = (rating: number): string => {
    return colors.rating[rating as keyof typeof colors.rating] || colors.textSecondary;
  };

  const getRatingLabel = (rating: number): string => {
    const labels = [
      'Complete Blackout',
      'Incorrect, seemed familiar',
      'Incorrect, seemed easy',
      'Correct with difficulty',
      'Correct with hesitation',
      'Perfect Recall',
    ];
    return labels[rating] || '';
  };

  if (isLoading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.body}>Loading quiz...</Text>
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={commonStyles.centeredContainer}>
        <Text style={styles.emptyStateIcon}>✅</Text>
        <Text style={commonStyles.emptyStateText}>All caught up!</Text>
      </View>
    );
  }

  const currentContact = contacts[currentIndex];
  const progress = ((currentIndex + 1) / contacts.length) * 100;

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memory Quiz</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {contacts.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Photo */}
        <View style={styles.photoContainer}>
          {currentContact.photoUri ? (
            <Image source={{ uri: currentContact.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>?</Text>
            </View>
          )}
        </View>

        {/* Context Notes */}
        {currentContact.contextNotes && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextLabel}>Context:</Text>
            <Text style={styles.contextText}>{currentContact.contextNotes}</Text>
          </View>
        )}

        {/* Question */}
        <Text style={styles.question}>What is this person's name?</Text>

        {/* Show Answer Button or Answer Display */}
        {!showAnswer ? (
          <TouchableOpacity
            style={styles.showAnswerButton}
            onPress={() => setShowAnswer(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.showAnswerButtonText}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Name:</Text>
            <Text style={styles.answerText}>{currentContact.name}</Text>

            {currentContact.mnemonicHook && (
              <>
                <Text style={styles.mnemonicLabel}>Mnemonic Hook:</Text>
                <Text style={styles.mnemonicText}>{currentContact.mnemonicHook}</Text>
              </>
            )}

            {/* Rating Buttons */}
            <Text style={styles.ratingTitle}>How well did you remember?</Text>
            <View style={styles.ratingContainer}>
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    { backgroundColor: getRatingColor(rating) },
                  ]}
                  onPress={() => handleRating(rating)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ratingNumber}>{rating}</Text>
                  <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  progressContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  progressText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.backgroundTertiary,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: colors.border,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.border,
  },
  photoPlaceholderText: {
    fontSize: 80,
    color: colors.textSecondary,
  },
  contextContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  contextLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contextText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  showAnswerButton: {
    backgroundColor: colors.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  showAnswerButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  answerContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  answerLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  answerText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  mnemonicLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mnemonicText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  ratingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ratingContainer: {
    gap: spacing.sm,
  },
  ratingButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.textInverse,
    width: 40,
  },
  ratingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textInverse,
    flex: 1,
  },
  emptyStateIcon: {
    fontSize: 64,
  },
});
