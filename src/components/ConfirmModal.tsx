import { View, Text } from '@tarojs/components';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const TYPE_CONFIG = {
  warning: {
    icon: '⚠️',
    iconBg: '#fff7ed',
    iconColor: '#f97316',
    confirmBg: '#f97316',
  },
  danger: {
    icon: '⚠️',
    iconBg: '#fef2f2',
    iconColor: '#ef4444',
    confirmBg: '#ef4444',
  },
  info: {
    icon: 'ℹ️',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
    confirmBg: '#3b82f6',
  },
};

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const config = TYPE_CONFIG[type];

  return (
    <View style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }} onClick={onCancel}>
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '32px 24px 24px',
        width: '80%',
        maxWidth: '320px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }} onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); }}>
        <View style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: config.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Text style={{ fontSize: '28px' }}>{config.icon}</Text>
        </View>

        <Text style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px',
          textAlign: 'center',
        }}>{title}</Text>

        <Text style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '20px',
          marginBottom: '24px',
        }}>{description}</Text>

        <View style={{
          display: 'flex',
          width: '100%',
          gap: '12px',
        }}>
          <View style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); onCancel(); }}>
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#6b7280' }}>{cancelText}</Text>
          </View>
          <View style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            backgroundColor: config.confirmBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); onConfirm(); }}>
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{confirmText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
