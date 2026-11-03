import { Redirect } from 'expo-router';

export default function SignUpScreen() {
  // Google Sign-In creates the AlertU account on first use, so there is no
  // separate password form.
  return <Redirect href="/login" />;
}
