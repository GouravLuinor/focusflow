import { useState, useRef, useCallback } from 'react';

interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000'
  : window.location.origin;

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isProcessing: false,
    error: null,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setState({ isRecording: true, isProcessing: false, error: null });
    } catch {
      setState({
        isRecording: false,
        isProcessing: false,
        error: 'Microphone access denied. Please allow microphone permissions.',
      });
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        setState({ isRecording: false, isProcessing: true, error: null });

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          setState({ isRecording: false, isProcessing: false, error: null });
          resolve(data.text);
        } catch {
          setState({
            isRecording: false,
            isProcessing: false,
            error: 'Failed to transcribe audio. Please try again or type manually.',
          });
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder.stop();
    }
    setState({ isRecording: false, isProcessing: false, error: null });
  }, []);

  return {
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    error: state.error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
