import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '../models/Contact';
import { createContact, getContactById, updateContact } from '../services/database';
import { generateMnemonicHook } from '../services/mnemonicGenerator';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

export default function AddEditContactScreen({ navigation, route }: any) {
  const contactId = route.params?.contactId;
  const isEditMode = !!contactId;

  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [mnemonicHook, setMnemonicHook] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    try {
      const contact = await getContactById(contactId);
      if (contact) {
        setName(contact.name);
        setPhotoUri(contact.photoUri);
        setContextNotes(contact.contextNotes);
        setMnemonicHook(contact.mnemonicHook);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
      Alert.alert('Error', 'Failed to load contact');
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access photos is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleGenerateMnemonic = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name before generating a mnemonic hook.');
      return;
    }

    setIsGenerating(true);
    try {
      const hook = await generateMnemonicHook({
        name: name.trim(),
        contextNotes: contextNotes.trim(),
      });
      setMnemonicHook(hook);
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      Alert.alert('Error', 'Failed to generate mnemonic hook');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name.');
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (isEditMode) {
        const existingContact = await getContactById(contactId);
        if (existingContact) {
          const updatedContact: Contact = {
            ...existingContact,
            name: name.trim(),
            photoUri: photoUri,
            contextNotes: contextNotes.trim(),
            mnemonicHook: mnemonicHook.trim(),
          };
          await updateContact(updatedContact);
          Alert.alert('Success', 'Contact updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        const newContact: Contact = {
          id: uuidv4(),
          name: name.trim(),
          photoUri: photoUri,
          contextNotes: contextNotes.trim(),
          mnemonicHook: mnemonicHook.trim(),
          lastReviewDate: today.toISOString(),
          nextReviewDate: tomorrow.toISOString(),
          easinessFactor: 2.5,
          repetitionCount: 0,
          intervalDays: 1,
        };
        await createContact(newContact);
        Alert.alert('Success', 'Contact added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={commonStyles.title}>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</Text>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No Photo</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={[commonStyles.secondaryButton, styles.photoButton]}
              onPress={handleTakePhoto}
            >
              <Text style={commonStyles.secondaryButtonText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.secondaryButton, styles.photoButton]}
              onPress={handlePickImage}
            >
              <Text style={commonStyles.secondaryButtonText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Input */}
        <Text style={commonStyles.inputLabel}>Name *</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Enter full name"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Context Notes Input */}
        <Text style={commonStyles.inputLabel}>Context Notes</Text>
        <TextInput
          style={[commonStyles.input, commonStyles.inputMultiline]}
          placeholder="Where and when did you meet this person?"
          placeholderTextColor={colors.textTertiary}
          value={contextNotes}
          onChangeText={setContextNotes}
          multiline
          numberOfLines={4}
        />

        {/* Generate Mnemonic Button */}
        <TouchableOpacity
          style={[commonStyles.outlineButton, styles.generateButton]}
          onPress={handleGenerateMnemonic}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={commonStyles.outlineButtonText}>✨ Generate Mnemonic Hook</Text>
          )}
        </TouchableOpacity>

        {/* Mnemonic Hook Input */}
        <Text style={commonStyles.inputLabel}>Mnemonic Hook</Text>
        <TextInput
          style={[commonStyles.input, commonStyles.inputMultiline]}
          placeholder="A vivid, memorable phrase to help you remember this person's name"
          placeholderTextColor={colors.textTertiary}
          value={mnemonicHook}
          onChangeText={setMnemonicHook}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.hint}>
          💡 Tip: The more vivid and unusual the image, the easier it is to remember!
        </Text>

        {/* Save Button */}
        <TouchableOpacity
          style={[commonStyles.primaryButton, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>
              {isEditMode ? 'Update Contact' : 'Save Contact'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[commonStyles.secondaryButton, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  generateButton: {
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
