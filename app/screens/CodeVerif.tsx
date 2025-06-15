import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CircularNextButton from '../../components/CircularNextButton';

export default function VerifyCodePage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber, countryCode } = route.params;

  const inputRefs = useRef([]);
  inputRefs.current = Array(6).fill(1).map((_, i) => inputRefs.current[i] ?? React.createRef());

  const handleCodeChange = (index, value) => {
    if (value.length > 1 || !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }

    if (value === '' && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  useEffect(() => {
    if (timer === 0) return;
    const timerId = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timer]);

  const isComplete = code.every(digit => digit !== '');

  const verifyOTPCode = async () => {
    try {
      let fullPhoneNumber = `+${countryCode}${phoneNumber}`; // Ensure proper formatting

      // Fix duplicate +91 issue before sending request
      fullPhoneNumber = fullPhoneNumber.replace(/^(\+91)(\+91)?/, '+91');

      console.log('✅ Sending OTP verification request for:', fullPhoneNumber);
      
      const response = await fetch('http://172.20.10.4:5000/api/auth/verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber, code: code.join('') }),
      });

      const result = await response.json();
      console.log('OTP Verification Result:', result);

      if (result.success) {
        Alert.alert('Success', 'OTP verified successfully.');
        navigation.navigate('Intro');
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', `An error occurred while verifying the OTP: ${error.message}`);
    }
};


  
  

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.description}>Enter the code we've sent by text to {phoneNumber}.</Text>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Code</Text>
            <View style={styles.codeInputContainer}>
              {Array(6).fill(0).map((_, index) => (
                <TextInput
                  key={index}
                  style={styles.inputField}
                  keyboardType="numeric"
                  maxLength={1}
                  value={code[index]}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  ref={inputRefs.current[index]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.timerText}>This code should arrive within {timer}s</Text>
        </View>
      </ScrollView>

      <CircularNextButton onPress={verifyOTPCode} disabled={!isComplete || timer <= 0} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  changeNumber: {
    fontSize: 16,
    color: 'black',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inputField: {
    width: 50,
    height: 50,
    borderColor: '#acb7ae',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
});
