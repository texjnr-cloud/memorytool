# CORE: Contextual Recall Engine

A cross-platform mobile application designed to help you remember people's names and faces using cognitive science principles and adaptive spaced repetition.

## Overview

CORE (Contextual Recall Engine) is a minimalist mobile app built with React Native and Expo that helps you:

- **Capture**: Store contacts with photos, context notes, and AI-generated mnemonic hooks
- **Remember**: Use vivid, memorable phrases to create strong memory associations
- **Review**: Practice name recall using the scientifically-proven SuperMemo 2 (SM-2) algorithm
- **Master**: Achieve long-term retention through adaptive spaced repetition

## Features

### 1. Contact Management
- Add contacts with photos (camera or gallery)
- Record contextual information about where/when you met
- Search and browse your contact list

### 2. AI Mnemonic Generator
- Generate creative, vivid memory hooks to help remember names
- Placeholder implementation ready for LLM API integration
- Fully editable mnemonics for personalization

### 3. Adaptive Spaced Repetition (ASR)
- Quiz system that shows photos and context without revealing names
- Rate your recall quality on a 0-5 scale
- SuperMemo 2 algorithm automatically schedules optimal review intervals
- Tracks performance and adjusts difficulty based on your responses

## Architecture

### Data Model

```typescript
interface Contact {
  id: string;                    // UUID
  name: string;                  // Full name
  photoUri: string;              // Local file path
  contextNotes: string;          // Where/when you met
  mnemonicHook: string;          // Memory aid phrase
  lastReviewDate: string;        // ISO date string
  nextReviewDate: string;        // ISO date string
  easinessFactor: number;        // 1.3 - 2.5
  repetitionCount: number;       // Consecutive correct reviews
  intervalDays: number;          // Days until next review
}
```

### Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Database**: Expo SQLite (local persistence)
- **Image Handling**: Expo Image Picker
- **Algorithm**: SuperMemo 2 (SM-2) for spaced repetition

### Project Structure

```
memorytool/
├── App.tsx                     # Main app component with navigation
├── src/
│   ├── models/
│   │   └── Contact.ts         # TypeScript interfaces
│   ├── screens/
│   │   ├── ContactListScreen.tsx      # Home screen
│   │   ├── AddEditContactScreen.tsx   # Add/edit contacts
│   │   └── QuizScreen.tsx             # ASR quiz
│   ├── services/
│   │   ├── database.ts                # SQLite operations
│   │   └── mnemonicGenerator.ts       # AI hook generator
│   ├── utils/
│   │   └── sm2Algorithm.ts            # SuperMemo 2 logic
│   ├── theme/
│   │   ├── colors.ts                  # Design tokens
│   │   └── commonStyles.ts            # Shared styles
│   └── components/                    # Reusable components
├── assets/                            # Images and icons
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Or use Expo Go app on your physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memorytool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

### Building for Production

```bash
# For iOS
npm run ios

# For Android
npm run android
```

## Usage Guide

### Adding a Contact

1. Tap "Add Contact" on the home screen
2. Take a photo or select from gallery
3. Enter the person's name
4. Add context notes (where/when you met)
5. Tap "Generate Mnemonic Hook" for AI assistance
6. Edit the mnemonic to your preference
7. Save the contact

### Reviewing Contacts

1. The home screen shows a "Review" button when contacts are due
2. Tap to start the quiz
3. View the photo and context
4. Try to recall the name
5. Tap "Show Answer" to reveal
6. Rate your recall quality (0-5):
   - 0: Complete blackout
   - 1: Incorrect, but answer seemed familiar
   - 2: Incorrect, but answer seemed easy
   - 3: Correct with serious difficulty
   - 4: Correct after some hesitation
   - 5: Perfect recall

### Understanding the SM-2 Algorithm

The app uses the SuperMemo 2 algorithm to optimize review scheduling:

- **First review**: 1 day after creation
- **Second review**: 6 days after first correct response
- **Subsequent reviews**: Interval multiplied by easiness factor (1.3-2.5)
- **Failed reviews (rating < 3)**: Reset to 1-day interval

The easiness factor adjusts based on your performance:
- Higher ratings increase the factor (longer intervals)
- Lower ratings decrease the factor (shorter intervals)
- Minimum factor is 1.3 to prevent extremely long intervals

## Design Philosophy

**Minimalist & Professional**: Clean, high-contrast interface with sans-serif fonts
**Function over Form**: Every element serves a purpose
**Speed First**: Optimized for quick capture and efficient review
**Cognitive Science**: Based on proven memory techniques and spaced repetition research

## Future Enhancements

### LLM Integration

The mnemonic generator currently uses placeholder templates. To integrate with an LLM API:

1. Open `src/services/mnemonicGenerator.ts`
2. Replace the `generateMnemonicHook` function with actual API calls
3. Example implementation provided in code comments

Recommended APIs:
- Anthropic Claude API
- OpenAI GPT API
- Google Gemini API

### Additional Features

- Export/import contacts
- Statistics and progress tracking
- Custom review schedules
- Social features (share mnemonics)
- Voice recording for pronunciation
- Integration with phone contacts

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Use TypeScript for all new code
2. Follow the existing code structure
3. Maintain the minimalist design philosophy
4. Test on both iOS and Android
5. Update documentation as needed

## License

[Add your license here]

## Acknowledgments

- SuperMemo 2 algorithm by Piotr Woźniak
- React Native and Expo teams
- Cognitive science research on memory and spaced repetition

---

**Note**: This is an MVP (Minimum Viable Product). The AI mnemonic generator uses placeholder logic. For production use, integrate with a proper LLM API service.
