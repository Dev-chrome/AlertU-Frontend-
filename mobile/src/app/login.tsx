import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/ui/auth';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const { user, isSigningIn, authError, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user]);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <AuthHeader />

        <Text
          weight="semibold"
          className="mt-7 text-[29px] leading-9 tracking-[-0.5px] text-navy">
          Welcome Back
        </Text>
        <Text className="mt-2 text-[12.5px] leading-5 text-muted">
          Sign in with your Google account to report incidents, follow campus
          updates, and receive alerts.
        </Text>

        <View className="mt-8 rounded-2xl border border-line bg-canvas px-5 py-6">
          <View className="mb-4 h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="shield-checkmark" size={22} color={palette.blue} />
          </View>
          <Text weight="semibold" className="text-[15px] text-navy">
            One account, verified by Google
          </Text>
          <Text className="mt-1.5 text-[11.5px] leading-5 text-muted">
            AlertU uses Google Sign-In through Firebase. We never see or store
            your Google password.
          </Text>
        </View>

        {authError ? (
          <View className="mt-5 rounded-xl border border-alert-pink bg-[#FFF5F6] px-4 py-3">
            <Text className="text-[11.5px] leading-5 text-brand-red">
              {authError}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          label={isSigningIn ? 'Signing in…' : 'Continue with Google'}
          variant="outline"
          className="mt-7"
          icon="logo-google"
          loading={isSigningIn}
          onPress={() => {
            void signInWithGoogle();
          }}
        />

        <Text className="mt-4 px-2 text-center text-[10.5px] leading-5 text-subtle">
          By continuing, you agree to AlertU&apos;s Terms of Service and Privacy
          Policy.
        </Text>

        <View className="mt-auto pt-10">
          <Text className="text-center text-[12px] text-muted">
            New to AlertU? Signing in with Google creates your account
            automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
