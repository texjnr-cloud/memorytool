# CORE App Architecture

## Overview

CORE (Contextual Recall Engine) is built using a clean, modular architecture that separates concerns and makes the codebase maintainable and extensible.

## Core Principles

1. **Separation of Concerns**: UI, business logic, and data access are clearly separated
2. **Type Safety**: TypeScript throughout for compile-time error detection
3. **Local-First**: All data stored locally using SQLite for privacy and offline support
4. **Performance**: Optimized for speed with minimal re-renders and efficient queries
5. **Scalability**: Ready for future enhancements like cloud sync and LLM integration

## Architecture Layers

### 1. Presentation Layer (Screens & Components)

**Location**: `src/screens/`, `src/components/`

- **ContactListScreen**: Displays all contacts with search functionality
- **AddEditContactScreen**: Form for creating/editing contacts with photo capture
- **QuizScreen**: ASR quiz interface with SM-2 algorithm integration

**Responsibilities**:
- Render UI elements
- Handle user interactions
- Call service layer for data operations
- Manage local component state

### 2. Service Layer

**Location**: `src/services/`

#### Database Service (`database.ts`)

Provides abstraction over SQLite operations:
- `initDatabase()`: Creates tables and indexes
- `createContact()`, `updateContact()`, `deleteContact()`: CRUD operations
- `getAllContacts()`, `searchContacts()`: Queries
- `getContactsDueForReview()`: ASR-specific queries

**Design Pattern**: Repository pattern for data access abstraction

#### Mnemonic Generator Service (`mnemonicGenerator.ts`)

Generates memory hooks for names:
- Currently uses template-based placeholder
- Ready for LLM API integration
- Simulates async API call for realistic UX

**Future Integration Point**: Replace placeholder with actual LLM calls

### 3. Business Logic Layer

**Location**: `src/utils/`

#### SM-2 Algorithm (`sm2Algorithm.ts`)

Implements SuperMemo 2 spaced repetition algorithm:
- `calculateSM2()`: Core algorithm implementation
- `isDueForReview()`: Check if contact needs review
- `getDaysUntilReview()`: Calculate days until next review

**Algorithm Details**:
```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

Where:
- EF: Easiness Factor (1.3 minimum)
- q: Quality of response (0-5)
- Interval schedule:
  - First repetition: 1 day
  - Second repetition: 6 days
  - Subsequent: interval * EF
  - Failed (q < 3): Reset to 1 day
```

### 4. Data Layer

**Location**: `src/models/`

#### Contact Model (`Contact.ts`)

TypeScript interfaces defining data structures:
```typescript
interface Contact {
  id: string;
  name: string;
  photoUri: string;
  contextNotes: string;
  mnemonicHook: string;
  lastReviewDate: string;
  nextReviewDate: string;
  easinessFactor: number;
  repetitionCount?: number;
  intervalDays?: number;
}
```

### 5. Theme Layer

**Location**: `src/theme/`

Centralized design system:
- `colors.ts`: Color palette, spacing, typography tokens
- `commonStyles.ts`: Reusable style objects

**Design Tokens**:
- Colors: Primary (black), secondary (blue), functional colors
- Spacing: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- Typography: System fonts with sizes from xs(12) to xxxl(40)

## Data Flow

### Adding a Contact

```
User Input
    ↓
AddEditContactScreen
    ↓
generateMnemonicHook() → mnemonicGenerator
    ↓
createContact() → database service
    ↓
SQLite Database
```

### Quiz Flow

```
Quiz Start
    ↓
getContactsDueForReview() → database service
    ↓
Display Contact (photo + context)
    ↓
User Rates Recall (0-5)
    ↓
calculateSM2() → SM-2 algorithm
    ↓
updateContact() with new schedule → database service
    ↓
Next Contact or End Quiz
```

## Database Schema

### Contacts Table

```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  photoUri TEXT,
  contextNotes TEXT,
  mnemonicHook TEXT,
  lastReviewDate TEXT NOT NULL,
  nextReviewDate TEXT NOT NULL,
  easinessFactor REAL NOT NULL DEFAULT 2.5,
  repetitionCount INTEGER DEFAULT 0,
  intervalDays INTEGER DEFAULT 0
);

CREATE INDEX idx_nextReviewDate ON contacts(nextReviewDate);
CREATE INDEX idx_name ON contacts(name);
```

## Navigation Structure

```
NavigationContainer
  └── Stack Navigator
      ├── ContactList (headerShown: false)
      ├── AddContact (modal)
      ├── EditContact (push)
      └── Quiz (fullScreenModal)
```

**Navigation Flow**:
1. App starts at ContactList
2. Add/Edit opens as modal/push
3. Quiz opens as full-screen modal
4. All screens can navigate back

## State Management

**Approach**: Local component state with React hooks

- `useState`: Local UI state (form inputs, loading states)
- `useEffect`: Side effects (data loading, subscriptions)
- `useFocusEffect`: Screen focus detection for data refresh

**Why No Global State?**:
- Simple app with independent screens
- Database is source of truth
- No complex shared state requirements
- Can add Redux/Context later if needed

## Performance Optimizations

1. **Database Indexing**: Indexes on `nextReviewDate` and `name`
2. **Lazy Loading**: FlatList for efficient list rendering
3. **Image Optimization**: Expo Image Picker with quality settings
4. **Minimal Re-renders**: Proper key props and memoization where needed

## Security Considerations

1. **Local Storage Only**: No cloud storage in MVP (user privacy)
2. **No Authentication**: Single-device app
3. **Photo Permissions**: Requested only when needed
4. **SQL Injection**: Parameterized queries throughout

## Testing Strategy

### Unit Tests
- SM-2 algorithm calculations
- Date utilities
- Mnemonic generator templates

### Integration Tests
- Database operations
- Navigation flows
- Quiz flow with SM-2 updates

### E2E Tests
- Add contact flow
- Complete quiz flow
- Search functionality

## Future Architecture Enhancements

### Phase 1: LLM Integration
- Add API client service
- Implement retry logic and error handling
- Cache common mnemonic patterns

### Phase 2: Cloud Sync
- Add authentication layer
- Implement sync service
- Conflict resolution strategy

### Phase 3: Analytics
- Add analytics service
- Track learning metrics
- Generate insights

### Phase 4: Offline-First PWA
- Service worker for web version
- IndexedDB adapter
- Progressive enhancement

## Development Guidelines

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add route to navigation in `App.tsx`
3. Import required services
4. Follow existing styling patterns
5. Update README with new feature

### Adding a New Service

1. Create service file in `src/services/`
2. Define TypeScript interfaces
3. Implement with error handling
4. Export public API
5. Document usage in code comments

### Modifying Database Schema

1. Update schema in `database.ts`
2. Add migration logic if needed
3. Update TypeScript interfaces
4. Test with existing data
5. Document breaking changes

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Follow existing patterns
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for public APIs
- **Async/Await**: Prefer over promises
- **Error Handling**: Try-catch with user-friendly alerts

## Dependencies

### Core Dependencies
- `expo`: SDK framework
- `react-native`: Mobile framework
- `@react-navigation/*`: Navigation
- `expo-sqlite`: Local database
- `expo-image-picker`: Photo handling
- `uuid`: ID generation

### Dev Dependencies
- `typescript`: Type checking
- `@types/*`: Type definitions
- `@babel/core`: Transpilation

## Build & Deployment

### Development
```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

### Production
```bash
eas build --platform ios
eas build --platform android
eas submit
```

## Monitoring & Debugging

- **Expo DevTools**: Network, logs, performance
- **React Native Debugger**: Redux DevTools, Network Inspector
- **Flipper**: Native debugging
- **Console Logs**: Strategic logging throughout

---

This architecture provides a solid foundation for the MVP while remaining flexible for future enhancements.
