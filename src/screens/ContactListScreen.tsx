import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Contact } from '../models/Contact';
import { getAllContacts, searchContacts, getReviewCount } from '../services/database';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

export default function ContactListScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadContacts();
      loadReviewCount();
    }, [])
  );

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviewCount = async () => {
    try {
      const count = await getReviewCount();
      setReviewCount(count);
    } catch (error) {
      console.error('Error loading review count:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim() === '') {
        await loadContacts();
      } else {
        const results = await searchContacts(query);
        setContacts(results);
      }
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigation.navigate('EditContact', { contactId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.contactPhoto}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.contextNotes && (
          <Text style={styles.contactContext} numberOfLines={1}>
            {item.contextNotes}
          </Text>
        )}
        <Text style={styles.contactReview}>
          Next review: {new Date(item.nextReviewDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={commonStyles.emptyState}>
      <Text style={styles.emptyStateIcon}>👤</Text>
      <Text style={commonStyles.emptyStateText}>
        No contacts yet.{'\n'}Tap "Add Contact" to get started!
      </Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CORE</Text>
        <Text style={styles.headerSubtitle}>Contextual Recall Engine</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Review Button */}
      {reviewCount > 0 && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('Quiz')}
          activeOpacity={0.8}
        >
          <Text style={styles.reviewButtonText}>
            📚 Review {reviewCount} Contact{reviewCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      {/* Contact List */}
      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={contacts.length === 0 ? { flex: 1 } : {}}
        refreshing={isLoading}
        onRefresh={loadContacts}
      />

      {/* Add Contact Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContact')}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Add Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.textInverse,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textInverse,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  reviewButton: {
    backgroundColor: colors.secondary,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  contactPhoto: {
    marginRight: spacing.md,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contactContext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contactReview: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  emptyStateIcon: {
    fontSize: 64,
  },
});
