# Finance App — Mobile UI/UX Guidelines (Gluestack UI v2)

> Design guidelines for the Expo mobile app using **Gluestack UI v2**.
> Gluestack UI v2 is built on top of NativeWind (Tailwind CSS for React Native) with an accessible component library.

---

## Core Design Philosophy

1. **Speed first** — the most common action (add transaction) must be reachable in 1 tap
2. **Dark by default** — dark mode is the primary theme using Gluestack's dark tokens
3. **Dense but readable** — show more data per screen without cluttering
4. **Tactile feedback** — every tap has haptic + visual feedback
5. **Gluestack primitives** — use `Box`, `VStack`, `HStack`, `Text`, `Button`, `Badge`, etc. everywhere

---

## Setup & Configuration

### Installation
```bash
npx expo install @gluestack-ui/themed @gluestack-style/react \
  nativewind tailwindcss react-native-svg \
  lucide-react-native
```

### Gluestack Provider (app/_layout.tsx)
```tsx
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

export default function RootLayout() {
  return (
    <GluestackUIProvider config={config} colorMode="dark">
      <Stack />
    </GluestackUIProvider>
  );
}
```

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366F1', dark: '#4F46E5', light: '#818CF8' },
        income:  '#10B981',
        expense: '#EF4444',
        surface: { DEFAULT: '#1C1C1E', '2': '#2C2C2E', '3': '#3A3A3C' },
      },
    },
  },
};
```

---

## Color System

Use Gluestack's semantic token names combined with custom tokens.

```typescript
// constants/tokens.ts
export const tokens = {
  // Override via Gluestack config
  colors: {
    // Brand
    primary300: '#818CF8',   // Indigo 400
    primary400: '#6366F1',   // Indigo 500
    primary500: '#4F46E5',   // Indigo 600

    // Semantic (map to Gluestack success/error/warning)
    success400: '#10B981',   // Income — Emerald 500
    error400:   '#EF4444',   // Expense — Red 500
    warning400: '#F59E0B',   // Budget alert — Amber 500

    // Surfaces (dark mode)
    backgroundDark950: '#0F0F11',   // App background
    backgroundDark900: '#1C1C1E',   // Card / Sheet
    backgroundDark800: '#2C2C2E',   // Input background
    backgroundDark700: '#3A3A3C',   // Pressed state

    // Text
    textDark50:  '#FFFFFF',
    textDark200: '#E5E7EB',
    textDark400: '#9CA3AF',   // Muted
    textDark500: '#6B7280',   // Disabled
  },
};
```

---

## Typography with Gluestack

```tsx
// Use Gluestack <Heading> and <Text> with size props
import { Heading, Text } from '@gluestack-ui/themed';

// Heading sizes: '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
// Text sizes:    'xl' | 'lg' | 'md' | 'sm' | 'xs'

// Currency amounts — pair with Roboto Mono font
<Heading size="3xl" fontFamily="$mono">Rp 1,234,567</Heading>

// Section label
<Heading size="lg">Recent Transactions</Heading>

// Muted helper text
<Text size="sm" color="$textLight400">vs last month</Text>
```

---

## Key Gluestack Components Used

### Box & VStack & HStack
```tsx
import { Box, VStack, HStack } from '@gluestack-ui/themed';

// Card container
<Box bg="$backgroundDark900" borderRadius="$lg" p="$4" mx="$4">
  <VStack space="sm">
    <HStack justifyContent="space-between" alignItems="center">
      {/* ... */}
    </HStack>
  </VStack>
</Box>
```

### Button
```tsx
import { Button, ButtonText, ButtonIcon } from '@gluestack-ui/themed';
import { PlusIcon } from 'lucide-react-native';

// Primary CTA
<Button size="lg" variant="solid" action="primary" borderRadius="$lg">
  <ButtonText>Save Transaction</ButtonText>
</Button>

// FAB (Floating Action Button)
<Button
  size="lg"
  variant="solid"
  action="primary"
  borderRadius="$full"
  w="$16" h="$16"
  position="absolute"
  bottom="$6" alignSelf="center"
>
  <ButtonIcon as={PlusIcon} size="xl" />
</Button>
```

### Input
```tsx
import { Input, InputField, InputSlot, InputIcon } from '@gluestack-ui/themed';

<Input variant="filled" size="md" borderRadius="$md">
  <InputSlot pl="$3">
    <InputIcon as={SearchIcon} />
  </InputSlot>
  <InputField
    placeholder="Search transactions..."
    placeholderTextColor="$textDark500"
  />
</Input>
```

### Badge
```tsx
import { Badge, BadgeText } from '@gluestack-ui/themed';

// Transaction type badge
<Badge action="success" variant="solid" borderRadius="$full">
  <BadgeText>Income</BadgeText>
</Badge>

<Badge action="error" variant="solid" borderRadius="$full">
  <BadgeText>Expense</BadgeText>
</Badge>
```

### Progress (for budgets)
```tsx
import { Progress, ProgressFilledTrack } from '@gluestack-ui/themed';

// Green: < 70%, Yellow: 70–90%, Red: > 90%
const progressColor = pct < 70 ? '$success400' : pct < 90 ? '$warning400' : '$error400';

<Progress value={pct} size="sm" bg="$backgroundDark800">
  <ProgressFilledTrack bg={progressColor} />
</Progress>
```

### Divider
```tsx
import { Divider } from '@gluestack-ui/themed';
<Divider bg="$borderDark700" my="$2" />
```

### Spinner / Skeleton
```tsx
import { Spinner } from '@gluestack-ui/themed';
<Spinner size="large" color="$primary400" />
```

### Toast / Alert (Gluestack)
```tsx
import { useToast, Toast, ToastDescription } from '@gluestack-ui/themed';

const toast = useToast();
toast.show({
  placement: 'top',
  render: () => (
    <Toast action="success">
      <ToastDescription>Transaction saved!</ToastDescription>
    </Toast>
  ),
});
```

---

## Screen-Specific Layouts

### Dashboard (Home Tab)

```tsx
<SafeAreaView className="flex-1 bg-[#0F0F11]">
  <ScrollView>
    {/* Header */}
    <Box px="$4" pt="$4" pb="$2">
      <Text size="sm" color="$textDark400">Good morning,</Text>
      <Heading size="xl">{user.name}</Heading>
    </Box>

    {/* Total Balance */}
    <Box px="$4" py="$3">
      <Text size="sm" color="$textDark400">Total Balance</Text>
      <Heading size="4xl" fontFamily="$mono" color="$textDark50">
        {formatCurrency(totalBalance)}
      </Heading>
    </Box>

    {/* Income / Expense Cards */}
    <HStack px="$4" space="md">
      <SummaryCard type="income" amount={income} />
      <SummaryCard type="expense" amount={expense} />
    </HStack>

    {/* Wallets Carousel */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} px="$4">
      {wallets.map(wallet => <WalletCard key={wallet.id} wallet={wallet} />)}
    </ScrollView>

    {/* Recent Transactions */}
    <VStack px="$4" space="sm">
      <HStack justifyContent="space-between">
        <Heading size="md">Recent</Heading>
        <Button variant="link" size="sm"><ButtonText>See All</ButtonText></Button>
      </HStack>
      {recentTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
    </VStack>
  </ScrollView>
</SafeAreaView>
```

### Add Transaction (Bottom Sheet)

```tsx
// Uses @gorhom/bottom-sheet + Gluestack components
<BottomSheet snapPoints={['95%']} backgroundStyle={{ backgroundColor: '#1C1C1E' }}>
  <BottomSheetScrollView>
    <VStack px="$4" space="lg">

      {/* Type Toggle */}
      <HStack bg="$backgroundDark800" borderRadius="$full" p="$1">
        <Button flex={1} variant={type === 'income' ? 'solid' : 'outline'}
          action="success" borderRadius="$full"
          onPress={() => setType('income')}>
          <ButtonText>Income</ButtonText>
        </Button>
        <Button flex={1} variant={type === 'expense' ? 'solid' : 'outline'}
          action="error" borderRadius="$full"
          onPress={() => setType('expense')}>
          <ButtonText>Expense</ButtonText>
        </Button>
      </HStack>

      {/* Amount Input — largest, most prominent */}
      <Box alignItems="center" py="$4">
        <Heading size="5xl" fontFamily="$mono">
          {amount || '0'}
        </Heading>
        <Text size="sm" color="$textDark400">Amount (IDR)</Text>
      </Box>

      {/* Form Fields */}
      <FormControl>
        <FormControlLabel><FormControlLabelText>Category</FormControlLabelText></FormControlLabel>
        <CategoryPicker value={categoryId} onChange={setCategoryId} />
      </FormControl>

      <FormControl>
        <FormControlLabel><FormControlLabelText>Wallet</FormControlLabelText></FormControlLabel>
        <WalletPicker value={walletId} onChange={setWalletId} />
      </FormControl>

      <FormControl>
        <FormControlLabel><FormControlLabelText>Date</FormControlLabelText></FormControlLabel>
        <DateInput value={date} onChange={setDate} />
      </FormControl>

      <FormControl>
        <FormControlLabel><FormControlLabelText>Notes (optional)</FormControlLabelText></FormControlLabel>
        <Input variant="filled" borderRadius="$md">
          <InputField placeholder="Add a note..." value={notes} onChangeText={setNotes} />
        </Input>
      </FormControl>

      {/* Submit */}
      <Button size="lg" action="primary" borderRadius="$lg" onPress={handleSubmit}>
        <ButtonText>Save Transaction</ButtonText>
      </Button>

    </VStack>
  </BottomSheetScrollView>
</BottomSheet>
```

### Transaction List Item Component

```tsx
function TransactionItem({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'income';
  return (
    <Pressable>
      <HStack space="md" alignItems="center" py="$3">
        {/* Category Icon */}
        <Box
          w="$10" h="$10" borderRadius="$full"
          bg={tx.category?.color + '33'}
          alignItems="center" justifyContent="center"
        >
          <Text>{tx.category?.icon ?? '💸'}</Text>
        </Box>

        {/* Info */}
        <VStack flex={1}>
          <Text fontWeight="$medium">{tx.notes || tx.category?.name || 'Transaction'}</Text>
          <Text size="xs" color="$textDark400">{tx.wallet?.name} • {formatDate(tx.date)}</Text>
        </VStack>

        {/* Amount */}
        <Text
          fontWeight="$bold"
          color={isIncome ? '$success400' : '$error400'}
          fontFamily="$mono"
        >
          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
        </Text>
      </HStack>
    </Pressable>
  );
}
```

---

## Navigation Structure

### Tab Bar (5 tabs)

```tsx
// app/(tabs)/_layout.tsx
<Tabs
  screenOptions={{
    tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#374151' },
    tabBarActiveTintColor: '#6366F1',
    tabBarInactiveTintColor: '#6B7280',
  }}
>
  <Tabs.Screen name="index"        options={{ title: 'Home', tabBarIcon: ... }} />
  <Tabs.Screen name="transactions" options={{ title: 'Transactions', tabBarIcon: ... }} />
  {/* Center FAB — not a real tab */}
  <Tabs.Screen name="add"          options={{ tabBarButton: () => <FABButton /> }} />
  <Tabs.Screen name="wallets"      options={{ title: 'Wallets', tabBarIcon: ... }} />
  <Tabs.Screen name="more"         options={{ title: 'More', tabBarIcon: ... }} />
</Tabs>
```

---

## Haptics

```typescript
import * as Haptics from 'expo-haptics';

// On FAB press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On save success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// On error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// On tab change
Haptics.selectionAsync();
```

---

## Empty States

```tsx
<VStack flex={1} alignItems="center" justifyContent="center" space="md" p="$8">
  <Box opacity={0.4}>
    <ReceiptIcon size={64} color="#9CA3AF" />
  </Box>
  <Heading size="md" textAlign="center">No transactions yet</Heading>
  <Text size="sm" color="$textDark400" textAlign="center">
    Tap the + button to record your first transaction
  </Text>
</VStack>
```

---

## Loading / Skeleton

Use a simple animated opacity shimmer for skeleton states:
```tsx
// components/ui/Skeleton.tsx
import { Box } from '@gluestack-ui/themed';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function Skeleton({ h = '$4', w = '100%', borderRadius = '$md' }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ opacity }}>
      <Box h={h} w={w} bg="$backgroundDark800" borderRadius={borderRadius} />
    </Animated.View>
  );
}
```

---

## Wallet Card Component (Colored Gradient)

```tsx
import { LinearGradient } from 'expo-linear-gradient';

function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <LinearGradient
      colors={[wallet.color, shadeColor(wallet.color, -20)]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: 260, borderRadius: 20, padding: 20, marginRight: 12 }}
    >
      <HStack justifyContent="space-between" alignItems="center" mb="$4">
        <Text color="white" opacity={0.8}>{wallet.icon} {wallet.name}</Text>
        <Badge variant="outline" borderColor="white20"><BadgeText color="white">{wallet.type}</BadgeText></Badge>
      </HStack>
      <Heading size="2xl" color="white" fontFamily="$mono">
        {formatCurrency(wallet.current_balance)}
      </Heading>
    </LinearGradient>
  );
}
```
