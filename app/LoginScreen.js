import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '1000469253725-44r7lhh6hji434d811bilueoikjn62bj.apps.googleusercontent.com',
  offlineAccess: true,
});

async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut();

    const signInResult = await GoogleSignin.signIn();

    const idToken =
      signInResult?.idToken ||
      signInResult?.user?.idToken ||
      signInResult?.data?.idToken;

    if (!idToken) {
      console.warn('⚠️ No ID token found in Google Sign-In response');
      throw new Error('Google Sign-In failed. Please try again.');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export default function LoginScreen({ navigation }) {
  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await onGoogleButtonPress();
      const email = userCredential?.user?.email || 'Unknown';
      Alert.alert('🎉 Welcome!', email);
      navigation.navigate('TodoScreen', { email });
    } catch (error) {
      let message = 'Google Sign-In failed.';
      if (error?.code === 'auth/account-exists-with-different-credential') {
        message = 'Account exists with a different sign-in method.';
      } else if (error?.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert('⚠️ Login Failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b8d99" />
      <Text style={styles.title}>🌟 Daily Activity App</Text>
      <Text style={styles.subtitle}>Organize. Accomplish. Repeat.</Text>

      <TouchableOpacity
        style={styles.googleButton}
        activeOpacity={0.85}
        onPress={handleGoogleSignIn}
      >
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b8d99',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d0f0f5',
    marginBottom: 50,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  googleIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  googleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
