/**
 * useInfoModal - Hook for styled InfoModal replacement of Alert.alert
 * ===================================================================
 * Provides showInfo, showError, showWarning, showSuccess helpers
 * and the modal state + component props to render.
 */

import { useState, useCallback } from 'react';

type ModalType = 'success' | 'error' | 'warning' | 'info';

interface InfoModalAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  type: ModalType;
  actions?: InfoModalAction[];
}

export function useInfoModal() {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = useCallback((type: ModalType, title: string, message: string, actions?: InfoModalAction[]) => {
    setModalState({ visible: true, title, message, type, actions });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
  }, []);

  const showInfo = useCallback((title: string, message: string, actions?: InfoModalAction[]) => {
    showModal('info', title, message, actions);
  }, [showModal]);

  const showError = useCallback((title: string, message: string, actions?: InfoModalAction[]) => {
    showModal('error', title, message, actions);
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string, actions?: InfoModalAction[]) => {
    showModal('warning', title, message, actions);
  }, [showModal]);

  const showSuccess = useCallback((title: string, message: string, actions?: InfoModalAction[]) => {
    showModal('success', title, message, actions);
  }, [showModal]);

  return {
    modalState,
    hideModal,
    showInfo,
    showError,
    showWarning,
    showSuccess,
  };
}
